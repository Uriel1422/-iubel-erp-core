import mysql from 'mysql2/promise';
import 'dotenv/config';

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

async function findAubel() {
    try {
        const [rows] = await pool.execute("SELECT id, nombre, slug FROM empresas WHERE nombre LIKE '%AUBEL%'");
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error('Error querying database:', err.message);
    } finally {
        await pool.end();
    }
}

findAubel();
