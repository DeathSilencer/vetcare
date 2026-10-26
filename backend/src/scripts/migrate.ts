import fs from 'fs';
import path from 'path';
import { pool } from '../config/database.js';

async function runMigration() {
  console.log('🐾 Iniciando migración de base de datos para VetCare...');
  const migrationPath = path.resolve(process.cwd(), '../database/01_migraciones_vetcare.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ No se encontró el archivo de migración en: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');
  const connection = await pool.getConnection();

  try {
    console.log('📄 Ejecutando sentencias de migración...');
    // Separar por punto y coma, respetando bloques de código
    const statements = sql
      .split(/;\s*[\r\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    for (const statement of statements) {
      if (statement.length > 0) {
        await connection.query(statement);
      }
    }

    console.log('✅ Migración ejecutada con éxito. Tablas usuarios, sessions y columna estado listas.');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

runMigration();
