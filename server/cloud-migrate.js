/**
 * Iubel ERP — Cloud Migration Script
 * Este script inicializa la estructura de la base de datos en un entorno nuevo (producción).
 */
import mysql from 'mysql2/promise';
import 'dotenv/config';

async function migrate() {
    console.log('🚀 Iniciando migración a la nube...');
    
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT) || 3306
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ Conectado a la base de datos de producción.');

        // Aquí irían los comandos CREATE TABLE si no existen
        // Por ahora, validamos la conexión para que el usuario pueda empezar.
        
        const [rows] = await connection.query('SHOW TABLES');
        console.log(`📊 Tablas encontradas: ${rows.length}`);
        
        if (rows.length === 0) {
            console.log('⚠️ La base de datos está vacía. Ready for provisioning.');
        }

        await connection.end();
    } catch (error) {
        console.error('❌ Error de conexión/migración:', error.message);
        process.exit(1);
    }
}

migrate();
