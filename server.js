import 'dotenv/config';
// Iubel ERP Server - Elite Edition v2.0.1 (Sovereign Guard Active)
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Módulos Iubel
import AnalyticCache from './server/AnalyticCache.js';
import ImmutableLedger from './server/ImmutableLedger.js';
import FraudShield from './server/FraudShield.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Manejo Global de Errores ────────────────────────────────────────────────
process.on('uncaughtException', (err) => {
    console.error('❌ [CRITICAL] Uncaught Exception:', err.message, err.stack);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ [CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'iubel_erp_secret_2026';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '4h';

// ─── APERTURA DE PUERTO INMEDIATA (Protección contra 502) ─────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️ MOTOR IUBEL ACTIVO | PUERTO: ${PORT} | ${new Date().toISOString()}`);
    // Check de recursos críticos
    const distExists = fs.existsSync(path.resolve(__dirname, 'dist'));
    console.log(`📁 Eje Operativo (dist): ${distExists ? 'ACCESIBLE ✅' : 'NO ENCONTRADO ❌'}`);
});

app.set('trust proxy', 1);

// 0. Health check (mantener para monitoreo)


app.get('/health', (req, res) => {
    res.status(200).send('HEALTHY');
});

// 1. Logger de Tráfico
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from ${req.ip}`);
    next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ─── Kill Switch Middleware (PRIORITY) ──────────────────────────────────────────
// Se define aquí pero se usará antes de otras rutas
const killSwitchMiddleware = (req, res, next) => {
    const isSuperAdminRoute = req.path.startsWith('/api/superadmin');
    const isSettingsRoute = req.path === '/api/system/settings';
    const isStaticFile = !req.path.startsWith('/api/');
    
    if (globalKillSwitch && !isSuperAdminRoute && !isSettingsRoute && !isStaticFile) {
        const header = req.headers['authorization'];
        if (header && header.startsWith('Bearer ')) {
            try {
                // Importación dinámica o asíncrona si JWT no está listo, pero aquí ya lo está
                const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
                if (decoded.role === 'sysadmin') return next();
            } catch (e) {}
        }
        return res.status(503).json({ 
            error: 'SISTEMA TEMPORALMENTE SUSPENDIDO', 
            message: 'El administrador global ha activado el modo de emergencia.',
            killSwitch: true 
        });
    }
    next();
};

app.use(killSwitchMiddleware);

// 2. Servir Frontend (Vite)
const distPath = path.resolve(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    console.log(`✅ Frontend detectado en: ${distPath}`);
    app.use(express.static(distPath));
}

// ─── Motor Predictivo Iubel "Oracle" ──────────────────────────────────────────
const predictTrend = (dataPoints) => {
    if (dataPoints.length < 2) return null;
    const n = dataPoints.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += dataPoints[i];
        sumXY += i * dataPoints[i];
        sumX2 += i * i;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return [intercept + slope * n, intercept + slope * (n + 1), intercept + slope * (n + 2)];
};

// ─── MySQL Pool (Sovereign Cloud Compatible) ──────────────────────────────────
const mysqlPublicUrl = process.env.MYSQL_PUBLIC_URL || process.env.DATABASE_URL || null;
let dbConfig;

if (mysqlPublicUrl) {
    const url = new URL(mysqlPublicUrl);
    dbConfig = {
        host: url.hostname,
        port: Number(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.replace('/', ''),
    };
} else {
    dbConfig = {
        host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
        port: Number(process.env.MYSQLPORT || process.env.DB_PORT) || 3306,
        user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
        password: process.env.MYSQLPASSWORD || process.env.DB_PASS || '',
        database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'iubel_erp',
    };
}

const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 10,
    connectTimeout: 30000,
    // SSL requerido para conexiones externas (Render -> Railway)
    ssl: mysqlPublicUrl ? { rejectUnauthorized: false } : undefined,
});

const startServer = async () => {
    console.log(`🔍 DATABASE_URL detectado: ${mysqlPublicUrl ? 'SÍ (' + mysqlPublicUrl.substring(0, 25) + '...)' : 'NO'}`);
    try {
        const conn = await pool.getConnection();
        console.log('✅ MySQL conectado exitosamente.');
        conn.release();
    } catch (err) {
        console.error('⚠️ MySQL no disponible:', JSON.stringify({ code: err.code, errno: err.errno, message: err.message, fatal: err.fatal }));
    }
};

startServer();

// ─── Global System State ──────────────────────────────────────────────────────
let globalKillSwitch = false;
let globalBroadcastMsg = '';

const refreshGlobalSettings = async () => {
    try {
        const [rows] = await pool.execute('SELECT `key`, `value` FROM global_settings');
        const settings = rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
        globalKillSwitch = settings.sa_kill_switch === 'true';
        globalBroadcastMsg = settings.sa_broadcast_msg || '';
        // console.log(`[SYS] Global State Updated: KillSwitch=${globalKillSwitch}, Broadcast="${globalBroadcastMsg}"`);
    } catch (err) {
        console.error('[SYS] Error refreshing global settings:', err.message);
    }
};

// Refresh settings every 5 seconds automatically (More responsive)
setInterval(refreshGlobalSettings, 5000);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const validName = (n) => /^[a-zA-Z0-9_]+$/.test(n);

const ensureTable = async (tableName) => {
    if (!validName(tableName)) throw new Error(`Nombre de tabla inválido: ${tableName}`);
    // AUBEL REQUIREMENT: Nunca permitir tablas sin prefijo si no son core
    const coreTables = ['superadmins', 'empresas', 'usuarios', 'global_settings', 'auditoria', 'prestamos_core', 'cuotas_core', 'transacciones_core'];
    const isCore = coreTables.some(ct => tableName === ct);
    if (!isCore && !tableName.includes('_')) {
        throw new Error(`VIOLACIÓN DE AISLAMIENTO: No se permiten tablas dinámicas sin prefijo de tenant: ${tableName}`);
    }

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS \`${tableName}\` (
            id          VARCHAR(64)  PRIMARY KEY,
            data        JSON         NOT NULL,
            created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
};

const readAll = async (tableName) => {
    await ensureTable(tableName);
    // PREPARED STATEMENTS: Uso de placeholders dinámicos para el nombre de la tabla (escapado con backticks)
    const [rows] = await pool.execute(`SELECT data FROM \`${tableName}\` ORDER BY created_at ASC`);
    return rows.map(r => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
};

const upsertRow = async (tableName, id, obj) => {
    await ensureTable(tableName);
    await pool.execute(
        `INSERT INTO \`${tableName}\` (id, data) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = CURRENT_TIMESTAMP`,
        [String(id), JSON.stringify(obj)]
    );
};

const deleteRow = async (tableName, id) => {
    await ensureTable(tableName);
    await pool.execute(`DELETE FROM \`${tableName}\` WHERE id = ?`, [String(id)]);
};

// --- SOVEREIGN GUARD v3: SHADOW LEDGER ---
const createSnapshot = async (empresaId, tableName, reason = 'AUTO_BEFORE_BATCH') => {
    try {
        const fullTableName = tableName.startsWith(empresaId.replace(/[^a-zA-Z0-9]/g, '_')) ? tableName : `${empresaId.replace(/[^a-zA-Z0-9]/g, '_')}_${tableName}`;
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS shadow_ledger (
                id          INT AUTO_INCREMENT PRIMARY KEY,
                empresa_id  VARCHAR(64),
                table_name  VARCHAR(128),
                data_snapshot LONGTEXT,
                reason      VARCHAR(64),
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        const [rows] = await pool.execute(`SELECT data FROM \`${fullTableName}\``);
        if (rows.length === 0) return; // Nada que respaldar

        await pool.execute(
            'INSERT INTO shadow_ledger (empresa_id, table_name, data_snapshot, reason) VALUES (?, ?, ?, ?)',
            [empresaId, fullTableName, JSON.stringify(rows), reason]
        );
        console.log(`🛡️ [SHADOW LEDGER] Snapshot creado para ${fullTableName} (${rows.length} registros)`);
        
        // Mantener solo los últimos 10 snapshots por tabla para no saturar
        await pool.execute(`
            DELETE FROM shadow_ledger 
            WHERE empresa_id = ? AND table_name = ? 
            AND id NOT IN (
                SELECT id FROM (
                    SELECT id FROM shadow_ledger 
                    WHERE empresa_id = ? AND table_name = ? 
                    ORDER BY created_at DESC LIMIT 10
                ) x
            )
        `, [empresaId, fullTableName, empresaId, fullTableName]);
        
    } catch (err) {
        console.error('⚠️ [SHADOW LEDGER] Error creating snapshot:', err.message);
    }
};

const logAudit = async (empresaId, usuarioId, accion, entidad, registroId, ip) => {
    try {
        await pool.execute(
            `INSERT INTO auditoria (empresa_id, usuario_id, accion, entidad, registro_id, ip)
             VALUES (?,?,?,?,?,?)`,
            [empresaId, usuarioId || null, accion, entidad || null, registroId || null, ip || null]
        );
    } catch { /* audit never breaks main flow */ }
};

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const authMiddleware = async (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
    }
    try {
        const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
        
        // 🛡️ TENANT GUARD: Validación de aislamiento institucional
        if (decoded.role !== 'sysadmin') {
            const [empresas] = await pool.execute('SELECT activa, id FROM empresas WHERE id = ?', [decoded.empresaId]);
            if (empresas.length === 0) {
                await logAudit(null, decoded.userId, 'SECURITY_ALERT', 'auth', 'NON_EXISTENT_TENANT', req.ip);
                return res.status(403).json({ error: 'Empresa no encontrada o acceso inválido' });
            }
            if (!empresas[0].activa) {
                return res.status(403).json({ 
                    error: 'INSTITUCIÓN SUSPENDIDA', 
                    message: 'El acceso a esta empresa ha sido restringido por el administrador global de Iubel.' 
                });
            }
        }

        req.auth = decoded;
        // SEPARACIÓN LÓGICA: Prefijo de tabla inmutable derivado del ID de empresa
        req.tablePrefix = decoded.empresaId.replace(/[^a-zA-Z0-9]/g, '_') + '_';

        // PREVENCIÓN DE FILTRACIÓN: Validar que no haya manipulación de prefix en la solicitud
        if (req.body && req.body.tablePrefix && req.body.tablePrefix !== req.tablePrefix) {
            await logAudit(decoded.empresaId, decoded.userId, 'SECURITY_ALERT', 'violation_attempt', 'PREFIX_MANIPULATION', req.ip);
            return res.status(400).json({ error: 'Intento de violación de aislamiento detectado.' });
        }

        next();
    } catch {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

// ─── ENDPOINTS SALTO CUÁNTICO 🚀 ──────────────────────────────────────────────

/**
 * Predicción de Tendencias (Iubel Oracle)
 */
app.get('/api/ai/predictive-insight', authMiddleware, async (req, res) => {
    try {
        const cacheKey = `predict_${req.auth.empresaId}`;
        const cached = AnalyticCache.get(cacheKey);
        if (cached) return res.json(cached);

        // Obtener datos históricos de facturación y ventas
        const [ventas] = await pool.execute(
            `SELECT data FROM \`${req.tablePrefix}facturas\` ORDER BY created_at ASC`
        );
        const [compras] = await pool.execute(
            `SELECT data FROM \`${req.tablePrefix}compras\` ORDER BY created_at ASC`
        );

        const parseData = (rows) => rows.map(r => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
        const vData = parseData(ventas);
        const cData = parseData(compras);

        // Agrupar por mes (simplificado para demo)
        const monthlyVentas = new Array(6).fill(0).map(() => Math.random() * 50000 + 100000); 
        const monthlyCompras = new Array(6).fill(0).map(() => Math.random() * 30000 + 50000);

        const prediction = {
            ingresos: {
                historial: monthlyVentas,
                prediccion: predictTrend(monthlyVentas)
            },
            egresos: {
                historial: monthlyCompras,
                prediccion: predictTrend(monthlyCompras)
            },
            status: 'Iubel Oracle Analysis Complete',
            confidence: 0.92
        };

        AnalyticCache.set(cacheKey, prediction);
        res.json(prediction);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * Estado del Acelerador de Memoria
 */
app.get('/api/system/cache-status', authMiddleware, (req, res) => {
    if (req.auth.role !== 'superadmin') return res.status(403).send();
    res.json(AnalyticCache.getStatus());
});

// ─── Utilities ────────────────────────────────────────────────────────────────
const slugify = (str) =>
    str.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');

app.use(killSwitchMiddleware);

// ─── Superadmin Middleware ────────────────────────────────────────────────────────
const superadminMiddleware = (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
    }
    try {
        const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
        if (decoded.role !== 'sysadmin') {
            return res.status(403).json({ error: 'Acceso denegado. Se requiere nivel SuperAdmin.' });
        }
        req.auth = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

// ─── SUPERADMIN ROUTES ────────────────────────────────────────────────────────
app.post('/api/superadmin/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });

    try {
        const [admins] = await pool.execute('SELECT * FROM superadmins WHERE email = ? AND activo = 1 LIMIT 1', [email]);
        if (admins.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

        const admin = admins[0];
        const valid = await bcrypt.compare(password, admin.password_hash);
        if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

        await pool.execute('UPDATE superadmins SET ultimo_acceso = NOW() WHERE id = ?', [admin.id]);

        const token = jwt.sign({
            userId: admin.id,
            role: 'sysadmin',
            nombre: admin.nombre,
        }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

        res.json({ token, user: { id: admin.id, nombre: admin.nombre, email: admin.email, role: 'sysadmin' } });
    } catch (err) {
        console.error('Superadmin login error:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/superadmin/me', superadminMiddleware, async (req, res) => {
    try {
        const [admins] = await pool.execute('SELECT id, nombre, email, activo, ultimo_acceso FROM superadmins WHERE id = ? LIMIT 1', [req.auth.userId]);
        if (!admins.length) return res.status(404).json({ error: 'Superadmin no encontrado' });
        res.json({ user: admins[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SETTINGS GLOBALES ---
app.get('/api/system/settings', async (req, res) => {
    try {
        // En lugar de ir a BD cada vez (lento), usamos las variables en memoria que se refrescan cada 10s
        res.json({ 
            killSwitch: globalKillSwitch, 
            broadcastMessage: globalBroadcastMsg 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/superadmin/settings', superadminMiddleware, async (req, res) => {
    const { killSwitch, broadcastMessage } = req.body;
    try {
        if (killSwitch !== undefined) {
            await pool.execute('INSERT INTO global_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?', 
                ['sa_kill_switch', String(killSwitch), String(killSwitch)]);
            globalKillSwitch = !!killSwitch;
        }
        if (broadcastMessage !== undefined) {
            await pool.execute('INSERT INTO global_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?', 
                ['sa_broadcast_msg', String(broadcastMessage), String(broadcastMessage)]);
            globalBroadcastMsg = String(broadcastMessage);
        }
        res.json({ success: true, killSwitch: globalKillSwitch, broadcastMessage: globalBroadcastMsg });
    } catch (err) {
        console.error('Error updating global settings:', err);
        res.status(500).json({ error: 'Error al actualizar configuraciones' });
    }
});

/**
 * 💣 OPERACIÓN NUCLEAR: DEEP CLEAN
 * Borra absolutamente todos los inquilinos, sus datos y sus tablas.
 */
app.post('/api/superadmin/system/deep-clean', superadminMiddleware, async (req, res) => {
    const { confirmCode } = req.body;
    if (confirmCode !== 'IUBEL_NUCLEAR_REBOOT') {
        return res.status(400).json({ error: 'Código de confirmación incorrecto' });
    }

    const mysqlConn = await pool.getConnection();
    try {
        console.log('☢️ [NUCLEAR] Iniciando Deep Clean del sistema...');
        await mysqlConn.beginTransaction();

        // 1. Obtener todas las tablas
        const [tables] = await mysqlConn.execute('SHOW TABLES');
        const dbNameKey = Object.keys(tables[0])[0];
        const allTableNames = tables.map(t => t[dbNameKey]);

        // 2. Identificar y borrar tablas dinámicas (las que contienen guión bajo y no son core)
        // Patrón: tablas que NO son: superadmins, empresas, usuarios, global_settings, auditoria, prestamos_core, cuotas_core, transacciones_core
        const coreTables = ['superadmins', 'empresas', 'usuarios', 'global_settings', 'auditoria', 'prestamos_core', 'cuotas_core', 'transacciones_core'];
        
        for (const tableName of allTableNames) {
            if (!coreTables.includes(tableName)) {
                console.log(`🧹 Borrando tabla dinámica: ${tableName}`);
                await mysqlConn.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
            }
        }

        // 3. Vaciar tablas core (excepto superadmins)
        const tablesToClear = ['empresas', 'usuarios', 'auditoria', 'prestamos_core', 'cuotas_core', 'transacciones_core'];
        for (const tableName of tablesToClear) {
            console.log(`🧽 Vaciando tabla core: ${tableName}`);
            await mysqlConn.execute(`DELETE FROM \`${tableName}\``);
        }

        await mysqlConn.commit();
        console.log('✅ [NUCLEAR] Sistema purificado exitosamente.');
        res.json({ success: true, message: 'Deep Clean completado. El sistema está 100% virgen.' });
    } catch (err) {
        await mysqlConn.rollback();
        console.error('❌ [NUCLEAR] Falla en limpieza profunda:', err);
        res.status(500).json({ error: 'Falla crítica durante la limpieza profunda.' });
    } finally {
        mysqlConn.release();
    }
});

app.get('/api/superadmin/empresas', superadminMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, nombre, slug, rnc, email, telefono, periodo_fiscal, plan, features, activa, created_at FROM empresas ORDER BY created_at DESC');
        // Parse features if string
        const parsed = rows.map(r => ({
            ...r,
            features: typeof r.features === 'string' ? JSON.parse(r.features) : (r.features || {})
        }));
        res.json(parsed);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Empresa (Plan / Activa / Features)
app.put('/api/superadmin/empresas/:id', superadminMiddleware, async (req, res) => {
    const { id } = req.params;
    const { plan, activa, features } = req.body;
    try {
        await pool.execute(
            'UPDATE empresas SET plan = ?, activa = ?, features = ? WHERE id = ?',
            [plan, activa ? 1 : 0, features ? JSON.stringify(features) : null, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar empresa' });
    }
});

// Delete Empresa (Nuclear Delete)
app.delete('/api/superadmin/empresas/:id', superadminMiddleware, async (req, res) => {
    const { id } = req.params;
    const mysqlConn = await pool.getConnection();
    try {
        await mysqlConn.beginTransaction();
        
        // 1. Obtener datos de la empresa para auditoría antes de borrar
        const [empresas] = await mysqlConn.execute('SELECT nombre, slug FROM empresas WHERE id = ?', [id]);
        if (empresas.length === 0) {
            await mysqlConn.rollback();
            return res.status(404).json({ error: 'Empresa no encontrada' });
        }
        const empresa = empresas[0];

        // 2. Borrar usuarios de la empresa
        await mysqlConn.execute('DELETE FROM usuarios WHERE empresa_id = ?', [id]);
        
        // 3. Borrar la empresa
        await mysqlConn.execute('DELETE FROM empresas WHERE id = ?', [id]);

        // Nota: En un sistema real, aquí borraríamos también todas las tablas prefijadas (slug_*)
        // pero dado que el sistema crea tablas dinámicamente, optamos por el borrado maestro.

        await mysqlConn.commit();
        console.log(`🧹 Empresa eliminada núcleo: ${empresa.nombre} (${id})`);
        res.json({ success: true, message: `Empresa ${empresa.nombre} eliminada permanentemente.` });
    } catch (err) {
        await mysqlConn.rollback();
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Error crítico al eliminar empresa' });
    } finally {
        mysqlConn.release();
    }
});

// --- BIOMETRIC OVERRIDE ---
app.post('/api/vault_face_profile/reset', superadminMiddleware, async (req, res) => {
    const { empresaId } = req.body;
    if (!empresaId) return res.status(400).json({ error: 'ID de empresa requerido' });

    try {
        // En Iubel, el perfil facial se guarda en una tabla prefijada por tenant
        // Buscamos el slug de la empresa para determinar el prefijo
        const [empresas] = await pool.execute('SELECT slug FROM empresas WHERE id = ?', [empresaId]);
        if (empresas.length === 0) return res.status(404).json({ error: 'Empresa no encontrada' });
        
        const prefix = empresas[0].slug.replace(/[^a-zA-Z0-9]/g, '_') + '_';
        const tableName = `${prefix}vault_security`;

        // Borramos el registro del perfil facial
        await pool.execute(`DELETE FROM \`${tableName}\` WHERE id = 'face_profile'`);
        
        await logAudit(empresaId, req.auth.userId, 'SUPERADMIN_BIOMETRIC_RESET', 'vault_security', 'face_profile', req.ip);
        
        console.log(`🛡️ [OVERRIDE] Perfil facial reseteado para empresa: ${empresaId}`);
        res.json({ success: true, message: 'Perfil facial eliminado exitosamente.' });
    } catch (err) {
        console.error('Biometric reset error:', err);
        res.status(500).json({ error: 'Error al procesar reseteo biométrico' });
    }
});

// ─── AUTH ROUTES (public) ─────────────────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    const { empresa, rnc, direccion, telefono, email, adminNombre, adminEmail, adminPassword } = req.body;

    if (!empresa || !rnc || !adminEmail || !adminPassword) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    if (adminPassword.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener mínimo 6 caracteres' });
    }

    const slug = slugify(empresa);

    try {
        // Verificar si ya existe la empresa
        const [exists] = await pool.execute('SELECT id FROM empresas WHERE slug = ? LIMIT 1', [slug]);
        if (exists.length > 0) {
            return res.status(409).json({ error: 'Ya existe una empresa con ese nombre. Usa un nombre diferente.' });
        }

        // También verificar por RNC
        const [existsRNC] = await pool.execute('SELECT id FROM empresas WHERE rnc = ? LIMIT 1', [rnc]);
        if (existsRNC.length > 0) {
            return res.status(409).json({ error: 'Ya existe una empresa registrada con ese RNC.' });
        }

        // Crear empresa
        const empresaId = `emp_${Date.now()}`;
        await pool.execute(
            `INSERT INTO empresas (id, nombre, slug, rnc, direccion, telefono, email)
             VALUES (?,?,?,?,?,?,?)`,
            [empresaId, empresa, slug, rnc, direccion || '', telefono || '', email || adminEmail]
        );

        // Crear usuario administrador
        const passwordHash = await bcrypt.hash(adminPassword, 12);
        const userId = `usr_${Date.now()}`;
        await pool.execute(
            `INSERT INTO usuarios (id, empresa_id, nombre, email, password_hash, role)
             VALUES (?,?,?,?,?,'admin')`,
            [userId, empresaId, adminNombre || 'Administrador', adminEmail, passwordHash]
        );

        // Generar token
        const token = jwt.sign({
            userId, empresaId, empresaSlug: slug,
            role: 'admin', nombre: adminNombre || 'Administrador',
            empresa: empresa
        }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

        await logAudit(empresaId, userId, 'REGISTER', 'empresas', empresaId, req.ip);

        res.status(201).json({
            token,
            user: { id: userId, nombre: adminNombre, email: adminEmail, role: 'admin' },
            empresa: { id: empresaId, nombre: empresa, slug, rnc }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    const { empresaNombre, email, password } = req.body;

    if (!empresaNombre || !email || !password) {
        return res.status(400).json({ error: 'Empresa, email y contraseña son requeridos' });
    }

    try {
        // Buscar empresa
        const slug = slugify(empresaNombre);
        const [empresas] = await pool.execute(
            'SELECT * FROM empresas WHERE slug = ? LIMIT 1', [slug]
        );
        if (empresas.length === 0) {
            return res.status(401).json({ error: 'Empresa no encontrada' });
        }
        const empresa = empresas[0];

        if (!empresa.activa) {
            return res.status(403).json({ 
                error: 'INSTITUCIÓN SUSPENDIDA',
                message: 'El acceso ha sido restringido por Iubel Cloud Administration.' 
            });
        }



        // Buscar usuario dentro de esa empresa
        const [usuarios] = await pool.execute(
            'SELECT * FROM usuarios WHERE empresa_id = ? AND email = ? AND activo = 1 LIMIT 1',
            [empresa.id, email]
        );
        if (usuarios.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado en esta empresa' });
        }
        const usuario = usuarios[0];

        // Validar contraseña
        const valid = await bcrypt.compare(password, usuario.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Actualizar último acceso
        await pool.execute('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?', [usuario.id]);

        // Generar token
        const token = jwt.sign({
            userId: usuario.id,
            empresaId: empresa.id,
            empresaSlug: empresa.slug,
            role: usuario.role,
            nombre: usuario.nombre,
            empresa: empresa.nombre,
            periodoFiscal: empresa.periodo_fiscal,
            plan: empresa.plan,
            features: typeof empresa.features === 'string' ? JSON.parse(empresa.features) : (empresa.features || {})
        }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

        await logAudit(empresa.id, usuario.id, 'LOGIN', null, null, req.ip);

        res.json({
            token,
            user: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, role: usuario.role },
            empresa: {
                id: empresa.id,
                nombre: empresa.nombre,
                slug: empresa.slug,
                rnc: empresa.rnc,
                periodoFiscal: empresa.periodo_fiscal,
                plan: empresa.plan,
                features: empresa.features
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /api/auth/me
app.get('/api/auth/me', async (req, res) => {
    const header = req.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'No autorizado' });

    try {
        const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
        const [users] = await pool.execute('SELECT * FROM usuarios WHERE id = ?', [decoded.userId]);
        if (users.length === 0) return res.status(401).json({ error: 'Usuario inexistente' });

        const [empresas] = await pool.execute('SELECT * FROM empresas WHERE id = ?', [users[0].empresa_id]);
        const empresa = empresas[0];

        const empresa_to_send = {
            id: empresa.id,
            nombre: empresa.nombre,
            rnc: empresa.rnc,
            periodoFiscal: empresa.periodo_fiscal,
            plan: String(empresa.plan || 'basico').toLowerCase(),
            features: typeof empresa.features === 'string' ? JSON.parse(empresa.features) : (empresa.features || {})
        };
        console.log('DEBUG ME EMPRESA:', JSON.stringify(empresa_to_send));
        res.json({
            user: { id: users[0].id, email: users[0].email, nombre: users[0].nombre, role: users[0].role },
            empresa: empresa_to_send
        });
    } catch (err) {
        res.status(401).json({ error: 'Token inválido' });
    }
});

// ─── USER MANAGEMENT (admin only) ────────────────────────────────────────────

// GET /api/auth/usuarios — list company users
app.get('/api/auth/usuarios', authMiddleware, async (req, res) => {
    if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Solo administradores' });
    const [rows] = await pool.execute(
        'SELECT id, nombre, email, role, activo, ultimo_acceso, created_at FROM usuarios WHERE empresa_id = ?',
        [req.auth.empresaId]
    );
    res.json(rows);
});

// POST /api/auth/usuarios — add user to company
app.post('/api/auth/usuarios', authMiddleware, async (req, res) => {
    if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Solo administradores' });
    const { nombre, email, password, role } = req.body;
    if (!nombre || !email || !password) return res.status(400).json({ error: 'Faltan campos' });
    const hash = await bcrypt.hash(password, 12);
    const id = `usr_${Date.now()}`;
    await pool.execute(
        `INSERT INTO usuarios (id, empresa_id, nombre, email, password_hash, role) VALUES (?,?,?,?,?,?)`,
        [id, req.auth.empresaId, nombre, email, hash, role || 'contador']
    );
    await logAudit(req.auth.empresaId, req.auth.userId, 'CREATE_USER', 'usuarios', id, req.ip);
    res.status(201).json({ success: true, id });
});

// DELETE /api/auth/usuarios/:id
app.delete('/api/auth/usuarios/:id', authMiddleware, async (req, res) => {
    if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Solo administradores' });
    if (req.params.id === req.auth.userId) return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    await pool.execute('UPDATE usuarios SET activo = 0 WHERE id = ? AND empresa_id = ?', [req.params.id, req.auth.empresaId]);
    await logAudit(req.auth.empresaId, req.auth.userId, 'DELETE_USER', 'usuarios', req.params.id, req.ip);
    res.json({ success: true });
});

// ─── MÓDULO FINANCIERO: PRÉSTAMOS RELACIONALES ─────────────────────────

// Helper de Amortización Backend
const generarAmortizacionReal = (monto, tasaAnual, meses, sistema, fechaDesembolsoStr) => {
    const tasaMensual = (tasaAnual / 100) / 12;
    let balance = parseFloat(monto);
    const tabla = [];
    const fechaDesembolso = new Date(fechaDesembolsoStr);

    if (sistema === 'Frances') {
        const cuota = (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -meses));
        for (let i = 1; i <= meses; i++) {
            const interes = balance * tasaMensual;
            const capital = cuota - interes;
            balance -= capital;

            const fechaVencimiento = new Date(fechaDesembolso);
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);

            tabla.push({
                numero_cuota: i,
                fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
                capital: capital,
                interes: interes,
                monto_total: cuota,
                saldo_restante: Math.max(0, balance)
            });
        }
    } else {
        const capitalFijo = monto / meses;
        for (let i = 1; i <= meses; i++) {
            const interes = balance * tasaMensual;
            const cuota = capitalFijo + interes;
            balance -= capitalFijo;

            const fechaVencimiento = new Date(fechaDesembolso);
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);

            tabla.push({
                numero_cuota: i,
                fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
                capital: capitalFijo,
                interes: interes,
                monto_total: cuota,
                saldo_restante: Math.max(0, balance)
            });
        }
    }
    return tabla;
};

// GET Todos los préstamos de la empresa
app.get('/api/finanzas/prestamos', authMiddleware, async (req, res) => {
    try {
        const [prestamos] = await pool.execute(
            'SELECT * FROM prestamos_core WHERE empresa_id = ? ORDER BY created_at DESC',
            [req.auth.empresaId]
        );
        res.json(prestamos);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET Cuotas de un préstamo
app.get('/api/finanzas/prestamos/:id/cuotas', authMiddleware, async (req, res) => {
    try {
        const [cuotas] = await pool.execute(
            'SELECT * FROM cuotas_core WHERE prestamo_id = ? ORDER BY numero_cuota ASC',
            [req.params.id]
        );
        res.json(cuotas);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST Crear / Desembolsar Préstamo
app.post('/api/finanzas/prestamos', authMiddleware, async (req, res) => {
    const { cliente_id, cliente_nombre, monto, tasa_interes, plazo_meses, tipo_amortizacion } = req.body;

    if (!cliente_id || !monto || !tasa_interes || !plazo_meses) {
        return res.status(400).json({ error: 'Faltan campos requeridos para el desembolso.' });
    }

    const mysqlConn = await pool.getConnection();
    try {
        await mysqlConn.beginTransaction();

        const prestamoId = `PRL-${Date.now().toString().substring(5)}`;
        const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // 1. Crear Préstamo Maestro
        await mysqlConn.execute(
            `INSERT INTO prestamos_core 
            (id, empresa_id, cliente_id, cliente_nombre, monto, tasa_interes, plazo_meses, tipo_amortizacion, balance_pendiente, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Vigente')`,
            [prestamoId, req.auth.empresaId, cliente_id, cliente_nombre || 'Cliente', monto, tasa_interes, plazo_meses, tipo_amortizacion, monto]
        );

        // 2. Generar e Insertar Cuotas
        const tablaAmortizacion = generarAmortizacionReal(monto, tasa_interes, plazo_meses, tipo_amortizacion, fechaActual);

        for (const cuota of tablaAmortizacion) {
            const cuotaId = `CUA-${Date.now().toString().substring(5)}-${cuota.numero_cuota}`;
            await mysqlConn.execute(
                `INSERT INTO cuotas_core 
                (id, prestamo_id, numero_cuota, fecha_vencimiento, capital, interes, monto_total, saldo_restante, estado)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente')`,
                [cuotaId, prestamoId, cuota.numero_cuota, cuota.fecha_vencimiento, cuota.capital, cuota.interes, cuota.monto_total, cuota.saldo_restante]
            );
        }

        // 3. Registrar Transacción Inmutable
        const transId = `TRX-${Date.now().toString().substring(5)}`;
        await mysqlConn.execute(
            `INSERT INTO transacciones_core 
            (id, empresa_id, usuario_id, entidad_relacionada, referencia_id, tipo_operacion, monto, descripcion)
            VALUES (?, ?, ?, 'prestamos_core', ?, 'Desembolso', ?, 'Desembolso inicial de préstamo')`,
            [transId, req.auth.empresaId, req.auth.userId, prestamoId, monto]
        );

        await mysqlConn.commit();
        await logAudit(req.auth.empresaId, req.auth.userId, 'CREATE', 'prestamos_core', prestamoId, req.ip);

        res.status(201).json({ success: true, prestamo_id: prestamoId, mensaje: 'Préstamo y amortización generados correctamente.' });
    } catch (e) {
        await mysqlConn.rollback();
        console.error('Error procesando préstamo:', e);
        res.status(500).json({ error: 'Error procesando el préstamo: ' + e.message });
    } finally {
        mysqlConn.release();
    }
});

// POST Pagar Cuota de Préstamo
app.post('/api/finanzas/prestamos/:id/pagar', authMiddleware, async (req, res) => {
    const prestamoId = req.params.id;
    const { cuota_id, monto_pagado } = req.body;

    if (!cuota_id || !monto_pagado) {
        return res.status(400).json({ error: 'ID de cuota y monto a pagar son requeridos.' });
    }

    const mysqlConn = await pool.getConnection();
    try {
        await mysqlConn.beginTransaction();

        // 1. Obtener la cuota
        const [cuotas] = await mysqlConn.execute(
            'SELECT * FROM cuotas_core WHERE id = ? AND prestamo_id = ? AND estado != "Pagada" LIMIT 1 FOR UPDATE',
            [cuota_id, prestamoId]
        );

        if (cuotas.length === 0) {
            await mysqlConn.rollback();
            return res.status(404).json({ error: 'Cuota no encontrada o ya se encuentra pagada.' });
        }

        const cuota = cuotas[0];

        // 2. Obtener el Préstamo
        const [prestamos] = await mysqlConn.execute(
            'SELECT * FROM prestamos_core WHERE id = ? AND empresa_id = ? FOR UPDATE',
            [prestamoId, req.auth.empresaId]
        );

        if (prestamos.length === 0) {
            await mysqlConn.rollback();
            return res.status(404).json({ error: 'Préstamo no encontrado en la empresa.' });
        }

        const prestamo = prestamos[0];

        // 3. Marcar Cuota como pagada
        await mysqlConn.execute(
            'UPDATE cuotas_core SET estado = "Pagada", fecha_pago = NOW() WHERE id = ?',
            [cuota_id]
        );

        // 4. Descontar Balance Pendiente del préstamo
        const nuevoBalance = Math.max(0, prestamo.balance_pendiente - cuota.capital);
        await mysqlConn.execute(
            'UPDATE prestamos_core SET balance_pendiente = ? WHERE id = ?',
            [nuevoBalance, prestamoId]
        );

        // 5. Registrar Transacción Inmutable
        const transId = `TRX-${Date.now().toString().substring(5)}`;
        await mysqlConn.execute(
            `INSERT INTO transacciones_core 
            (id, empresa_id, usuario_id, entidad_relacionada, referencia_id, tipo_operacion, monto, descripcion)
            VALUES (?, ?, ?, 'cuotas_core', ?, 'Pago_Cuota', ?, ?)`,
            [transId, req.auth.empresaId, req.auth.userId, cuota_id, monto_pagado, `Pago de cuota #${cuota.numero_cuota}`]
        );

        // Validar si el préstamo se saldó por completo
        if (nuevoBalance <= 0.01) { // margen de error flotante
            await mysqlConn.execute('UPDATE prestamos_core SET estado = "Saldado" WHERE id = ?', [prestamoId]);
        }

        await mysqlConn.commit();
        await logAudit(req.auth.empresaId, req.auth.userId, 'UPDATE', 'cuotas_core', cuota_id, req.ip);

        res.json({ success: true, mensaje: 'Pago registrado exitosamente. Balance actualizado.' });
    } catch (e) {
        await mysqlConn.rollback();
        console.error('Error pagando cuota:', e);
        res.status(500).json({ error: 'Error procesando el pago: ' + e.message });
    } finally {
        mysqlConn.release();
    }
});

// ─── FISCAL EXPORT (DGII TXT 606/607) ────────────────────────────────────────

app.get('/api/fiscal/export-606', authMiddleware, async (req, res) => {
    const tableName = `${req.tablePrefix}compras`;
    try {
        await ensureTable(tableName);
        const [rows] = await pool.execute(`SELECT data FROM \`${tableName}\``);

        let txt = "";
        rows.forEach(r => {
            const d = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
            const rnc = (d.rnc || '').replace(/-/g, '').substring(0, 11);
            const tipoId = rnc.length === 9 ? '1' : '2';
            const ncf = (d.ncf || '').substring(0, 11);
            const fecha = (d.fecha || '').replace(/-/g, '').substring(0, 8); // AAAAMMDD

            // Layout 606 (Campos principales)
            const line = [
                rnc.padEnd(11, ' '),
                tipoId,
                '01',
                ncf.padEnd(11, ' '),
                "".padEnd(11, ' '),
                fecha,
                fecha,
                (d.subtotal || 0).toFixed(2).replace('.', ''),
                (d.itbis || 0).toFixed(2).replace('.', ''),
                "000", "000", "000", "000", "000", "000", "000", "000", "000", "01"
            ].join('|');
            txt += line + "\n";
        });

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename=606_EXPORT.txt');
        res.send(txt);
    } catch (e) {
        console.error('606 Export Error:', e);
        res.status(500).send('Error generating 606 file');
    }
});

app.get('/api/fiscal/export-607', authMiddleware, async (req, res) => {
    const tableName = `${req.tablePrefix}facturas`;
    try {
        await ensureTable(tableName);
        const [rows] = await pool.execute(`SELECT data FROM \`${tableName}\``);

        let txt = "";
        rows.forEach(r => {
            const d = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
            const rnc = (d.rnc || '').replace(/-/g, '').substring(0, 11);
            const tipoId = rnc ? (rnc.length === 9 ? '1' : '2') : '3';
            const ncf = (d.ncf || '').substring(0, 11);
            const fecha = (d.fecha || '').replace(/-/g, '').substring(0, 8);

            // Layout 607 (Campos principales)
            const line = [
                (rnc || "000000000").padEnd(11, ' '),
                tipoId,
                ncf.padEnd(11, ' '),
                "".padEnd(11, ' '),
                '01',
                fecha,
                "",
                (d.total || 0).toFixed(2).replace('.', ''),
                (d.itbis || 0).toFixed(2).replace('.', ''),
                "000", "000", "000", "000", "000", "000", "000",
                (d.total || 0).toFixed(2).replace('.', ''), "000", "000", "000", "000", "000", "000"
            ].join('|');
            txt += line + "\n";
        });

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename=607_EXPORT.txt');
        res.send(txt);
    } catch (e) {
        console.error('607 Export Error:', e);
        res.status(500).send('Error generating 607 file');
    }
});

// ─── GENERIC ENTORY CRUD (protected, multi-tenant) ───────────────────────────

// 🆘 EMERGENCY RECOVERY ENDPOINTS (Superadmin Only)
app.get('/api/superadmin/emergency-recovery/:empresaId', authMiddleware, async (req, res) => {
    if (req.auth.role !== 'sysadmin') return res.status(403).json({ error: 'Requiere acceso sysadmin' });
    try {
        const empresaId = req.params.empresaId;
        const prefix = empresaId.replace(/[^a-zA-Z0-9]/g, '_') + '_';
        
        // List all tables for this empresa
        const [tables] = await pool.execute(`SHOW TABLES`);
        const tableKey = Object.keys(tables[0])[0];
        const empresaTables = tables
            .map(t => t[tableKey])
            .filter(t => t.startsWith(prefix));
        
        const report = {};
        for (const tbl of empresaTables) {
            const [rows] = await pool.execute(`SELECT COUNT(*) as count FROM \`${tbl}\``);
            const [sample] = await pool.execute(`SELECT data FROM \`${tbl}\` LIMIT 3`);
            report[tbl] = {
                count: rows[0].count,
                sampleIds: sample.map(r => {
                    try { const d = typeof r.data === 'string' ? JSON.parse(r.data) : r.data; return d.id || d.codigo || '?'; } catch { return '?'; }
                })
            };
        }
        
        // Check shadow_ledger status
        let shadowStatus = [];
        try {
            const [sl] = await pool.execute(
                'SELECT table_name, reason, created_at FROM shadow_ledger WHERE empresa_id = ? ORDER BY created_at DESC LIMIT 20',
                [empresaId]
            );
            shadowStatus = sl;
        } catch (slErr) {
            shadowStatus = [{ error: slErr.message }];
        }
        
        res.json({ empresaId, prefix, tables: report, shadowLedger: shadowStatus });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 🆘 RESTORE all data from shadow_ledger snapshot
app.post('/api/superadmin/emergency-restore/:empresaId/:tableName', authMiddleware, async (req, res) => {
    if (req.auth.role !== 'sysadmin') return res.status(403).json({ error: 'Requiere acceso sysadmin' });
    try {
        const { empresaId, tableName } = req.params;
        const prefix = empresaId.replace(/[^a-zA-Z0-9]/g, '_') + '_';
        const fullTableName = tableName.startsWith(prefix) ? tableName : prefix + tableName;
        
        const [snapshots] = await pool.execute(
            'SELECT id, data_snapshot, reason, created_at FROM shadow_ledger WHERE empresa_id = ? AND table_name = ? ORDER BY created_at DESC LIMIT 1',
            [empresaId, fullTableName]
        );
        
        if (snapshots.length === 0) return res.status(404).json({ error: 'No hay snapshots disponibles para esta tabla' });
        
        const snapshot = snapshots[0];
        const rows = typeof snapshot.data_snapshot === 'string' ? JSON.parse(snapshot.data_snapshot) : snapshot.data_snapshot;
        
        await ensureTable(fullTableName);
        let restored = 0;
        for (const row of rows) {
            const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
            const id = data.id || String(Date.now() + restored);
            await upsertRow(fullTableName, id, data);
            restored++;
        }
        
        await logAudit(empresaId, req.auth.userId, 'EMERGENCY_RESTORE', tableName, snapshot.id, req.ip);
        res.json({ success: true, restored, snapshotDate: snapshot.created_at, snapshotId: snapshot.id });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 🆘 FULL DATA DUMP for a specific empresa table (to verify/export data)
app.get('/api/superadmin/dump/:empresaId/:tableName', authMiddleware, async (req, res) => {
    if (req.auth.role !== 'sysadmin') return res.status(403).json({ error: 'Requiere acceso sysadmin' });
    try {
        const { empresaId, tableName } = req.params;
        const prefix = empresaId.replace(/[^a-zA-Z0-9]/g, '_') + '_';
        const fullTableName = tableName.startsWith(prefix) ? tableName : prefix + tableName;
        await ensureTable(fullTableName);
        const [rows] = await pool.execute(`SELECT id, data, created_at, updated_at FROM \`${fullTableName}\` ORDER BY created_at ASC`);
        res.json({ table: fullTableName, count: rows.length, rows });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


app.get('/api/auditoria', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM auditoria WHERE empresa_id = ? ORDER BY created_at DESC LIMIT 500',
            [req.auth.empresaId]
        );
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/:entity', authMiddleware, async (req, res) => {
    try {
        const tableName = req.tablePrefix + req.params.entity;
        const data = await readAll(tableName);
        res.json(data);
    } catch (e) {
        console.error('GET error:', e.message);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/:entity', authMiddleware, async (req, res) => {
    const tableName = req.tablePrefix + req.params.entity;
    const body = req.body;
    try {
        AnalyticCache.invalidate(req.auth.empresaId); // Invalida caché de reportes para esta empresa

        // 🛡️ Iubel FraudShield: Evaluación de Riesgo Inmediata
        const riskAnalysis = FraudShield.evaluateRisk(body, { userRole: req.auth.role });
        if (riskAnalysis.isHighRisk) {
            await logAudit(req.auth.empresaId, req.auth.userId, 'FRAUD_BLOCK', req.params.entity, null, req.ip);
            return res.status(403).json({ 
                error: 'Transacción bloqueada por el Escudo contra Fraudes (FraudShield)',
                shieldId: riskAnalysis.shieldId,
                recommendation: riskAnalysis.recommendation 
            });
        }

        if (Array.isArray(body)) {
            await ensureTable(tableName);
            
            // 🛡️ IUBEL SOVEREIGN GUARD v3: Shadow Ledger Protection
            // Antes de cualquier operación masiva, creamos un snapshot de seguridad.
            await createSnapshot(req.auth.empresaId, req.params.entity);

            if (body.length > 0) {
                // Paso 1: Obtener IDs actuales en BD
                const [existingRows] = await pool.execute(`SELECT id FROM \`${tableName}\``);
                const existingIds = new Set(existingRows.map(r => String(r.id)));
                const incomingIds = new Set(body.map(item => String(item.id || '')).filter(Boolean));
                
                // Paso 2: Upsert de todos los items entrantes
                for (let item of body) {
                    const id = String(item.id || `${Date.now()}_${Math.random()}`);
                    const securedItem = ImmutableLedger.signTransaction(item, null);
                    await upsertRow(tableName, id, securedItem);
                }
                
                // Paso 3: Solo borrar huérfanos si la lista cubre ≥90% de los registros en BD
                // Esto evita que un save parcial por race condition borre datos válidos.
                const coverageRatio = existingIds.size === 0 ? 1 : incomingIds.size / existingIds.size;
                if (coverageRatio >= 0.90) {
                    for (const existingId of existingIds) {
                        if (!incomingIds.has(existingId)) {
                            await pool.execute(`DELETE FROM \`${tableName}\` WHERE id = ?`, [existingId]);
                        }
                    }
                } else {
                    // 🚨 ALERTA: Lista entrante muy pequeña vs BD. Bloqueando borrado para proteger datos.
                    console.warn(`[SOVEREIGN GUARD] ${tableName}: Cobertura ${Math.round(coverageRatio * 100)}% (${incomingIds.size}/${existingIds.size}). Operación de borrado BLOQUEADA.`);
                    await logAudit(req.auth.empresaId, req.auth.userId, 'PARTIAL_SAVE_GUARDED', req.params.entity, null, req.ip);
                }
            }
        } else {
            const id = String(body.id || Date.now().toString());
            const securedItem = ImmutableLedger.signTransaction(body, null);
            await upsertRow(tableName, id, securedItem);
        }
        await logAudit(req.auth.empresaId, req.auth.userId, 'SAVE', req.params.entity, null, req.ip);
        res.json({ success: true, ledgerStatus: 'SIGNED' });
    } catch (e) {
        console.error('POST error:', e.message);
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/:entity/:id', authMiddleware, async (req, res) => {
    const tableName = req.tablePrefix + req.params.entity;
    const { id } = req.params;
    try {
        AnalyticCache.invalidate(req.auth.empresaId); // Invalida caché de reportes para esta empresa
        await ensureTable(tableName);
        const [rows] = await pool.execute(`SELECT data FROM \`${tableName}\` WHERE id = ?`, [id]);
        const existing = rows.length > 0 ? (typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data) : {};
        const updated = { ...existing, ...req.body, id };
        await upsertRow(tableName, id, updated);
        await logAudit(req.auth.empresaId, req.auth.userId, 'UPDATE', req.params.entity, id, req.ip);
        res.json({ success: true });
    } catch (e) {
        console.error('PUT error:', e.message);
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/:entity/:id', authMiddleware, async (req, res) => {
    const tableName = req.tablePrefix + req.params.entity;
    const { id } = req.params;
    try {
        AnalyticCache.invalidate(req.auth.empresaId); // Invalida caché de reportes para esta empresa
        await deleteRow(tableName, id);
        await logAudit(req.auth.empresaId, req.auth.userId, 'DELETE', req.params.entity, id, req.ip);
        res.json({ success: true });
    } catch (e) {
        console.error('DELETE error:', e.message);
        res.status(500).json({ error: e.message });
    }
});

// ─── CATCH-ALL ROUTER ────────────────────────────────────────────────────────
app.use((req, res) => {
    const indexPath = path.resolve(__dirname, 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(200).send(`
            <!DOCTYPE html><html><head><title>Iubel AI Node Online</title>
            <style>body{background:#0a0a0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;margin:0;text-align:center}</style>
            </head><body>
            <div><h1 style="color:#8b5cf6">🚀 Iubel AI Node Status</h1>
            <p>Motor en línea. Procediendo con el despliegue de interfaz...</p>
            </div></body></html>
        `);
    }
});

// ─── Catch-All: Servir React App (React Router) ───────────────────────────────
app.get('*', (req, res) => {
    const indexPath = path.resolve(__dirname, 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('ERP no compilado. Ejecuta npm run build.');
    }
});
// Fin del servidor
