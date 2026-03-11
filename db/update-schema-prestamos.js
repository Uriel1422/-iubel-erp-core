import 'dotenv/config';
import mysql from 'mysql2/promise';

async function updateSchema() {
    console.log('🔄 Iniciando actualización del esquema para Préstamos Relacionales SaaS...');
    console.log(`📡 Conectando a la base de datos: ${process.env.DB_NAME} en ${process.env.DB_HOST}`);

    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'iubel_erp'
        });

        const connection = await pool.getConnection();

        // 1. Tabla de Préstamos Core (Maestro)
        console.log('1️⃣ Creando tabla prestamos_core...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS \`prestamos_core\` (
                id VARCHAR(64) PRIMARY KEY,
                empresa_id VARCHAR(36) NOT NULL,
                cliente_id VARCHAR(64) NOT NULL,
                cliente_nombre VARCHAR(255) NOT NULL,
                monto DECIMAL(15,2) NOT NULL,
                tasa_interes DECIMAL(5,2) NOT NULL,
                plazo_meses INT NOT NULL,
                tipo_amortizacion ENUM('Frances', 'Aleman') DEFAULT 'Frances',
                fecha_desembolso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                estado ENUM('Vigente', 'Saldado', 'Mora') DEFAULT 'Vigente',
                balance_pendiente DECIMAL(15,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_empresa_prestamos (empresa_id),
                INDEX idx_cliente_prestamos (cliente_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 2. Tabla de Cuotas Core (Detalle Amortización)
        console.log('2️⃣ Creando tabla cuotas_core...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS \`cuotas_core\` (
                id VARCHAR(64) PRIMARY KEY,
                prestamo_id VARCHAR(64) NOT NULL,
                numero_cuota INT NOT NULL,
                fecha_vencimiento DATE NOT NULL,
                fecha_pago TIMESTAMP NULL,
                capital DECIMAL(15,2) NOT NULL,
                interes DECIMAL(15,2) NOT NULL,
                mora DECIMAL(15,2) DEFAULT 0.00,
                monto_total DECIMAL(15,2) NOT NULL,
                saldo_restante DECIMAL(15,2) NOT NULL,
                estado ENUM('Pendiente', 'Pagada', 'Atrasada') DEFAULT 'Pendiente',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (prestamo_id) REFERENCES prestamos_core(id) ON DELETE CASCADE,
                INDEX idx_prestamo_cuotas (prestamo_id),
                INDEX idx_estado_cuotas (estado),
                INDEX idx_vencimiento (fecha_vencimiento)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 3. Tabla de Transacciones Financieras (Rastro inmutable)
        console.log('3️⃣ Creando tabla transacciones_core...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS \`transacciones_core\` (
                id VARCHAR(64) PRIMARY KEY,
                empresa_id VARCHAR(36) NOT NULL,
                usuario_id VARCHAR(36) NOT NULL,
                entidad_relacionada VARCHAR(100) NOT NULL,
                referencia_id VARCHAR(64) NOT NULL,
                tipo_operacion ENUM('Desembolso', 'Pago_Cuota', 'Abono_Capital', 'Cargo_Mora', 'Cancelacion') NOT NULL,
                monto DECIMAL(15,2) NOT NULL,
                descripcion TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_empresa_trans (empresa_id),
                INDEX idx_referencia_trans (referencia_id),
                INDEX idx_tipo_operacion (tipo_operacion)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        connection.release();
        await pool.end();

        console.log('✅ Esquema Financiero Central de Préstamos creado exitosamente.');
    } catch (error) {
        console.error('❌ Error actualizando el esquema:', error);
        process.exit(1);
    }
}

updateSchema();
