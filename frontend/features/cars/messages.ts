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

export const CAR_FORM_MESSAGES = {
  addTitle: "เพิ่มรถ",
  editTitle: (plate: string) => `แก้ไขรถ ${plate}`,
  editPageTitle: "แก้ไขรถ",
  backToList: "กลับไปหน้ารายการ",

  registrationNumberLabel: "ทะเบียนรถ",
  registrationNumberHint: "เช่น 1กข 1234 หรือ กข 99",
  provinceLabel: "จังหวัด",
  provincePlaceholder: "พิมพ์เพื่อค้นหาจังหวัด",
  provinceEmpty: "ไม่พบจังหวัด",
  brandLabel: "ยี่ห้อ",
  brandPlaceholder: "เช่น Toyota",
  modelLabel: "รุ่น",
  modelPlaceholder: "เช่น Corolla Altis",
  yearLabel: "ปี (ค.ศ.)",
  yearPlaceholder: "เช่น 2022",
  colorLabel: "สี",
  colorNone: "ไม่ระบุ",
  notesLabel: "หมายเหตุ",
  optional: "(ไม่บังคับ)",

  required: "กรุณากรอกข้อมูลนี้",
  tooLong: (max: number) => `ยาวได้ไม่เกิน ${max} ตัวอักษร`,
  tooLongGeneric: "ข้อความยาวเกินกำหนด",
  plateFormat: "รูปแบบทะเบียนไม่ถูกต้อง เช่น 1กข 1234",
  plateExists: "ทะเบียนนี้มีอยู่แล้วในจังหวัดนี้",
  yearRange: (min: number, max: number) => `ปีต้องอยู่ระหว่าง ${min}–${max}`,
  invalidValue: "ข้อมูลไม่ถูกต้อง",

  save: "บันทึก",
  saving: "กำลังบันทึก…",
  cancel: "ยกเลิก",
  saveError: "บันทึกไม่สำเร็จ",
  created: "เพิ่มรถแล้ว",
  updated: "บันทึกการแก้ไขแล้ว",

  photosTitle: "รูปรถ",
  photosHintCreate: "รูปจะถูกอัปโหลดเมื่อกดบันทึก",
  photosHintEdit: "การเปลี่ยนรูปจะบันทึกทันที",
  photosCount: (count: number, max: number) => `${count} / ${max} รูป`,
  addPhotos: "เพิ่มรูป",
  photosRules: "JPEG, PNG หรือ WebP ไม่เกิน 5 MB ต่อรูป",
  removePhoto: (index: number) => `ลบรูปที่ ${index}`,
  uploading: "กำลังอัปโหลด…",
  uploaded: "อัปโหลดรูปแล้ว",
  photoDeleted: "ลบรูปแล้ว",
  deletePhotoTitle: "ลบรูปนี้?",
  deletePhotoDescription: "รูปจะถูกลบทันทีและกู้คืนไม่ได้",
  photoTooLarge: (name: string) => `${name} ใหญ่เกิน 5 MB`,
  photoWrongType: (name: string) => `${name} ไม่ใช่ไฟล์ JPEG, PNG หรือ WebP`,
  photoLimit: (max: number) => `เพิ่มได้สูงสุด ${max} รูป`,
  photosFailed: (count: number) => `บันทึกข้อมูลรถแล้ว แต่อัปโหลดรูปไม่สำเร็จ ${count} รูป กรุณาเพิ่มรูปอีกครั้ง`,

  dangerTitle: "ลบรถคันนี้",
  dangerDescription: "ลบข้อมูลรถและรูปทั้งหมด กู้คืนไม่ได้",
  deleteCar: "ลบรถ",
  deleteCarTitle: (plate: string) => `ลบรถทะเบียน ${plate}?`,
  deleteCarDescription: "ข้อมูลรถและรูปทั้งหมดจะถูกลบและกู้คืนไม่ได้",
  deleting: "กำลังลบ…",
  deleted: (plate: string) => `ลบรถทะเบียน ${plate} แล้ว`,
  delete: "ลบ",

  notFoundTitle: "ไม่พบรถคันนี้",
  notFoundDescription: "รถอาจถูกลบไปแล้ว",
} as const;

// 422 field error code → Thai text for that input.
export function carFieldErrorMessage(code: string): string {
  switch (code) {
    case "REQUIRED":
      return CAR_FORM_MESSAGES.required;
    case "TOO_LONG":
      return CAR_FORM_MESSAGES.tooLongGeneric;
    case "INVALID_FORMAT":
      return CAR_FORM_MESSAGES.plateFormat;
    case "MIN":
    case "MAX_CAR_YEAR":
      return CAR_FORM_MESSAGES.yearRange(1950, new Date().getFullYear() + 1);
    case "CAR_PLATE_EXISTS":
      return CAR_FORM_MESSAGES.plateExists;
    default:
      return CAR_FORM_MESSAGES.invalidValue;
  }
}

const IMAGE_ERROR_MESSAGES: Record<string, string> = {
  CAR_IMAGE_LIMIT_REACHED: CAR_FORM_MESSAGES.photoLimit(10),
  UNSUPPORTED_FILE_TYPE: "รองรับเฉพาะไฟล์ JPEG, PNG หรือ WebP",
  FILE_TOO_LARGE: "ไฟล์ใหญ่เกิน 5 MB",
  CAR_IMAGE_NOT_FOUND: "ไม่พบรูปนี้ อาจถูกลบไปแล้ว",
};

export function carImageErrorMessage(code: string | undefined): string {
  return (code && IMAGE_ERROR_MESSAGES[code]) || carErrorMessage(code);
}
