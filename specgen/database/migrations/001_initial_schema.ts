/**
 * Initial database schema migration
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1693478400000 implements MigrationInterface {
  name = 'InitialSchema1693478400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create specs table
    await queryRunner.query(`
      CREATE TABLE "specs" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "title" TEXT NOT NULL,
        "body_md" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'draft',
        "created_at" DATETIME NOT NULL DEFAULT (datetime('now')),
        "updated_at" DATETIME NOT NULL DEFAULT (datetime('now')),
        "version" INTEGER NOT NULL DEFAULT 1
      )
    `);

    // Create todos table
    await queryRunner.query(`
      CREATE TABLE "todos" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "spec_id" INTEGER NOT NULL,
        "step_no" INTEGER,
        "text" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        FOREIGN KEY ("spec_id") REFERENCES "specs" ("id") ON DELETE CASCADE
      )
    `);

    // Create exec_logs table
    await queryRunner.query(`
      CREATE TABLE "exec_logs" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "spec_id" INTEGER NOT NULL,
        "layer" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "summary" TEXT,
        "tasks_completed" TEXT,
        "created_at" DATETIME NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY ("spec_id") REFERENCES "specs" ("id") ON DELETE CASCADE
      )
    `);

    // Create issue_logs table
    await queryRunner.query(`
      CREATE TABLE "issue_logs" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "spec_id" INTEGER NOT NULL,
        "task_id" TEXT NOT NULL,
        "task_description" TEXT NOT NULL,
        "layer" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "error" TEXT,
        "root_cause" TEXT,
        "resolution" TEXT,
        "created_at" DATETIME NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY ("spec_id") REFERENCES "specs" ("id") ON DELETE CASCADE
      )
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX "idx_specs_status" ON "specs" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_specs_created_at" ON "specs" ("created_at")`);
    await queryRunner.query(`CREATE INDEX "idx_specs_title" ON "specs" ("title")`);
    await queryRunner.query(`CREATE INDEX "idx_todos_spec_id" ON "todos" ("spec_id")`);
    await queryRunner.query(`CREATE INDEX "idx_exec_logs_spec_id" ON "exec_logs" ("spec_id")`);
    await queryRunner.query(`CREATE INDEX "idx_issue_logs_spec_id" ON "issue_logs" ("spec_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "idx_issue_logs_spec_id"`);
    await queryRunner.query(`DROP INDEX "idx_exec_logs_spec_id"`);
    await queryRunner.query(`DROP INDEX "idx_todos_spec_id"`);
    await queryRunner.query(`DROP INDEX "idx_specs_title"`);
    await queryRunner.query(`DROP INDEX "idx_specs_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_specs_status"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "issue_logs"`);
    await queryRunner.query(`DROP TABLE "exec_logs"`);
    await queryRunner.query(`DROP TABLE "todos"`);
    await queryRunner.query(`DROP TABLE "specs"`);
  }
}