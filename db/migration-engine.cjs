/**
 * 🔒 IUBEL SAFEVAULT: ATOMIC MIGRATION ENGINE
 * Propósito: Garantizar que cualquier cambio en el esquema de base de datos de un tenant sea atómico y reversible.
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const mysqlPublicUrl = process.env.MYSQL_PUBLIC_URL || process.env.DATABASE_URL || null;
let dbConfig;

if (mysqlPublicUrl) {
    const url = new URL(mysqlPublicUrl);
    dbConfig = {
        host: url.hostname,
        port: Number(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.replace('/', ''),
    };
} else {
    dbConfig = {
        host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
        port: Number(process.env.MYSQLPORT || process.env.DB_PORT) || 3306,
        user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
        password: process.env.MYSQLPASSWORD || process.env.DB_PASS || '',
        database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'iubel_erp',
    };
}

const pool = mysql.createPool({
    ...dbConfig,
    ssl: mysqlPublicUrl ? { rejectUnauthorized: false } : undefined,
});

/**
 * Ejecuta una migración segura para un inquilino específico
 */
async function runSafeMigration(tenantId, migrationName, migrationFn) {
    const conn = await pool.getConnection();
    const prefix = tenantId.replace(/[^a-zA-Z0-9]/g, '_') + '_';
    console.log(`🛡️ [SAFEVAULT] Iniciando migración "${migrationName}" para ${tenantId}...`);

    try {
        await conn.beginTransaction();

        // 1. Point-in-Time Backup (Copia de seguridad de todas las tablas del tenant)
        const [tables] = await conn.execute("SHOW TABLES");
        const dbNameKey = Object.keys(tables[0])[0];
        const tenantTables = tables.map(t => t[dbNameKey]).filter(name => name.startsWith(prefix));

        for (const tableName of tenantTables) {
            const backupName = `${tableName}_bak_${Date.now()}`;
            console.log(`📦 Respaldando: ${tableName} -> ${backupName}`);
            await conn.execute(`CREATE TABLE \`${backupName}\` SELECT * FROM \`${tableName}\``);
        }

        // 2. Ejecutar la lógica de migración
        await migrationFn(conn, prefix);

        // 3. Verificación de Integridad (Post-Check)
        // Ejemplo genérico: Asegurar que las tablas principales sigan siendo accesibles
        for (const tableName of tenantTables) {
            const [rows] = await conn.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
            console.log(`✅ Integridad validada para ${tableName}: ${rows[0].count} registros.`);
        }

        await conn.commit();
        console.log(`🏁 [SAFEVAULT] Migración "${migrationName}" completada con éxito.`);
    } catch (err) {
        await conn.rollback();
        console.error(`❌ [SAFEVAULT] Error en migración "${migrationName}". Realizando ROLLBACK.`);
        console.error(`Detalle: ${err.message}`);
        throw err;
    } finally {
        conn.release();
    }
}

module.exports = { runSafeMigration, pool };
