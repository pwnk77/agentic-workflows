/**
 * Full-text search (FTS5) setup migration
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class FullTextSearch1693478500000 implements MigrationInterface {
  name = 'FullTextSearch1693478500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create FTS5 virtual table for full-text search
    await queryRunner.query(`
      CREATE VIRTUAL TABLE specs_fts USING fts5(
        title,
        body_md,
        content='specs',
        content_rowid='id'
      )
    `);

    // Create trigger to automatically update FTS table when specs are inserted
    await queryRunner.query(`
      CREATE TRIGGER specs_fts_insert AFTER INSERT ON specs BEGIN
        INSERT INTO specs_fts(rowid, title, body_md) 
        VALUES (new.id, new.title, new.body_md);
      END
    `);

    // Create trigger to automatically update FTS table when specs are updated
    await queryRunner.query(`
      CREATE TRIGGER specs_fts_update AFTER UPDATE ON specs BEGIN
        UPDATE specs_fts 
        SET title = new.title, body_md = new.body_md 
        WHERE rowid = new.id;
      END
    `);

    // Create trigger to automatically delete from FTS table when specs are deleted
    await queryRunner.query(`
      CREATE TRIGGER specs_fts_delete AFTER DELETE ON specs BEGIN
        DELETE FROM specs_fts WHERE rowid = old.id;
      END
    `);

    // Populate FTS table with existing data (if any)
    await queryRunner.query(`
      INSERT INTO specs_fts(rowid, title, body_md)
      SELECT id, title, body_md FROM specs
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS specs_fts_delete`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS specs_fts_update`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS specs_fts_insert`);

    // Drop FTS table
    await queryRunner.query(`DROP TABLE IF EXISTS specs_fts`);
  }
}