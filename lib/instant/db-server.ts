import { init } from "@instantdb/admin";
import { schema } from "./schema";

// Get APP_ID from environment variable
const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || "";
const ADMIN_TOKEN = process.env.INSTANT_APP_ADMIN_TOKEN || "";

if (!APP_ID) {
  console.warn(
    "NEXT_PUBLIC_INSTANT_APP_ID is not set. Please set it in your .env.local file."
  );
}

// Initialize Instant DB Admin SDK for server-side operations
// Note: adminToken is optional but recommended for production
export const db = init({ 
  appId: APP_ID, 
  schema,
  ...(ADMIN_TOKEN && { adminToken: ADMIN_TOKEN }),
});

// Export types
export type { InstaQLEntity } from "@instantdb/admin";

