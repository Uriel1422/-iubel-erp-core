// scripts/seed-superadmin.js
// Ejecutar UNA SOLA VEZ para crear el superadmin en producción:
// node scripts/seed-superadmin.js

import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL;

let conn;
const url = new URL(DATABASE_URL);
conn = await mysql.createConnection({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.replace('/', ''),
    ssl: { rejectUnauthorized: false },
});

console.log('✅ Conectado a MySQL de producción...');

// Datos del SuperAdmin
const ADMIN = {
    id: `sa_${Date.now()}`,
    nombre: 'Iubel Admin',
    email: 'admin@iubel.com',
    password: 'Iubel2026!',
};

const hash = await bcrypt.hash(ADMIN.password, 12);

try {
    await conn.execute(
        `INSERT INTO superadmins (id, nombre, email, password_hash, activo)
         VALUES (?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
        [ADMIN.id, ADMIN.nombre, ADMIN.email, hash]
    );
    console.log(`✅ SuperAdmin creado exitosamente!`);
    console.log(`   Email: ${ADMIN.email}`);
    console.log(`   Contraseña: ${ADMIN.password}`);
    console.log(`   ⚠️  Guarda estas credenciales de forma segura!`);
} catch (err) {
    console.error('❌ Error:', err.message);
}

await conn.end();
