import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

async function migrate() {
    console.log('🚀 Iniciando migración a la nube...');
    
    const config = {
        host: process.env.MYSQLHOST || process.env.DB_HOST,
        user: process.env.MYSQLUSER || process.env.DB_USER,
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || process.env.DB_PASS,
        database: process.env.MYSQLDATABASE || process.env.DB_NAME,
        port: Number(process.env.MYSQLPORT || process.env.DB_PORT) || 3306,
        multipleStatements: true // Crítico para ejecutar el archivo SQL
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ Conectado a la base de datos de producción.');

        const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('📄 Leyendo esquema SQL...');
        
        // Ejecutar el esquema (MySQL maneja múltiples declaraciones si multipleStatements es true)
        await connection.query(schema);
        
        console.log('✨ Estructura de tablas creada con éxito.');

        const [rows] = await connection.query('SHOW TABLES');
        console.log(`📊 Total de tablas inicializadas: ${rows.length}`);

        await connection.end();
        console.log('🚀 Migración completada. Sistema listo para operar.');
    } catch (error) {
        console.error('❌ Error de migración:', error.message);
        process.exit(1);
    }
}

migrate();
