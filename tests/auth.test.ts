import { describe, it, expect, beforeEach } from "vitest";
import { getToken, setToken, clearToken } from "@/lib/auth";

const STORAGE_KEY = "pk_admin_token";

describe("lib/auth", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when no token is stored", () => {
    expect(getToken()).toBeNull();
  });

  it("stores and retrieves token", () => {
    setToken("test-jwt-token");
    expect(getToken()).toBe("test-jwt-token");
  });

  it("clears token", () => {
    setToken("test-jwt-token");
    clearToken();
    expect(getToken()).toBeNull();
  });

  it("uses correct localStorage key", () => {
    setToken("my-token");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("my-token");
  });
});
