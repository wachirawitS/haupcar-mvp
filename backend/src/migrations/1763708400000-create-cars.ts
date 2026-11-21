import type { MigrationInterface, QueryRunner } from 'typeorm';

// Lists are written out here on purpose: a migration must not change after it has run (§9.4),
// so it cannot import the (editable) consts.
export class CreateCars1763708400000 implements MigrationInterface {
  name = 'CreateCars1763708400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "cars" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "registration_number" varchar(20) NOT NULL,
        "province" varchar(50) NOT NULL,
        "brand" varchar(50) NOT NULL,
        "model" varchar(50) NOT NULL,
        "year" smallint,
        "color" varchar(20),
        "notes" varchar(1000),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_cars" PRIMARY KEY ("id"),
        CONSTRAINT "uq_cars_registration_number_province" UNIQUE ("registration_number", "province"),
        CONSTRAINT "ck_cars_year" CHECK ("year" IS NULL OR "year" >= 1950),
        CONSTRAINT "ck_cars_color" CHECK ("color" IS NULL OR "color" IN (
          'white',
          'black',
          'silver',
          'gray',
          'red',
          'blue',
          'green',
          'yellow',
          'orange',
          'brown',
          'gold',
          'other'
        )),
        CONSTRAINT "ck_cars_province" CHECK ("province" IN (
          'กรุงเทพมหานคร',
          'กระบี่',
          'กาญจนบุรี',
          'กาฬสินธุ์',
          'กำแพงเพชร',
          'ขอนแก่น',
          'จันทบุรี',
          'ฉะเชิงเทรา',
          'ชลบุรี',
          'ชัยนาท',
          'ชัยภูมิ',
          'ชุมพร',
          'เชียงราย',
          'เชียงใหม่',
          'ตรัง',
          'ตราด',
          'ตาก',
          'นครนายก',
          'นครปฐม',
          'นครพนม',
          'นครราชสีมา',
          'นครศรีธรรมราช',
          'นครสวรรค์',
          'นนทบุรี',
          'นราธิวาส',
          'น่าน',
          'บึงกาฬ',
          'บุรีรัมย์',
          'ปทุมธานี',
          'ประจวบคีรีขันธ์',
          'ปราจีนบุรี',
          'ปัตตานี',
          'พระนครศรีอยุธยา',
          'พะเยา',
          'พังงา',
          'พัทลุง',
          'พิจิตร',
          'พิษณุโลก',
          'เพชรบุรี',
          'เพชรบูรณ์',
          'แพร่',
          'ภูเก็ต',
          'มหาสารคาม',
          'มุกดาหาร',
          'แม่ฮ่องสอน',
          'ยโสธร',
          'ยะลา',
          'ร้อยเอ็ด',
          'ระนอง',
          'ระยอง',
          'ราชบุรี',
          'ลพบุรี',
          'ลำปาง',
          'ลำพูน',
          'เลย',
          'ศรีสะเกษ',
          'สกลนคร',
          'สงขลา',
          'สตูล',
          'สมุทรปราการ',
          'สมุทรสงคราม',
          'สมุทรสาคร',
          'สระแก้ว',
          'สระบุรี',
          'สิงห์บุรี',
          'สุโขทัย',
          'สุพรรณบุรี',
          'สุราษฎร์ธานี',
          'สุรินทร์',
          'หนองคาย',
          'หนองบัวลำภู',
          'อ่างทอง',
          'อำนาจเจริญ',
          'อุดรธานี',
          'อุตรดิตถ์',
          'อุทัยธานี',
          'อุบลราชธานี'
        ))
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "car_images" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "car_id" uuid NOT NULL,
        "object_key" varchar(200) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_car_images" PRIMARY KEY ("id"),
        CONSTRAINT "fk_car_images_car_id" FOREIGN KEY ("car_id") REFERENCES "cars" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "ix_car_images_car_id_created_at" ON "car_images" ("car_id", "created_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE "share_links" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "token" varchar(64) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_share_links" PRIMARY KEY ("id"),
        CONSTRAINT "uq_share_links_token" UNIQUE ("token")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "share_links"`);
    await queryRunner.query(`DROP TABLE "car_images"`);
    await queryRunner.query(`DROP TABLE "cars"`);
  }
}
