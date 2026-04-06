/**
 * Server entry point for Next.js with strict server-only protection.
 *
 * This module re-exports everything from ./server but adds the server-only
 * import to prevent accidental client-side imports in Next.js projects.
 *
 * Use this in Next.js App Router projects for maximum safety.
 * For Vite/vinext projects, use @nocoo/next-ai/server instead.
 */
import "server-only";

export * from "./server";
