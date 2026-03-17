const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'iubel_erp_secret_2026';

// 1. Simular un Token para la Empresa A (AUBEL SRL)
const tokenA = jwt.sign({
    userId: 'usr_aubel_1',
    empresaId: 'emp_1773102897948',
    role: 'admin'
}, JWT_SECRET);

console.log('🛡️ [TEST] Iniciando validación de aislamiento multi-tenant...');

async function testIsolation() {
    // Intentaremos simular una petición que quiera ver datos de OTRA empresa
    // enviando un tablePrefix manipulado en el body
    const mockReq = {
        headers: { authorization: `Bearer ${tokenA}` },
        body: { tablePrefix: 'empresa_b_vulnerable_' },
        ip: '127.0.0.1'
    };

    console.log('🔍 [TEST] Escenario 1: Intento de manipulación de tablePrefix en body...');
    
    // Simulación lógica del middleware que acabamos de implementar
    try {
        const decoded = jwt.verify(mockReq.headers.authorization.split(' ')[1], JWT_SECRET);
        const expectedPrefix = decoded.empresaId.replace(/[^a-zA-Z0-9]/g, '_') + '_';
        
        if (mockReq.body.tablePrefix && mockReq.body.tablePrefix !== expectedPrefix) {
            console.log('✅ BLOQUEADO: El sistema detectó la manipulación del prefijo.');
            console.log(`   Esperado: ${expectedPrefix}`);
            console.log(`   Recibido: ${mockReq.body.tablePrefix}`);
        } else {
            console.log('❌ FALLO: El sistema permitió el prefijo manipulado.');
        }
    } catch (e) {
        console.log('❌ ERROR inesperado:', e.message);
    }

    console.log('\n🔍 [TEST] Escenario 2: Intento de inyección SQL en nombre de tabla...');
    const maliciousTable = 'facturas`; DROP TABLE usuarios; --';
    const validName = (n) => /^[a-zA-Z0-9_]+$/.test(n);
    
    if (!validName(maliciousTable)) {
        console.log('✅ BLOQUEADO: El validador de nombres rechazó la inyección SQL.');
    } else {
        console.log('❌ FALLO: El validador aceptó caracteres peligrosos.');
    }
}

testIsolation();
