import { pool, testDbConnection } from '../config/database.js';
import { env } from '../config/env.js';
import { RowDataPacket } from 'mysql2';

async function checkSystem() {
  console.log('🐾 Verificando configuración y estado de la base de datos VetCare...\n');
  console.log(`🔌 Host: ${env.DB_HOST}:${env.DB_PORT}`);
  console.log(`🗄️  Base de Datos: ${env.DB_NAME}`);
  console.log(`👤 Usuario MySQL: ${env.DB_USER}`);

  const connected = await testDbConnection();
  if (!connected) {
    console.error('\n❌ No fue posible conectar con el servidor MySQL.');
    process.exit(1);
  }

  console.log('✅ Conexión con MySQL establecida exitosamente.\n');

  try {
    const [tables] = await pool.execute<RowDataPacket[]>('SHOW TABLES');
    console.log(`📊 Tablas encontradas (${tables.length}):`);
    tables.forEach((t) => {
      const tableName = Object.values(t)[0];
      console.log(`   - ${tableName}`);
    });

    console.log('\n📈 Conteo de registros por tabla:');
    const tableNames = [
      'propietarios',
      'pacientes',
      'especialidades',
      'veterinarios',
      'servicios',
      'citas',
      'citas_servicios',
      'historiales_clinicos',
      'usuarios',
    ];

    for (const name of tableNames) {
      try {
        const [cnt] = await pool.execute<RowDataPacket[]>(`SELECT COUNT(*) as count FROM ${name}`);
        console.log(`   • ${name.padEnd(22)}: ${cnt[0].count} registro(s)`);
      } catch (err: any) {
        console.log(`   • ${name.padEnd(22)}: [Error: tabla no disponible]`);
      }
    }

    console.log('\n✨ Verificación completada exitosamente.');
  } catch (error) {
    console.error('❌ Error verificando estructura:', error);
  } finally {
    await pool.end();
  }
}

checkSystem();
