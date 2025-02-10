import { MigrationInterface, QueryRunner } from "typeorm";

export class Contacts1739221124709 implements MigrationInterface {
    name = 'Contacts1739221124709'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."Contact_linkprecedence_enum" AS ENUM('secondary', 'primary')`);
        await queryRunner.query(`CREATE TABLE "Contact" ("id" SERIAL NOT NULL, "phoneNumber" character varying, "email" character varying, "linkPrecedence" "public"."Contact_linkprecedence_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "deletedAt" TIMESTAMP WITH TIME ZONE, "linkedId" integer, CONSTRAINT "PK_9d0ea6f3557586cef53e954d13a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Contact" ADD CONSTRAINT "FK_5a8e16cec993653db10080536ac" FOREIGN KEY ("linkedId") REFERENCES "Contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Contact" DROP CONSTRAINT "FK_5a8e16cec993653db10080536ac"`);
        await queryRunner.query(`DROP TABLE "Contact"`);
        await queryRunner.query(`DROP TYPE "public"."Contact_linkprecedence_enum"`);
    }

}
