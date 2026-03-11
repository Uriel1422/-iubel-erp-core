const mysql = require('mysql2/promise');

async function clean() {
    const keepIds = ['emp_1773003016619', 'emp_1773102897948', 'emp_1772681947411'];
    const pool = mysql.createPool({ 
        host: 'localhost', 
        user: 'root', 
        password: 'Ribeu@bel17$', 
        database: 'iubel_erp' 
    });

    try {
        console.log('Iniciando limpieza...');
        
        // El id NOT IN espera una lista de strings.
        const idList = keepIds.map(id => `'${id}'`).join(',');

        const [resUsers] = await pool.execute(`DELETE FROM usuarios WHERE empresa_id NOT IN (${idList})`);
        console.log(`Usuarios eliminados: ${resUsers.affectedRows}`);

        const [resEmp] = await pool.execute(`DELETE FROM empresas WHERE id NOT IN (${idList})`);
        console.log(`Empresas eliminadas: ${resEmp.affectedRows}`);

        console.log('Limpieza profunda completada con éxito.');
    } catch (e) {
        console.error('Error durante la limpieza:', e);
    } finally {
        await pool.end();
    }
}

clean();
