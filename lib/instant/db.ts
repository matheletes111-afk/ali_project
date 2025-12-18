import { init } from "@instantdb/react";
import { schema } from "./schema";

// Get APP_ID from environment variable
const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || "";

if (!APP_ID) {
  console.warn(
    "NEXT_PUBLIC_INSTANT_APP_ID is not set. Please set it in your .env.local file."
  );
}

// Initialize Instant DB
export const db = init({ appId: APP_ID, schema });

// Export types
export type { InstaQLEntity } from "@instantdb/react";

