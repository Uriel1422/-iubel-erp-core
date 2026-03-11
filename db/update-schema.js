import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function updateSchema() {
    const pool = await mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'iubel_erp',
    });

    try {
        console.log('1. Alterando tabla empresas...');
        await pool.execute("ALTER TABLE empresas ADD COLUMN plan ENUM('basico','intermedio','avanzado') DEFAULT 'basico' AFTER periodo_fiscal");
        console.log('2. Columna plan agregada exitosamente o ya existia');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('Columna plan ya existe.');
        } else {
            console.error('Error alterando empresa:', e.message);
        }
    }

    try {
        console.log('3. Creando tabla superadmins...');
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS superadmins (
            id            VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
            nombre        VARCHAR(255) NOT NULL,
            email         VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            activo        TINYINT(1)   DEFAULT 1,
            ultimo_acceso TIMESTAMP    NULL,
            created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('4. Tabla superadmins creada');

        console.log('5. Creando superadmin por defecto...');
        const pass = await bcrypt.hash('admin123', 12);
        await pool.execute(
            `INSERT IGNORE INTO superadmins (id, nombre, email, password_hash)
             VALUES ('sysadmin_1', 'Super Admin Iubel', 'admin@iubel.com', ?);`,
            [pass]
        );
        console.log('6. Usuario superadmin admin@iubel.com creado exitosamente (pass: admin123)');

    } catch (e) {
        console.error('Error creando superadmin:', e.message);
    }

    await pool.end();
}

updateSchema();
