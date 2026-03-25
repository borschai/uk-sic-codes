const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

// Test against source directly (build before running against dist)
const {
  lookup,
  search,
  validate,
  listSection,
  listDivision,
  tree,
  sections,
  count,
} = require("../dist/index.js");

describe("lookup", () => {
  it("finds a 5-digit code", () => {
    const result = lookup("62012");
    assert.ok(result);
    assert.equal(result.code, "62012");
    assert.equal(result.description, "Business and domestic software development");
    assert.equal(result.section, "J");
    assert.equal(result.division, "62");
    assert.equal(result.group, "620");
    assert.equal(result.classCode, "6201");
  });

  it("finds a 4-digit code by padding", () => {
    const result = lookup("1110");
    assert.ok(result);
    assert.equal(result.code, "01110");
    assert.equal(result.section, "A");
  });

  it("returns null for invalid code", () => {
    assert.equal(lookup("00000"), null);
    assert.equal(lookup("abc"), null);
    assert.equal(lookup(""), null);
  });

  it("handles the dormant company code", () => {
    const result = lookup("99999");
    assert.ok(result);
    assert.equal(result.description, "Dormant Company");
    assert.equal(result.section, "U");
  });

  it("strips whitespace and punctuation from code", () => {
    const result = lookup("62.01.2");
    assert.ok(result);
    assert.equal(result.code, "62012");
  });
});

describe("search", () => {
  it("finds codes by keyword", () => {
    const results = search("restaurant");
    assert.ok(results.length > 0);
    assert.ok(results.some((r) => r.code === "56101" || r.code === "56102"));
  });

  it("is case-insensitive", () => {
    const upper = search("SOFTWARE");
    const lower = search("software");
    assert.equal(upper.length, lower.length);
  });

  it("returns empty for empty query", () => {
    assert.deepEqual(search(""), []);
    assert.deepEqual(search("   "), []);
  });

  it("respects limit", () => {
    const results = search("manufacture", 5);
    assert.ok(results.length <= 5);
  });

  it("finds multi-word queries", () => {
    const results = search("ice cream");
    assert.ok(results.some((r) => r.code === "10520"));
  });

  it("finds mining-related codes", () => {
    const results = search("coal");
    assert.ok(results.some((r) => r.code === "05101" || r.code === "05102"));
  });
});

describe("validate", () => {
  it("returns true for valid codes", () => {
    assert.equal(validate("62012"), true);
    assert.equal(validate("01110"), true);
    assert.equal(validate("99999"), true);
  });

  it("returns true for 4-digit codes that pad to valid", () => {
    assert.equal(validate("1110"), true);
  });

  it("returns false for invalid codes", () => {
    assert.equal(validate("00000"), false);
    assert.equal(validate("abc"), false);
    assert.equal(validate("123456"), false);
    assert.equal(validate(""), false);
  });
});

describe("listSection", () => {
  it("lists all codes in section A", () => {
    const codes = listSection("A");
    assert.ok(codes.length > 30);
    assert.ok(codes.every((c) => c.section === "A"));
    assert.ok(codes.some((c) => c.code === "01110"));
  });

  it("is case-insensitive", () => {
    const upper = listSection("A");
    const lower = listSection("a");
    assert.equal(upper.length, lower.length);
  });

  it("returns empty for invalid section", () => {
    assert.deepEqual(listSection("Z"), []);
  });
});

describe("listDivision", () => {
  it("lists all codes in division 62", () => {
    const codes = listDivision("62");
    assert.ok(codes.length > 0);
    assert.ok(codes.every((c) => c.code.startsWith("62")));
  });

  it("returns empty for non-existent division", () => {
    assert.deepEqual(listDivision("00"), []);
  });
});

describe("tree", () => {
  it("returns all 21 sections", () => {
    const result = tree();
    assert.equal(result.length, 21);
    assert.equal(result[0].letter, "A");
    assert.equal(result[result.length - 1].letter, "U");
  });

  it("each section has divisions and codes", () => {
    const result = tree();
    for (const section of result) {
      assert.ok(section.divisions.length > 0, `Section ${section.letter} has no divisions`);
      assert.ok(section.codes.length > 0, `Section ${section.letter} has no codes`);
    }
  });
});

describe("sections", () => {
  it("returns 21 sections", () => {
    const result = sections();
    assert.equal(result.length, 21);
    assert.equal(result[0].letter, "A");
    assert.ok(result[0].name.includes("Agriculture"));
  });
});

describe("count", () => {
  it("returns total code count (700+)", () => {
    const total = count();
    assert.ok(total >= 700, `Expected 700+ codes, got ${total}`);
  });
});
