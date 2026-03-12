// scripts/run-sql-init.js
import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:qbydHljjanDtKkvqepeKBmNxHdhdHHuB@maglev.proxy.rlwy.net:48074/railway';

async function runInit() {
    const pool = mysql.createPool(DATABASE_URL);
    try {
        const sqlPath = path.join(process.cwd(), 'scripts', 'init_global_settings.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Split by semicolon and filter empty
        const commands = sql.split(';').filter(cmd => cmd.trim());
        
        console.log('🚀 Iniciando configuración global en BD...');
        for (const cmd of commands) {
            await pool.execute(cmd);
        }
        console.log('✅ Base de datos global inicializada correctamente.');
    } catch (err) {
        console.error('❌ Error inicializando BD:', err);
    } finally {
        await pool.end();
    }
}

runInit();
