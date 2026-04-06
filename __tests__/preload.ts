// Test preload - mock server-only before any tests run
import { mock } from "bun:test";

// server-only throws in non-Next.js environments, mock it for tests
mock.module("server-only", () => ({}));
