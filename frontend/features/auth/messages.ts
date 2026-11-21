import { NETWORK_ERROR } from "@/lib/api-error";

export const AUTH_MESSAGES = {
  appName: "CARLOG",
  appTagline: "ระบบบันทึกข้อมูลรถยนต์",
  loginTitle: "เข้าสู่ระบบ",
  loginDescription: "กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าใช้งาน",
  usernameLabel: "ชื่อผู้ใช้",
  passwordLabel: "รหัสผ่าน",
  usernameRequired: "กรุณากรอกชื่อผู้ใช้",
  passwordRequired: "กรุณากรอกรหัสผ่าน",
  tooLong: "ข้อความยาวเกินไป",
  invalidValue: "ข้อมูลไม่ถูกต้อง",
  showPassword: "แสดงรหัสผ่าน",
  hidePassword: "ซ่อนรหัสผ่าน",
  submit: "เข้าสู่ระบบ",
  submitting: "กำลังเข้าสู่ระบบ…",
  logout: "ออกจากระบบ",
  loading: "กำลังโหลด…",
} as const;

// API error code → Thai text. Never show the raw API message (§3.1).
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
  [NETWORK_ERROR]: "เชื่อมต่อระบบไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่",
};
const FALLBACK_ERROR = "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";

export function loginErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? FALLBACK_ERROR;
}

// Field error code from a 422 → Thai text for that input.
export function fieldErrorMessage(field: "username" | "password", code: string): string {
  if (code === "REQUIRED") {
    return field === "username" ? AUTH_MESSAGES.usernameRequired : AUTH_MESSAGES.passwordRequired;
  }
  if (code === "TOO_LONG") return AUTH_MESSAGES.tooLong;
  return AUTH_MESSAGES.invalidValue;
}
