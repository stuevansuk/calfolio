import { vi, beforeEach } from "vitest";

export const mockState = {
  session: null as { user: { id: string; email: string } } | null,
  profile: null as Record<string, unknown> | null,
  rateLimitAllowed: true,
};

export function resetMockState() {
  mockState.session = null;
  mockState.profile = null;
  mockState.rateLimitAllowed = true;
}

beforeEach(() => {
  resetMockState();
});
