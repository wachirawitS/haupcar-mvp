import type { CarColor } from "../types";

// Thai labels for the backend colour codes (backend car-color.const.ts).
export const CAR_COLOR_LABELS: Record<CarColor, string> = {
  white: "ขาว",
  black: "ดำ",
  silver: "เงิน",
  gray: "เทา",
  red: "แดง",
  blue: "น้ำเงิน",
  green: "เขียว",
  yellow: "เหลือง",
  orange: "ส้ม",
  brown: "น้ำตาล",
  gold: "ทอง",
  other: "อื่นๆ",
};

// A small swatch next to the colour name.
export const CAR_COLOR_SWATCHES: Record<CarColor, string> = {
  white: "#ffffff",
  black: "#111827",
  silver: "#c0c4cc",
  gray: "#6b7280",
  red: "#dc2626",
  blue: "#1d4ed8",
  green: "#15803d",
  yellow: "#facc15",
  orange: "#f97316",
  brown: "#7c4a2d",
  gold: "#c9a227",
  other: "conic-gradient(#dc2626, #facc15, #15803d, #1d4ed8, #dc2626)",
};
