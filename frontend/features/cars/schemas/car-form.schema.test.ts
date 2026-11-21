import { describe, expect, it } from "vitest";
import type { Car } from "../types";
import {
  carFormSchema,
  carToFormValues,
  EMPTY_CAR_FORM,
  type CarFormValues,
  maxCarYear,
} from "./car-form.schema";

const valid: CarFormValues = {
  registrationNumber: "1กข 1234",
  province: "กรุงเทพมหานคร",
  brand: "Toyota",
  model: "Corolla Altis",
  year: "2021",
  color: "white",
  notes: "รถฝ่ายขาย",
};
const parse = (changes: Partial<CarFormValues>) =>
  carFormSchema.safeParse({ ...valid, ...changes });
const errorOn = (changes: Partial<CarFormValues>) =>
  parse(changes).error?.issues.map((issue) => issue.path.join("."));

describe("car form schema", () => {
  it("parses a valid car into the API body", () => {
    expect(parse({}).data).toEqual({ ...valid, year: 2021 });
  });

  it.each(["1กข1234", "1กข-1234", " 1กข  1234 "])("normalises the plate %s", (plate) => {
    expect(parse({ registrationNumber: plate }).data?.registrationNumber).toBe("1กข 1234");
  });

  it.each(["ABC 123", "1234", "กขคง 1", "กข 12345", ""])("rejects the plate %j", (plate) => {
    expect(errorOn({ registrationNumber: plate })).toEqual(["registrationNumber"]);
  });

  it("requires province, brand and model", () => {
    expect(errorOn({ province: "", brand: "  ", model: "" })).toEqual([
      "province",
      "brand",
      "model",
    ]);
    expect(errorOn({ province: "Bangkok" })).toEqual(["province"]);
  });

  it("checks max lengths", () => {
    expect(errorOn({ brand: "x".repeat(51), notes: "x".repeat(1001) })).toEqual(["brand", "notes"]);
  });

  it("turns empty optional fields into null and trims text", () => {
    expect(parse({ year: " ", color: "", notes: "  ", brand: " Honda " }).data).toMatchObject({
      year: null,
      color: null,
      notes: null,
      brand: "Honda",
    });
  });

  it.each(["1949", String(maxCarYear() + 1), "2020.5", "abc"])("rejects the year %s", (year) => {
    expect(errorOn({ year })).toEqual(["year"]);
  });

  it("accepts next year", () => {
    expect(parse({ year: String(maxCarYear()) }).data?.year).toBe(maxCarYear());
  });

  it("maps a car back to form values", () => {
    const car: Car = {
      id: "1",
      registrationNumber: "กข 99",
      province: "ชลบุรี",
      brand: "Isuzu",
      model: "D-Max",
      year: null,
      color: null,
      notes: null,
      images: [],
      createdAt: "",
      updatedAt: "",
    };
    expect(carToFormValues(car)).toEqual({
      ...EMPTY_CAR_FORM,
      registrationNumber: "กข 99",
      province: "ชลบุรี",
      brand: "Isuzu",
      model: "D-Max",
    });
  });
});
