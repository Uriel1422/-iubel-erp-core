import 'dotenv/config';
import mysql from 'mysql2/promise';

async function migrate() {
    const pool = await mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'iubel_erp',
    });

    try {
        console.log('Añadiendo columna features a empresas...');
        await pool.execute("ALTER TABLE empresas ADD COLUMN features JSON NULL AFTER plan");
        console.log('Migración completada exitosamente.');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('La columna features ya existe.');
        } else {
            console.error('Error en migración:', e.message);
        }
    }

    await pool.end();
}

migrate();
