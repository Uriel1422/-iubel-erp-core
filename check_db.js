
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

async function checkTables() {
    try {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute('SHOW TABLES');
        const allTables = rows.map(row => Object.values(row)[0]);
        const aubelTables = allTables.filter(name => name.startsWith('aubel_srl'));
        
        console.log('--- AUBEL SRL TABLE COUNTS ---');
        if (aubelTables.length === 0) {
            console.log('❌ NO TABLES FOUND FOR aubel_srl');
        } else {
            console.log(`✅ FOUND ${aubelTables.length} TABLES`);
            for (const t of aubelTables) {
                try {
                    const [countRows] = await connection.execute(`SELECT COUNT(*) as total FROM \`${t}\``);
                    console.log(`${t}: ${countRows[0].total} rows ${countRows[0].total > 0 ? '✅' : '❌'}`);
                } catch (e) {
                    console.log(`${t}: Error query`);
                }
            }
        }
        
        const [companies] = await connection.execute('SELECT * FROM empresas');
        console.log('\n--- COMPANIES ---');
        companies.forEach(c => console.log(`${c.slug} | Created: ${c.created_at}`));

        await connection.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkTables();
