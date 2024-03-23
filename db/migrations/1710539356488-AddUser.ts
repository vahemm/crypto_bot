import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUser1710539356488 implements MigrationInterface {
  name = 'Test1710539325996';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "firstName" character varying NOT NULL, 
      "lastName" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, 
      CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
