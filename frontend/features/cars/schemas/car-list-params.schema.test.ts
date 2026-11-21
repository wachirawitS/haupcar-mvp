import { describe, expect, it } from "vitest";
import {
  parseCarListParams,
  toCarListQuery,
  toCarListSearchParams,
} from "./car-list-params.schema";

const parse = (query: string) => parseCarListParams(new URLSearchParams(query));

describe("car list URL params", () => {
  it("uses defaults for an empty URL", () => {
    expect(parse("")).toEqual({ page: 1, search: undefined, brand: undefined, sort: "newest" });
  });

  it("keeps valid values and trims text", () => {
    expect(parse("page=3&search=%20กข%20&brand=Toyota&sort=plate")).toEqual({
      page: 3,
      search: "กข",
      brand: "Toyota",
      sort: "plate",
    });
  });

  it.each([
    ["page=0", { page: 1 }],
    ["page=abc", { page: 1 }],
    ["page=1.5", { page: 1 }],
    ["sort=id;drop", { sort: "newest" }],
    ["search=%20%20", { search: undefined }],
    [`search=${"x".repeat(101)}`, { search: undefined }],
  ])("falls back to the default for %s", (query, expected) => {
    expect(parse(query)).toMatchObject(expected);
  });

  it("maps the sort option to the API sort + order", () => {
    expect(toCarListQuery(parse("sort=yearNewest&page=2"))).toEqual({
      page: 2,
      limit: 10,
      search: undefined,
      brand: undefined,
      sort: "year",
      order: "desc",
    });
  });

  it("leaves defaults out of the URL", () => {
    expect(toCarListSearchParams(parse("page=1&sort=newest")).toString()).toBe("");
    expect(toCarListSearchParams(parse("search=Honda&page=2")).toString()).toBe(
      "search=Honda&page=2",
    );
  });
});
