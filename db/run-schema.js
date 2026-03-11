// db/run-schema.js
// Ejecuta el archivo schema.sql contra MySQL y crea las tablas necesarias.
// Este script solo necesita correrse una vez.

import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    multipleStatements: true,
});

const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

try {
    await conn.query(schemaSQL);
    console.log('✅ Base de datos iubel_erp creada y tablas inicializadas correctamente.');
} catch (err) {
    console.error('❌ Error ejecutando schema.sql:', err.message);
} finally {
    await conn.end();
}
