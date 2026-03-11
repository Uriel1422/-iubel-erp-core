import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    const pool = await mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'Ribeu@bel17$',
        database: process.env.DB_NAME || 'iubel_erp',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log('--- COLUMNS IN empresas ---');
        const [cols] = await pool.execute('DESCRIBE empresas');
        cols.forEach(c => {
            console.log(`Field: ${c.Field} | Type: ${c.Type} | Null: ${c.Null}`);
        });

        console.log('\n--- DATA FOR prueba01 ---');
        const [rows] = await pool.execute('SELECT * FROM empresas WHERE nombre = "prueba01"');
        if (rows.length > 0) {
            console.log(JSON.stringify(rows[0], null, 2));
        } else {
            console.log('prueba01 not found exactly, searching with LIKE...');
            const [rows2] = await pool.execute('SELECT * FROM empresas WHERE nombre LIKE "%prueba01%"');
            console.log(JSON.stringify(rows2[0], null, 2));
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
