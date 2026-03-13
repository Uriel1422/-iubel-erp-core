
import 'dotenv/config';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL;

let config;
if (DATABASE_URL) {
    const url = new URL(DATABASE_URL);
    config = {
        host: url.hostname,
        port: Number(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.replace('/', ''),
        ssl: { rejectUnauthorized: false }
    };
} else {
    config = {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'iubel_erp'
    };
}

async function checkOtherCompany() {
    try {
        const connection = await mysql.createConnection(config);
        
        const tables = ['verifunique12345_facturas', 'verifunique12345_socios', 'verifunique12345_cuentas'];
        console.log('--- VERIFUNIQUE12345 TABLE COUNTS ---');
        for (const t of tables) {
            try {
                const [countRows] = await connection.execute(`SELECT COUNT(*) as total FROM \`${t}\``);
                console.log(`${t}: ${countRows[0].total} rows`);
            } catch (e) {
                console.log(`${t}: Error or not found`);
            }
        }
        
        await connection.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkOtherCompany();
