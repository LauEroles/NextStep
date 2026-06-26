import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1782377594183 implements MigrationInterface {
    name = 'InitialSchema1782377594183'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "is_default" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "first_name" character varying(50) NOT NULL, "last_name" character varying(50) NOT NULL, "email" character varying(50) NOT NULL, "password" character varying(255) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "role_id" integer, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "seniority" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, CONSTRAINT "UQ_7337d2629cb29c928b2265a6102" UNIQUE ("name"), CONSTRAINT "PK_396dcd0aaf42987d9cf14b175d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "job_offers" ("id" SERIAL NOT NULL, "title" character varying(50) NOT NULL, "description" text NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "seniority_id" integer, "recruiter_id" integer, CONSTRAINT "PK_9a54d36bd6829979f945defdeb5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stages" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "sequence_order" integer NOT NULL, "is_terminal" boolean NOT NULL, "is_hired_stage" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_62914e6926ccc4850911e89ee1a" UNIQUE ("name"), CONSTRAINT "UQ_66ca39aa932b1bfaeb191cc254a" UNIQUE ("sequence_order"), CONSTRAINT "PK_16efa0f8f5386328944769b9e6d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "job_applications" ("id" SERIAL NOT NULL, "cvPath" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "job_offer_id" integer, "applicant_id" integer, "current_stage_id" integer, CONSTRAINT "PK_c56a5e86707d0f0df18fa111280" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "feedback" ("id" SERIAL NOT NULL, "technical_score" integer, "soft_skills_score" integer, "comment" text, "internal_notes" text, "public_feedback" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "application_id" integer, "recruiter_id" integer, "stage_id" integer, CONSTRAINT "PK_8389f9e087a57689cd5be8b2b13" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."scorecards_type_enum" AS ENUM('technical', 'soft')`);
        await queryRunner.query(`CREATE TABLE "scorecards" ("id" SERIAL NOT NULL, "skillName" character varying(100) NOT NULL, "score" integer NOT NULL, "type" "public"."scorecards_type_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "feedback_id" integer, CONSTRAINT "PK_5ab8d3887ff2fb66e229c1fdd89" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" SERIAL NOT NULL, "action" character varying(100) NOT NULL, "entity" character varying(100) NOT NULL, "entity_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cv_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "originalName" character varying NOT NULL, "storedName" character varying NOT NULL, "extension" character varying NOT NULL, "directory" character varying NOT NULL, "user_id" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_89bdf76e79a74acd27e46e1be82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_offers" ADD CONSTRAINT "FK_7623f8c83544163fca1f0dff65a" FOREIGN KEY ("seniority_id") REFERENCES "seniority"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_offers" ADD CONSTRAINT "FK_187ff2746099875f2927ee4d33b" FOREIGN KEY ("recruiter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_applications" ADD CONSTRAINT "FK_4ca84852497effad6cb223e3866" FOREIGN KEY ("job_offer_id") REFERENCES "job_offers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_applications" ADD CONSTRAINT "FK_7f3ce1d43bc6112e38e3e49ef23" FOREIGN KEY ("applicant_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_applications" ADD CONSTRAINT "FK_0e56e8b1ae16c9463ba8493952b" FOREIGN KEY ("current_stage_id") REFERENCES "stages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD CONSTRAINT "FK_c948f09fb21254c13282637a6c3" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD CONSTRAINT "FK_547dd3092ef77c90c89ce377547" FOREIGN KEY ("recruiter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD CONSTRAINT "FK_7feae822a1780c6a99ef0fadd73" FOREIGN KEY ("stage_id") REFERENCES "stages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "scorecards" ADD CONSTRAINT "FK_bcd35d2bcf7eae5a01f56490741" FOREIGN KEY ("feedback_id") REFERENCES "feedback"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cv_files" ADD CONSTRAINT "FK_c8edd496d46d95d107123d695c2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cv_files" DROP CONSTRAINT "FK_c8edd496d46d95d107123d695c2"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0"`);
        await queryRunner.query(`ALTER TABLE "scorecards" DROP CONSTRAINT "FK_bcd35d2bcf7eae5a01f56490741"`);
        await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_7feae822a1780c6a99ef0fadd73"`);
        await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_547dd3092ef77c90c89ce377547"`);
        await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_c948f09fb21254c13282637a6c3"`);
        await queryRunner.query(`ALTER TABLE "job_applications" DROP CONSTRAINT "FK_0e56e8b1ae16c9463ba8493952b"`);
        await queryRunner.query(`ALTER TABLE "job_applications" DROP CONSTRAINT "FK_7f3ce1d43bc6112e38e3e49ef23"`);
        await queryRunner.query(`ALTER TABLE "job_applications" DROP CONSTRAINT "FK_4ca84852497effad6cb223e3866"`);
        await queryRunner.query(`ALTER TABLE "job_offers" DROP CONSTRAINT "FK_187ff2746099875f2927ee4d33b"`);
        await queryRunner.query(`ALTER TABLE "job_offers" DROP CONSTRAINT "FK_7623f8c83544163fca1f0dff65a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`);
        await queryRunner.query(`DROP TABLE "cv_files"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "scorecards"`);
        await queryRunner.query(`DROP TYPE "public"."scorecards_type_enum"`);
        await queryRunner.query(`DROP TABLE "feedback"`);
        await queryRunner.query(`DROP TABLE "job_applications"`);
        await queryRunner.query(`DROP TABLE "stages"`);
        await queryRunner.query(`DROP TABLE "job_offers"`);
        await queryRunner.query(`DROP TABLE "seniority"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "roles"`);
    }

}
