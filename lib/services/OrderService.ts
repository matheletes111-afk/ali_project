import { db } from "@/lib/instant/db";
import { id } from "@instantdb/react";
import { safeJsonParse, safeJsonStringify, generateOrderNumber, generateBookingNumber } from "@/lib/utils/helpers";
import { NotFoundError, ValidationError } from "@/lib/utils/errors";
import { ORDER_STATUS, PAYMENT_STATUS, ORDER_TYPES } from "@/lib/utils/constants";
import type { Order, Booking, OrderItem, Address } from "@/types/entities";
import { productService } from "./ProductService";
import { serviceService } from "./ServiceService";

export class OrderService {
  // Create order
  async createOrder(data: {
    customerId: string;
    storeId: string;
    type: "product" | "service";
    items: Array<{
      productId?: string;
      variantId?: string;
      serviceId?: string;
      quantity: number;
    }>;
    shippingAddress: Address;
    billingAddress?: Address;
    notes?: string;
  }): Promise<string> {
    const orderId = id();
    const orderNumber = generateOrderNumber();
    const now = Date.now();

    // Calculate totals
    let subtotal = 0;
    const orderItems: OrderItem[] = [];

    for (const item of data.items) {
      if (data.type === ORDER_TYPES.PRODUCT && item.variantId) {
        const variant = await productService.getProductVariants(item.variantId).then(
          (variants) => variants.find((v) => v.id === item.variantId)
        );
        if (!variant || !variant.isAvailable) {
          throw new ValidationError(`Variant ${item.variantId} is not available`);
        }
        if (variant.stock !== -1 && variant.stock < item.quantity) {
          throw new ValidationError(`Insufficient stock for variant ${item.variantId}`);
        }
        const itemPrice = variant.price * item.quantity;
        subtotal += itemPrice;
        orderItems.push({
          variantId: item.variantId,
          quantity: item.quantity,
          price: variant.price,
          name: variant.name,
        });
      } else if (data.type === ORDER_TYPES.SERVICE && item.serviceId) {
        const service = await serviceService.getServiceById(item.serviceId);
        if (!service || service.status !== "active") {
          throw new ValidationError(`Service ${item.serviceId} is not available`);
        }
        const itemPrice = service.basePrice * item.quantity;
        subtotal += itemPrice;
        orderItems.push({
          serviceId: item.serviceId,
          quantity: item.quantity,
          price: service.basePrice,
          name: service.title,
        });
      }
    }

    // Calculate tax and shipping (simplified)
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const shipping = subtotal > 50000 ? 0 : 5000; // Free shipping over ₹500
    const total = subtotal + tax + shipping;

    db.transact(
      db.tx.orders[orderId].update({
        orderNumber,
        customerId: data.customerId,
        storeId: data.storeId,
        type: data.type,
        status: ORDER_STATUS.PENDING,
        items: safeJsonStringify(orderItems),
        subtotal,
        tax,
        shipping,
        total,
        paymentStatus: PAYMENT_STATUS.PENDING,
        shippingAddress: safeJsonStringify(data.shippingAddress),
        billingAddress: data.billingAddress ? safeJsonStringify(data.billingAddress) : null,
        notes: data.notes || null,
        createdAt: now,
        updatedAt: now,
      })
    );

    return orderId;
  }

  // Create booking (for services)
  async createBooking(data: {
    customerId: string;
    serviceId: string;
    storeId: string;
    scheduledAt: number;
    location?: Address | "at_store";
    notes?: string;
  }): Promise<string> {
    const bookingId = id();
    const bookingNumber = generateBookingNumber();
    const now = Date.now();

    const service = await serviceService.getServiceById(data.serviceId);
    if (!service || service.status !== "active") {
      throw new NotFoundError("Service");
    }

    const price = service.basePrice;

    db.transact(
      db.tx.bookings[bookingId].update({
        bookingNumber,
        customerId: data.customerId,
        serviceId: data.serviceId,
        storeId: data.storeId,
        scheduledAt: data.scheduledAt,
        duration: service.duration,
        status: "pending",
        price,
        location: typeof data.location === "string" ? data.location : safeJsonStringify(data.location),
        notes: data.notes || null,
        createdAt: now,
        updatedAt: now,
      })
    );

    return bookingId;
  }

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    const result = await db.query({
      orders: {
        $: { where: { id: orderId } },
      },
    });

    const order = result.data?.orders?.[0];
    if (!order) return null;

    return this.mapOrder(order);
  }

  // Get orders by customer
  async getOrdersByCustomer(
    customerId: string,
    filters?: { status?: string; page?: number; limit?: number }
  ): Promise<{ orders: Order[]; total: number }> {
    const where: any = { customerId };
    if (filters?.status) where.status = filters.status;

    const result = await db.query({
      orders: {
        $: { where },
      },
    });

    const orders = result.data?.orders || [];
    const total = orders.length;

    const limit = filters?.limit || 20;
    const skip = ((filters?.page || 1) - 1) * limit;
    const paginated = orders.slice(skip, skip + limit);

    return {
      orders: paginated.map((o: any) => this.mapOrder(o)),
      total,
    };
  }

  // Get orders by store (seller view)
  async getOrdersByStore(
    storeId: string,
    filters?: { status?: string; page?: number; limit?: number }
  ): Promise<{ orders: Order[]; total: number }> {
    const where: any = { storeId };
    if (filters?.status) where.status = filters.status;

    const result = await db.query({
      orders: {
        $: { where },
      },
    });

    const orders = result.data?.orders || [];
    const total = orders.length;

    const limit = filters?.limit || 20;
    const skip = ((filters?.page || 1) - 1) * limit;
    const paginated = orders.slice(skip, skip + limit);

    return {
      orders: paginated.map((o: any) => this.mapOrder(o)),
      total,
    };
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new NotFoundError("Order");
    }

    db.transact(
      db.tx.orders[orderId].update({
        status,
        updatedAt: Date.now(),
      })
    );
  }

  // Get booking by ID
  async getBookingById(bookingId: string): Promise<Booking | null> {
    const result = await db.query({
      bookings: {
        $: { where: { id: bookingId } },
      },
    });

    const booking = result.data?.bookings?.[0];
    if (!booking) return null;

    return this.mapBooking(booking);
  }

  // Get bookings by customer
  async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    const result = await db.query({
      bookings: {
        $: { where: { customerId } },
      },
    });

    const bookings = result.data?.bookings || [];
    return bookings.map((b: any) => this.mapBooking(b));
  }

  private mapOrder(order: any): Order {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      storeId: order.storeId,
      type: order.type as any,
      status: order.status as any,
      items: safeJsonParse<OrderItem[]>(order.items) || [],
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      paymentStatus: order.paymentStatus as any,
      shippingAddress: order.shippingAddress
        ? safeJsonParse<Address>(order.shippingAddress)
        : undefined,
      billingAddress: order.billingAddress ? safeJsonParse<Address>(order.billingAddress) : undefined,
      notes: order.notes || undefined,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private mapBooking(booking: any): Booking {
    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      customerId: booking.customerId,
      serviceId: booking.serviceId,
      storeId: booking.storeId,
      scheduledAt: booking.scheduledAt,
      duration: booking.duration,
      status: booking.status as any,
      price: booking.price,
      location:
        booking.location === "at_store"
          ? "at_store"
          : safeJsonParse<Address>(booking.location) || undefined,
      notes: booking.notes || undefined,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}

export const orderService = new OrderService();

