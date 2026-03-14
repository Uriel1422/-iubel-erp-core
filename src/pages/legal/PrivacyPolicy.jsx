import React from 'react';
import { Lock, EyeOff, ShieldCheck, Database } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem', color: '#f8fafc', lineHeight: '1.6' }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{ width: 64, height: 64, background: 'rgba(16,185,129,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Lock size={32} color="#10b981" />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Política de Privacidad</h1>
                <p style={{ color: '#94a3b8' }}>Última actualización: 14 de Marzo, 2026</p>
            </header>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1rem', color: '#10b981' }}>
                    <EyeOff size={20} /> 1. Recolección de Información
                </h2>
                <p>En Iubel Cloud, recolectamos información personal mínima necesaria para proveer el servicio, como su nombre, correo electrónico y datos de su empresa. No vendemos ni compartimos su información con terceros para fines comerciales.</p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1rem', color: '#10b981' }}>
                    <Database size={20} /> 2. Seguridad de los Datos
                </h2>
                <p>Sus datos empresariales están cifrados y almacenados en servidores de alta seguridad. Implementamos medidas técnicas y organizativas para proteger su información contra pérdida, robo o acceso no autorizado.</p>
            </section>

            <section style={{ marginBottom: '3rem', padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1rem', color: '#38bdf8' }}>
                    <ShieldCheck size={20} /> 3. Transacciones Financieras
                </h2>
                <p>Iubel Cloud utiliza <strong>Stripe</strong> para el procesamiento de pagos. Nosotros <strong>no almacenamos los datos de su tarjeta de crédito</strong>. Toda la información financiera es manejada directamente por Stripe bajo los estándares de seguridad <strong>PCI-DSS</strong>.</p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1rem', color: '#10b981' }}>
                    4. Sus Derechos
                </h2>
                <p>Usted tiene derecho a acceder, rectificar o eliminar sus datos personales en cualquier momento a través de la configuración de su cuenta o contactando a nuestro equipo de soporte.</p>
            </section>

            <footer style={{ marginTop: '5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                © 2026 Iubel Cloud Security Ops. Privacidad garantizada.
            </footer>
        </div>
    );
};

export default PrivacyPolicy;
