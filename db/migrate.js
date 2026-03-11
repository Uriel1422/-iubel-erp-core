// db/migrate.js
// Ejecutar UNA SOLA VEZ: node db/migrate.js
// Migra los datos existentes en archivos JSON (data/*.json) a MySQL.

import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
});

// Entidades = nombres de archivos JSON sin extensión
const ENTITIES = [
    'asientos', 'facturas', 'compras', 'contactos', 'cuentas', 'inventario',
    'socios', 'prestamos', 'caja', 'bancos', 'boveda', 'nomina', 'ncf',
    'recurrentes', 'presupuesto', 'cotizaciones', 'activos_fijos',
    'centros_costo', 'notas', 'configuracion', 'ordenes_compra', 'moneda',
];

let totalInserted = 0;

for (const entity of ENTITIES) {
    const filePath = path.join(DATA_DIR, `${entity}.json`);
    if (!fs.existsSync(filePath)) {
        console.log(`⏭  ${entity}: no JSON file found, skipping.`);
        continue;
    }

    let rows;
    try {
        rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
        console.warn(`⚠  ${entity}: invalid JSON, skipping.`);
        continue;
    }

    if (!Array.isArray(rows) || rows.length === 0) {
        console.log(`⏭  ${entity}: empty, skipping.`);
        continue;
    }

    let inserted = 0;
    for (const row of rows) {
        const id = String(row.id || Date.now() + Math.random());
        try {
            await pool.execute(
                `INSERT INTO \`${entity}\` (id, data)
                 VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE data = VALUES(data)`,
                [id, JSON.stringify(row)]
            );
            inserted++;
        } catch (err) {
            console.error(`  ✗ Error inserting into ${entity}:`, err.message);
        }
    }
    totalInserted += inserted;
    console.log(`✓  ${entity}: ${inserted} registros importados.`);
}

await pool.end();
console.log(`\n✅ Migración completada. Total: ${totalInserted} registros importados a MySQL.`);
