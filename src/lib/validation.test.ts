import { describe, it, expect } from "vitest";
import { validateNarrativeInput, narrativeInputSchema } from "./validation";

describe("validateNarrativeInput", () => {
  it("should return success for valid input", () => {
    const result = validateNarrativeInput(
      "This is a valid input with more than 10 characters",
      "activist"
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.input).toBe("This is a valid input with more than 10 characters");
      expect(result.data.tone).toBe("activist");
    }
  });

  it("should fail for input less than 10 characters", () => {
    const result = validateNarrativeInput("short", "activist");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("10 characters");
    }
  });

  it("should fail for empty input", () => {
    const result = validateNarrativeInput("", "activist");

    expect(result.success).toBe(false);
  });

  it("should fail for whitespace-only input", () => {
    const result = validateNarrativeInput("           ", "activist");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("whitespace");
    }
  });

  it("should fail for invalid tone", () => {
    const result = validateNarrativeInput(
      "This is a valid input with more than 10 characters",
      "invalid-tone"
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("valid tone");
    }
  });

  it("should accept all valid tones", () => {
    const validTones = ["activist", "scientific", "political", "inspirational"];

    validTones.forEach((tone) => {
      const result = validateNarrativeInput(
        "This is a valid input with more than 10 characters",
        tone
      );
      expect(result.success).toBe(true);
    });
  });

  it("should fail for input exceeding 5000 characters", () => {
    const longInput = "a".repeat(5001);
    const result = validateNarrativeInput(longInput, "activist");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("5000 characters");
    }
  });
});

describe("narrativeInputSchema", () => {
  it("should parse valid input correctly", () => {
    const result = narrativeInputSchema.safeParse({
      input: "Valid input with more than 10 characters",
      tone: "scientific",
    });

    expect(result.success).toBe(true);
  });

  it("should reject invalid tone enum value", () => {
    const result = narrativeInputSchema.safeParse({
      input: "Valid input with more than 10 characters",
      tone: "unknown",
    });

    expect(result.success).toBe(false);
  });
});
