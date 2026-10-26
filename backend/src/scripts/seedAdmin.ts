import { pool } from '../config/database.js';
import { env } from '../config/env.js';
import { hashPassword } from '../utils/password.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

async function seedAdmin() {
  console.log('🐾 Creando o actualizando usuario Administrador inicial...');
  const connection = await pool.getConnection();

  try {
    const email = env.DEFAULT_ADMIN_EMAIL;
    const name = env.DEFAULT_ADMIN_NAME;
    const plainPassword = env.DEFAULT_ADMIN_PASSWORD;

    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT id_usuario FROM usuarios WHERE correo = ?',
      [email]
    );

    const passwordHash = await hashPassword(plainPassword);

    if (rows.length > 0) {
      const id = rows[0].id_usuario;
      await connection.execute(
        'UPDATE usuarios SET nombre = ?, password_hash = ?, rol = "ADMIN", activo = 1 WHERE id_usuario = ?',
        [name, passwordHash, id]
      );
      console.log(`✅ Administrador actualizado exitosamente.`);
      console.log(`   - ID: ${id}`);
      console.log(`   - Nombre: ${name}`);
      console.log(`   - Correo: ${email}`);
      console.log(`   - Rol: ADMIN`);
    } else {
      const [res] = await connection.execute<ResultSetHeader>(
        'INSERT INTO usuarios (nombre, correo, password_hash, rol, activo) VALUES (?, ?, ?, "ADMIN", 1)',
        [name, email, passwordHash]
      );
      console.log(`✅ Administrador creado exitosamente.`);
      console.log(`   - ID: ${res.insertId}`);
      console.log(`   - Nombre: ${name}`);
      console.log(`   - Correo: ${email}`);
      console.log(`   - Rol: ADMIN`);
    }
  } catch (error) {
    console.error('❌ Error creando administrador:', error);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

seedAdmin();
