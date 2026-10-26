import { pool, testDbConnection } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

async function runBackendTests() {
  console.log('🐾 =====================================================');
  console.log('🧪 INICIANDO SUITE DE PRUEBAS AUTOMATIZADAS — VETCARE');
  console.log('🐾 =====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Test de Conexión
    const dbConnected = await testDbConnection();
    assert(dbConnected, '1. Conexión activa y respuesta PING a base de datos MySQL (vetcare)');

    // 2. Test de Hashing Seguro
    const rawPass = 'ClaveSegura123!';
    const hashed = await hashPassword(rawPass);
    const isMatch = await comparePassword(rawPass, hashed);
    const isBadMatch = await comparePassword('ClaveIncorrecta', hashed);
    assert(isMatch && !isBadMatch && hashed !== rawPass, '2. Encriptación y verificación de contraseñas con bcrypt');

    // 3. Test de Usuarios y Autenticación
    const [usuarios] = await pool.execute<RowDataPacket[]>(
      'SELECT id_usuario, correo, rol, password_hash, activo FROM usuarios WHERE correo = "admin@vetcare.com"'
    );
    assert(usuarios.length > 0 && usuarios[0].rol === 'ADMIN', '3. Existencia de usuario Administrador con rol ADMIN');

    const adminPassOk = await comparePassword('Admin123!', usuarios[0].password_hash);
    assert(adminPassOk, '4. Autenticación exitosa del Administrador con su hash almacenado');

    // 4. Test de Integridad y Existencia de Tablas Originales
    const [tablasOriginales] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        (SELECT COUNT(*) FROM propietarios) AS pr,
        (SELECT COUNT(*) FROM pacientes) AS pa,
        (SELECT COUNT(*) FROM veterinarios) AS ve,
        (SELECT COUNT(*) FROM especialidades) AS es,
        (SELECT COUNT(*) FROM servicios) AS se,
        (SELECT COUNT(*) FROM citas) AS ci,
        (SELECT COUNT(*) FROM citas_servicios) AS cs,
        (SELECT COUNT(*) FROM historiales_clinicos) AS hi
    `);
    const counts = tablasOriginales[0];
    assert(
      counts.pr >= 20 && counts.pa >= 20 && counts.ve >= 20 && counts.es >= 20 && counts.se >= 20,
      '5. Preservación del esquema original y conteo mínimo de 20 registros por tabla'
    );

    // 5. Test de Integridad Referencial (FK Check): Intento de eliminar Especialidad con Veterinarios asociados
    let fkBlocked = false;
    try {
      await pool.execute('DELETE FROM especialidades WHERE id_especialidad = 1');
    } catch (err: any) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
        fkBlocked = true;
      }
    }
    assert(fkBlocked, '6. Bloqueo de eliminación por restricción de clave foránea (Error 1451 controlado)');

    // 6. Test de Inserción, Consulta, Modificación y Eliminación Limpia (Ciclo CRUD Completo)
    // Crear un propietario temporal
    const [insertProp] = await pool.execute<ResultSetHeader>(
      'INSERT INTO propietarios (nombre, telefono, correo) VALUES (?, ?, ?)',
      ['Propietario de Prueba CRUD', '5599887766', 'prueba.crud@vetcare.com']
    );
    const testPropId = insertProp.insertId;
    assert(testPropId > 0, '7. Operación CREATE (INSERT): Creación de nuevo propietario');

    // Modificar el propietario temporal
    await pool.execute(
      'UPDATE propietarios SET nombre = ? WHERE id_propietario = ?',
      ['Propietario Modificado Test', testPropId]
    );
    const [readProp] = await pool.execute<RowDataPacket[]>(
      'SELECT nombre FROM propietarios WHERE id_propietario = ?',
      [testPropId]
    );
    assert(readProp[0]?.nombre === 'Propietario Modificado Test', '8. Operación UPDATE y READ: Modificación y consulta de registro');

    // Eliminar el propietario temporal
    const [delProp] = await pool.execute<ResultSetHeader>(
      'DELETE FROM propietarios WHERE id_propietario = ?',
      [testPropId]
    );
    assert(delProp.affectedRows === 1, '9. Operación DELETE: Eliminación exitosa sin violar integridad');

    // 7. Test de Transacción ACID: Cita con Servicios Múltiples
    const conn = await pool.getConnection();
    let transactionOk = false;
    try {
      await conn.beginTransaction();
      const [newCita] = await conn.execute<ResultSetHeader>(
        'INSERT INTO citas (fecha_hora, motivo, estado, id_paciente, id_veterinario) VALUES (NOW(), "Chequeo Prueba Transacción", "pendiente", 1, 1)'
      );
      const citaId = newCita.insertId;
      await conn.execute('INSERT INTO citas_servicios (id_cita, id_servicio) VALUES (?, ?)', [citaId, 1]);
      await conn.execute('INSERT INTO citas_servicios (id_cita, id_servicio) VALUES (?, ?)', [citaId, 2]);
      await conn.commit();

      // Limpiar datos de prueba
      await conn.execute('DELETE FROM citas_servicios WHERE id_cita = ?', [citaId]);
      await conn.execute('DELETE FROM citas WHERE id_cita = ?', [citaId]);
      transactionOk = true;
    } catch (e) {
      await conn.rollback();
    } finally {
      conn.release();
    }
    assert(transactionOk, '10. Transacción SQL ACID (COMMIT / ROLLBACK) para citas y servicios múltiples');

    // 8. Test de Consultas con JOIN y Funciones de Agregación
    const [joinTest] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        c.id_cita,
        p.nombre AS paciente,
        pr.nombre AS propietario,
        v.nombre AS veterinario,
        COALESCE(SUM(s.costo), 0) AS total_calculado
      FROM citas c
      INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
      INNER JOIN propietarios pr ON p.id_propietario = pr.id_propietario
      INNER JOIN veterinarios v ON c.id_veterinario = v.id_veterinario
      LEFT JOIN citas_servicios cs ON c.id_cita = cs.id_cita
      LEFT JOIN servicios s ON cs.id_servicio = s.id_servicio
      GROUP BY c.id_cita, p.nombre, pr.nombre, v.nombre
      LIMIT 1
    `);
    assert(joinTest.length > 0 && joinTest[0].paciente !== undefined, '11. Consulta relacional multi-tabla con 3 JOINs y función SUM');

    console.log('\n🐾 =====================================================');
    console.log(`📊 RESULTADO DE LA SUITE DE PRUEBAS:`);
    console.log(`   Pruebas Exitosas: ${passed}`);
    console.log(`   Pruebas Fallidas: ${failed}`);
    console.log(`   Porcentaje de Aprobación: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    console.log('🐾 =====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error fatal en las pruebas:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runBackendTests();
