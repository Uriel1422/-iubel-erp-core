/**
 * 🕵️ FORENSIC DATA SEARCH
 * This script searches for Aubel SRL's "lost" 121 products and 69 accounts
 * across ALL tables in the database.
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const mysqlPublicUrl = process.env.MYSQL_PUBLIC_URL || process.env.DATABASE_URL || "mysql://root:qbydHljjanDtKkvqepeKBmNxHdhdHHuB@maglev.proxy.rlwy.net:48074/railway";

async function run() {
    const pool = mysql.createPool({ uri: mysqlPublicUrl, ssl: { rejectUnauthorized: false } });
    try {
        const conn = await pool.getConnection();
        console.log('🕵️ Forensic Search Started...\n');

        // 1. List ALL tables
        const [tables] = await conn.execute('SHOW TABLES');
        const tableKey = Object.keys(tables[0])[0];
        const tableNames = tables.map(t => t[tableKey]);

        // 2. Search for common Aubel keywords in table names
        const keywords = ['aubel', 'emp_1773950882655', 'emp_1773366275'];
        const matches = tableNames.filter(name => keywords.some(kw => name.toLowerCase().includes(kw)));
        console.log('🔍 Tables matching Aubel keywords:', matches.join(', ') || 'NONE');

        // 3. Search for the specific record count (121 or 69)
        console.log('\n🔍 Searching for tables with ~121 or ~69 records...');
        for (const tbl of tableNames) {
            const [c] = await conn.execute(`SELECT COUNT(*) as n FROM \`${tbl}\``);
            const n = c[0].n;
            if (n === 121 || n === 69 || n === 26 || (n > 110 && n < 130)) {
                console.log(`   🚨 Potential match: ${tbl} (${n} records)`);
            }
        }

        // 4. Check Audit Log or Shadow Ledger for recent activity
        if (tableNames.includes('shadow_ledger')) {
            console.log('\n🛡️ Checking Shadow Ledger for snapshots...');
            const [sl] = await conn.execute('SELECT table_name, reason, created_at FROM shadow_ledger ORDER BY created_at DESC LIMIT 10');
            sl.forEach(s => console.log(`   - ${s.created_at}: ${s.table_name} (${s.reason})`));
        }

        if (tableNames.includes('audit_log')) {
            console.log('\n📝 Checking Audit Log for DELETES...');
            // Adjust query based on actual audit_log structure if known, assuming 'action' or 'event'
            try {
                const [al] = await conn.execute('SELECT * FROM audit_log WHERE event_type LIKE "%DELETE%" OR event_type LIKE "%DROP%" ORDER BY created_at DESC LIMIT 10');
                al.forEach(a => console.log(`   - ${a.created_at}: ${a.event_type} on ${a.table_name}`));
            } catch (e) {
                console.log('   (Audit log structure unknown)');
            }
        }

        conn.release();
        await pool.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

run();
