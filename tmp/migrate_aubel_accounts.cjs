const mysql = require('mysql2/promise');
require('dotenv').config();

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

const accounts = [
    // 1 ACTIVOS
    { id: '1', codigo: '1', nombre: 'ACTIVOS', tipo: 'Activo', subtipo: 'General', padreId: null, nivel: 1 },
    { id: '11', codigo: '11', nombre: 'Activos Circulantes', tipo: 'Activo', subtipo: 'Circulante', padreId: '1', nivel: 2 },
    { id: '1101', codigo: '1101', nombre: 'Efectivo en Caja y Banco', tipo: 'Activo', subtipo: 'Cuenta Control', padreId: '11', nivel: 3 },
    { id: '110101', codigo: '110101', nombre: 'Caja General', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1101', nivel: 4 },
    { id: '110102', codigo: '110102', nombre: 'Banco Cuenta Corriente', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1101', nivel: 4 },
    { id: '1102', codigo: '1102', nombre: 'Cuentas por Cobrar', tipo: 'Activo', subtipo: 'Cuenta Control', padreId: '11', nivel: 3 },
    { id: '110201', codigo: '110201', nombre: 'Clientes', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1102', nivel: 4 },
    { id: '110202', codigo: '110202', nombre: 'Cuentas por Cobrar Empleados', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1102', nivel: 4 },
    { id: '1103', codigo: '1103', nombre: 'Anticipos y Adelantos', tipo: 'Activo', subtipo: 'Cuenta Control', padreId: '11', nivel: 3 },
    { id: '110301', codigo: '110301', nombre: 'Anticipos a Proveedores', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1103', nivel: 4 },
    { id: '1104', codigo: '1104', nombre: 'Inventarios', tipo: 'Activo', subtipo: 'Cuenta Control', padreId: '11', nivel: 3 },
    { id: '110401', codigo: '110401', nombre: 'Inventario de Mercancía', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1104', nivel: 4 },
    { id: '110402', codigo: '110402', nombre: 'Mercancía en Tránsito', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1104', nivel: 4 },
    { id: '1105', codigo: '1105', nombre: 'Impuestos Adelantados', tipo: 'Activo', subtipo: 'Cuenta Control', padreId: '11', nivel: 3 },
    { id: '110501', codigo: '110501', nombre: 'ITBIS Adelantado en Compras', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1105', nivel: 4 },
    { id: '12', codigo: '12', nombre: 'Activos Fijos', tipo: 'Activo', subtipo: 'Planta y Propiedad', padreId: '1', nivel: 2 },
    { id: '1201', codigo: '1201', nombre: 'Mobiliario y Equipos', tipo: 'Activo', subtipo: 'Cuenta Control', padreId: '12', nivel: 3 },
    { id: '120101', codigo: '120101', nombre: 'Muebles de Oficina', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1201', nivel: 4 },
    { id: '120102', codigo: '120102', nombre: 'Equipos de Computación', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1201', nivel: 4 },
    { id: '120103', codigo: '120103', nombre: 'Maquinaria y Equipos', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1201', nivel: 4 },
    { id: '1202', codigo: '1202', nombre: 'Depreciación Acumulada', tipo: 'Activo', subtipo: 'Cuenta Control', padreId: '12', nivel: 3 },
    { id: '120201', codigo: '120201', nombre: 'Dep. Acum. Mobiliario', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1202', nivel: 4 },
    { id: '120202', codigo: '120202', nombre: 'Dep. Acum. Equipos de Computación', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1202', nivel: 4 },
    { id: '120203', codigo: '120203', nombre: 'Dep. Acum. Maquinaria y Equipos', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1202', nivel: 4 },

    // 2 PASIVOS
    { id: '2', codigo: '2', nombre: 'PASIVOS', tipo: 'Pasivo', subtipo: 'General', padreId: null, nivel: 1 },
    { id: '21', codigo: '21', nombre: 'Pasivos Circulantes', tipo: 'Pasivo', subtipo: 'Circulante', padreId: '2', nivel: 2 },
    { id: '2101', codigo: '2101', nombre: 'Cuentas por Pagar', tipo: 'Pasivo', subtipo: 'Cuenta Control', padreId: '21', nivel: 3 },
    { id: '210101', codigo: '210101', nombre: 'Proveedores', tipo: 'Pasivo', subtipo: 'Cuenta Detalle', padreId: '2101', nivel: 4 },
    { id: '210102', codigo: '210102', nombre: 'Proveedores Locales', tipo: 'Pasivo', subtipo: 'Cuenta Detalle', padreId: '2101', nivel: 4 },
    { id: '2102', codigo: '2102', nombre: 'Impuestos por Pagar', tipo: 'Pasivo', subtipo: 'Cuenta Control', padreId: '21', nivel: 3 },
    { id: '210201', codigo: '210201', nombre: 'ITBIS por Pagar', tipo: 'Pasivo', subtipo: 'Cuenta Detalle', padreId: '2102', nivel: 4 },
    { id: '210202', codigo: '210202', nombre: 'Retenciones por Pagar', tipo: 'Pasivo', subtipo: 'Cuenta Detalle', padreId: '2102', nivel: 4 },
    { id: '2103', codigo: '2103', nombre: 'Otras Cuentas por Pagar', tipo: 'Pasivo', subtipo: 'Cuenta Control', padreId: '21', nivel: 3 },
    { id: '210301', codigo: '210301', nombre: 'Sueldos por Pagar', tipo: 'Pasivo', subtipo: 'Cuenta Detalle', padreId: '2103', nivel: 4 },
    { id: '210302', codigo: '210302', nombre: 'Comisiones por Pagar', tipo: 'Pasivo', subtipo: 'Cuenta Detalle', padreId: '2103', nivel: 4 },

    // 3 CAPITAL
    { id: '3', codigo: '3', nombre: 'CAPITAL', tipo: 'Capital', subtipo: 'General', padreId: null, nivel: 1 },
    { id: '3101', codigo: '3101', nombre: 'Capital Social', tipo: 'Capital', subtipo: 'Patrimonio', padreId: '3', nivel: 2 },
    { id: '32', codigo: '32', nombre: 'Resultados', tipo: 'Capital', subtipo: 'Cuenta Control', padreId: '3', nivel: 2 },
    { id: '3201', codigo: '3201', nombre: 'Resultados Acumulados', tipo: 'Capital', subtipo: 'Cuenta Detalle', padreId: '32', nivel: 3 },
    { id: '3202', codigo: '3202', nombre: 'Resultados del Período', tipo: 'Capital', subtipo: 'Cuenta Detalle', padreId: '32', nivel: 3 },

    // 4 INGRESOS
    { id: '4', codigo: '4', nombre: 'INGRESOS', tipo: 'Ingreso', subtipo: 'General', padreId: null, nivel: 1 },
    { id: '41', codigo: '41', nombre: 'Ingresos Operacionales', tipo: 'Ingreso', subtipo: 'Cuenta Control', padreId: '4', nivel: 2 },
    { id: '4101', codigo: '4101', nombre: 'Ventas de Mercancía', tipo: 'Ingreso', subtipo: 'Cuenta Detalle', padreId: '41', nivel: 3 },
    { id: '4102', codigo: '4102', nombre: 'Devoluciones en Ventas', tipo: 'Ingreso', subtipo: 'Cuenta Detalle', padreId: '41', nivel: 3 },
    { id: '4103', codigo: '4103', nombre: 'Descuentos en Ventas', tipo: 'Ingreso', subtipo: 'Cuenta Detalle', padreId: '41', nivel: 3 },
    { id: '4104', codigo: '4104', nombre: 'Otros Ingresos', tipo: 'Ingreso', subtipo: 'Cuenta Control', padreId: '41', nivel: 3 },
    { id: '410401', codigo: '410401', nombre: 'Servicios de Impresión', tipo: 'Ingreso', subtipo: 'Cuenta Detalle', padreId: '4104', nivel: 4 },
    { id: '410402', codigo: '410402', nombre: 'Fotocopias', tipo: 'Ingreso', subtipo: 'Cuenta Detalle', padreId: '4104', nivel: 4 },
    { id: '410403', codigo: '410403', nombre: 'Encuadernaciones', tipo: 'Ingreso', subtipo: 'Cuenta Detalle', padreId: '4104', nivel: 4 },

    // 5 COSTOS
    { id: '5', codigo: '5', nombre: 'COSTOS', tipo: 'Costo', subtipo: 'General', padreId: null, nivel: 1 },
    { id: '51', codigo: '51', nombre: 'Costos Directos', tipo: 'Costo', subtipo: 'Cuenta Control', padreId: '5', nivel: 2 },
    { id: '5101', codigo: '5101', nombre: 'Costo de Ventas', tipo: 'Costo', subtipo: 'Cuenta Control', padreId: '51', nivel: 3 },
    { id: '510101', codigo: '510101', nombre: 'Compra de Mercancía', tipo: 'Costo', subtipo: 'Cuenta Detalle', padreId: '5101', nivel: 4 },
    { id: '510102', codigo: '510102', nombre: 'Fletes en Compras', tipo: 'Costo', subtipo: 'Cuenta Detalle', padreId: '5101', nivel: 4 },

    // 6 GASTOS
    { id: '6', codigo: '6', nombre: 'GASTOS', tipo: 'Gasto', subtipo: 'General', padreId: null, nivel: 1 },
    { id: '61', codigo: '61', nombre: 'Gastos Administrativos', tipo: 'Gasto', subtipo: 'Cuenta Control', padreId: '6', nivel: 2 },
    { id: '6101', codigo: '6101', nombre: 'Sueldos y Salarios', tipo: 'Gasto', subtipo: 'Cuenta Detalle', padreId: '61', nivel: 3 },
    { id: '6102', codigo: '6102', nombre: 'Gastos de Depreciación', tipo: 'Gasto', subtipo: 'Cuenta Detalle', padreId: '61', nivel: 3 },
    { id: '6103', codigo: '6103', nombre: 'Servicios Básicos', tipo: 'Gasto', subtipo: 'Cuenta Control', padreId: '61', nivel: 3 },
    { id: '610301', codigo: '610301', nombre: 'Energía Eléctrica', tipo: 'Gasto', subtipo: 'Cuenta Detalle', padreId: '6103', nivel: 4 },
    { id: '610302', codigo: '610302', nombre: 'Internet', tipo: 'Gasto', subtipo: 'Cuenta Detalle', padreId: '6103', nivel: 4 },
    { id: '610303', codigo: '610303', nombre: 'Agua', tipo: 'Gasto', subtipo: 'Cuenta Detalle', padreId: '6103', nivel: 4 },
    { id: '6104', codigo: '6104', nombre: 'Gastos Operativos', tipo: 'Gasto', subtipo: 'Cuenta Control', padreId: '61', nivel: 3 },
    { id: '610401', codigo: '610401', nombre: 'Alquiler del Local', tipo: 'Gasto', subtipo: 'Cuenta Detalle', padreId: '6104', nivel: 4 },
    { id: '610402', codigo: '610402', nombre: 'Materiales de Limpieza', tipo: 'Gasto', subtipo: 'Cuenta Detalle', padreId: '6104', nivel: 4 },
    { id: '610403', codigo: '610403', nombre: 'Mantenimiento de Equipos', tipo: 'Gasto', subtipo: 'Cuenta Detalle', padreId: '6104', nivel: 4 },
    { id: '6105', codigo: '6105', nombre: 'Gastos Financieros', tipo: 'Gasto', subtipo: 'Cuenta Control', padreId: '61', nivel: 3 },
    { id: '610501', codigo: '610501', nombre: 'Intereses Bancarios', tipo: 'Gasto', subtipo: 'Cuenta Detalle', padreId: '6105', nivel: 4 },
    { id: '610502', codigo: '610502', nombre: 'Comisiones Bancarias', tipo: 'Gasto', subtipo: 'Cuenta Detalle', padreId: '6105', nivel: 4 },
].map(acc => ({
    ...acc,
    activa: true,
    children: []
}));

async function migrate() {
    const pool = mysql.createPool({
        ...dbConfig,
        ssl: mysqlPublicUrl ? { rejectUnauthorized: false } : undefined,
    });

    const conn = await pool.getConnection();
    try {
        console.log('--- INICIANDO MIGRACIÓN AUBEL SRL ---');
        await conn.beginTransaction();

        // 1. Crear backup de cuentas
        console.log('1. Creando backup de cuentas...');
        await conn.execute("CREATE TABLE IF NOT EXISTS `aubel_srl_cuentas_backup` LIKE `aubel_srl_cuentas`").catch(() => {});
        await conn.execute("INSERT INTO `aubel_srl_cuentas_backup` SELECT * FROM `aubel_srl_cuentas`").catch(e => console.log('Backup ya existe o error: ' + e.message));

        // 2. Mapear ID huérfano en asientos
        // ID: 1773109025474 -> Nuevo ID: 6104 (Gastos Operativos)
        console.log('2. Mapeando IDs en asientos contables...');
        const [asientos] = await conn.execute("SELECT id, data FROM `aubel_srl_asientos`").catch(() => [[]]);
        for (const asiento of asientos) {
            let data = typeof asiento.data === 'string' ? JSON.parse(asiento.data) : asiento.data;
            let modified = false;
            if (data.detalles) {
                data.detalles = data.detalles.map(d => {
                    if (d.cuentaId === '1773109025474') {
                        modified = true;
                        return { ...d, cuentaId: '6104' };
                    }
                    return d;
                });
            }
            if (modified) {
                await conn.execute("UPDATE `aubel_srl_asientos` SET data = ? WHERE id = ?", [JSON.stringify(data), asiento.id]);
            }
        }

        // 3. Limpiar catálogo actual
        console.log('3. Limpiando catálogo actual...');
        await conn.execute("DELETE FROM `aubel_srl_cuentas`").catch(() => {});

        // 4. Inyectar nuevas cuentas
        console.log('4. Inyectando nuevo catálogo...');
        for (const account of accounts) {
            await conn.execute(
                "INSERT INTO `aubel_srl_cuentas` (id, data) VALUES (?, ?)",
                [account.id, JSON.stringify(account)]
            );
        }

        await conn.commit();
        console.log('--- MIGRACIÓN EXITOSA ---');
    } catch (err) {
        await conn.rollback();
        console.error('--- ERROR EN MIGRACIÓN ---');
        console.error(err.message);
    } finally {
        conn.release();
        await pool.end();
    }
}

migrate();
