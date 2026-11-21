import { NETWORK_ERROR } from "@/lib/api-error";

export const CAR_MESSAGES = {
  listTitle: "รายการรถ",
  sharedTitle: "รายการรถ (ดูอย่างเดียว)",
  sharedDescription: "ข้อมูลรถของบริษัท เปิดจากลิงก์ที่แชร์ไว้",
  addCar: "เพิ่มรถ",
  share: "แชร์",

  searchLabel: "ค้นหา",
  searchPlaceholder: "ค้นหาทะเบียน ยี่ห้อ หรือรุ่น",
  brandLabel: "ยี่ห้อ",
  allBrands: "ทุกยี่ห้อ",
  sortLabel: "เรียงตาม",

  columnPhoto: "รูป",
  columnPlate: "ทะเบียน",
  columnBrandModel: "ยี่ห้อ / รุ่น",
  columnYear: "ปี",
  columnColor: "สี",
  noPhoto: "ไม่มีรูป",
  notSpecified: "—",

  previousPage: "ก่อนหน้า",
  nextPage: "ถัดไป",
  pageStatus: (page: number, totalPages: number, total: number) =>
    `หน้า ${page} จาก ${totalPages} (ทั้งหมด ${total} คัน)`,

  emptyTitle: "ยังไม่มีรถในระบบ",
  emptyOwnerDescription: "เริ่มบันทึกรถคันแรกได้เลย",
  emptySharedDescription: "ยังไม่มีข้อมูลรถให้ดู",
  noMatchTitle: "ไม่พบรถที่ตรงกับการค้นหา",
  noMatchDescription: "ลองเปลี่ยนคำค้นหาหรือยี่ห้อ",
  clearSearch: "ล้างการค้นหา",
  pastLastPageTitle: "ไม่มีข้อมูลในหน้านี้",
  backToFirstPage: "กลับหน้าแรก",
  loadErrorTitle: "โหลดรายการรถไม่สำเร็จ",
  retry: "ลองใหม่",

  shareTitle: "แชร์รายการรถ",
  shareDescription: "ทุกคนที่มีลิงก์นี้ดูรายการรถได้โดยไม่ต้องเข้าสู่ระบบ แต่แก้ไขไม่ได้",
  shareLinkLabel: "ลิงก์สำหรับดูอย่างเดียว",
  copyLink: "คัดลอกลิงก์",
  linkCopied: "คัดลอกลิงก์แล้ว",
  copyFailed: "คัดลอกไม่สำเร็จ กรุณาเลือกลิงก์แล้วคัดลอกเอง",
  newLink: "สร้างลิงก์ใหม่",
  newLinkConfirm: "ลิงก์เดิมจะใช้ไม่ได้ทันที คนที่มีลิงก์เดิมต้องขอลิงก์ใหม่ ต้องการสร้างลิงก์ใหม่หรือไม่?",
  newLinkConfirmButton: "สร้างลิงก์ใหม่",
  cancel: "ยกเลิก",
  newLinkCreated: "สร้างลิงก์ใหม่แล้ว ลิงก์เดิมใช้ไม่ได้แล้ว",
  shareLoadError: "โหลดลิงก์ไม่สำเร็จ",

  sharedInvalidTitle: "ลิงก์นี้ใช้ไม่ได้แล้ว",
  sharedInvalidDescription: "ลิงก์อาจถูกเปลี่ยนใหม่ กรุณาขอลิงก์ล่าสุดจากผู้ดูแลข้อมูลรถ",

  detailTitle: "ข้อมูลรถ",
  detailLoadError: "โหลดข้อมูลรถไม่สำเร็จ",
  fieldProvince: "จังหวัด",
  fieldBrand: "ยี่ห้อ",
  fieldModel: "รุ่น",
  fieldYear: "ปี",
  fieldColor: "สี",
  fieldNotes: "หมายเหตุ",
  photoAlt: (plate: string, index: number) => `รูปรถทะเบียน ${plate} รูปที่ ${index}`,
  loading: "กำลังโหลด…",
} as const;

// API error code → Thai text. Never show the raw API message (§3.1).
const ERROR_MESSAGES: Record<string, string> = {
  SHARE_LINK_NOT_FOUND: CAR_MESSAGES.sharedInvalidTitle,
  CAR_NOT_FOUND: "ไม่พบรถคันนี้ อาจถูกลบไปแล้ว",
  [NETWORK_ERROR]: "เชื่อมต่อระบบไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่",
};
const FALLBACK_ERROR = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";

export function carErrorMessage(code: string | undefined): string {
  return (code && ERROR_MESSAGES[code]) || FALLBACK_ERROR;
}
