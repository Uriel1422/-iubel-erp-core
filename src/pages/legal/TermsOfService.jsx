import React from 'react';
import { Shield, Scale, ScrollText, AlertCircle } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem', color: '#f8fafc', lineHeight: '1.6' }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{ width: 64, height: 64, background: 'rgba(99,102,241,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Scale size={32} color="#6366f1" />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Términos de Servicio</h1>
                <p style={{ color: '#94a3b8' }}>Última actualización: 14 de Marzo, 2026</p>
            </header>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1rem', color: '#6366f1' }}>
                    <Shield size={20} /> 1. Aceptación de los Términos
                </h2>
                <p>Al acceder y utilizar <strong>Iubel Cloud ERP</strong>, usted acepta cumplir con estos términos y condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.</p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1rem', color: '#6366f1' }}>
                    <ScrollText size={20} /> 2. Descripción del Servicio
                </h2>
                <p>Iubel Cloud proporciona un software de gestión empresarial (ERP) basado en la nube. Nos reservamos el derecho de modificar, suspender o interrumpir el servicio en cualquier momento, con o sin previo aviso, para garantizar la mejora y seguridad de la plataforma.</p>
            </section>

            <section style={{ marginBottom: '3rem', padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1rem', color: '#fbbf24' }}>
                    <AlertCircle size={20} /> 3. Suscripciones y Pagos
                </h2>
                <p>El uso de ciertas funciones de Iubel Cloud requiere una suscripción pagada. Los pagos se procesan de forma segura a través de <strong>Stripe</strong>. Las cancelaciones deben realizarse antes del próximo ciclo de facturación para evitar cargos adicionales.</p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1rem', color: '#6366f1' }}>
                    4. Responsabilidad del Usuario
                </h2>
                <p>Usted es responsable de mantener la confidencialidad de sus credenciales de acceso y de toda la actividad que ocurra bajo su cuenta. Iubel Cloud no se hace responsable de pérdidas causadas por el uso no autorizado de su cuenta.</p>
            </section>

            <footer style={{ marginTop: '5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                © 2026 Iubel Cloud Administration. Todos los derechos reservados.
            </footer>
        </div>
    );
};

export default TermsOfService;
