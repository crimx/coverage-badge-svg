import { describe, expect, it } from "vitest";

import { foo } from "./foo";

describe("demo", () => {
  it("should pass", () => {
    expect(foo()).toBe("bar");
  });
});
