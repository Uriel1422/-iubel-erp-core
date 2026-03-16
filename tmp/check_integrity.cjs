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

async function check() {
    const pool = mysql.createPool({
        ...dbConfig,
        ssl: mysqlPublicUrl ? { rejectUnauthorized: false } : undefined,
    });
    try {
        const [rows] = await pool.execute("SELECT COUNT(*) as count FROM `aubel_srl_facturas`").catch(() => [[{count: 0}]]);
        console.log('Facturas: ' + rows[0].count);
        const [rows2] = await pool.execute("SELECT COUNT(*) as count FROM `aubel_srl_asientos`").catch(() => [[{count: 0}]]);
        console.log('Asientos: ' + rows2[0].count);
    } catch(e) {
        console.log('Error: ' + e.message);
    } finally {
        await pool.end();
    }
}
check();
