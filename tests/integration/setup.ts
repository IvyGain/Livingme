import { vi } from "vitest";

// Mock server-only modules
vi.mock("server-only", () => ({}));

// Mock Next.js cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Mock Next.js navigation (headers / redirect)
vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Map()),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

// Prevent real DB connections in unit tests
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.NEXTAUTH_SECRET = "test-secret-for-vitest-32-chars-min";
process.env.NEXTAUTH_URL = "http://localhost:3000";
