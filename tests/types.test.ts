import { describe, it, expect } from "vitest";
import {
  EVALUATION_WEIGHT_FIELDS,
  EVALUATION_LABELS,
  CHAT_ALLOWED_STATUSES,
} from "@/lib/types";

describe("lib/types constants", () => {
  it("EVALUATION_WEIGHT_FIELDS has 6 fields", () => {
    expect(EVALUATION_WEIGHT_FIELDS).toHaveLength(6);
  });

  it("EVALUATION_LABELS has matching keys for all weight fields", () => {
    for (const field of EVALUATION_WEIGHT_FIELDS) {
      expect(EVALUATION_LABELS[field]).toBeDefined();
      expect(typeof EVALUATION_LABELS[field]).toBe("string");
    }
  });

  it("CHAT_ALLOWED_STATUSES includes menunggu_tes, seleksi_berkas_lolos, and active", () => {
    expect(CHAT_ALLOWED_STATUSES).toContain("menunggu_tes");
    expect(CHAT_ALLOWED_STATUSES).toContain("seleksi_berkas_lolos");
    expect(CHAT_ALLOWED_STATUSES).toContain("active");
    expect(CHAT_ALLOWED_STATUSES).not.toContain("pending");
    expect(CHAT_ALLOWED_STATUSES).not.toContain("rejected");
  });
});
