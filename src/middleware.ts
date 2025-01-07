import { clerkMiddleware } from "@clerk/nextjs/server";

// The simplest way to make webhook routes public
export default clerkMiddleware();

export const config = {
  matcher: [
    // Exclude files with extension and next internal routes
    "/((?!.*\\..*|_next).*)",
    // Include root route
    "/",
    // Include api routes except webhooks
    "/(api(?!/webhooks).*)"
  ]
};