import React, { useState, useMemo } from 'react';
import { Search, FileText, ChevronRight, ThumbsUp, ThumbsDown, Book, Video, MessageSquare, ArrowLeft, Send, Sparkles, Receipt, Calculator, Landmark, ShieldCheck, Mail, Clock } from 'lucide-react';

const categories = [
    { id: 'all', name: 'Todos los Artículos', icon: <Book size={18} /> },
    { id: 'getting_started', name: 'Primeros Pasos', icon: <Sparkles size={18} /> },
    { id: 'facturacion', name: 'Facturación y NCF', icon: <Receipt size={18} /> },
    { id: 'contabilidad', name: 'Contabilidad y Finanzas', icon: <Calculator size={18} /> },
    { id: 'tesoreria', name: 'Bancos y Conciliación', icon: <Landmark size={18} /> },
    { id: 'seguridad', name: 'Seguridad y Accesos', icon: <ShieldCheck size={18} /> }
];

const articlesDB = [
    {
        id: 'ncf_setup',
        category: 'facturacion',
        title: 'Cómo configurar y solicitar nuevos NCFs',
        readTime: '3 min',
        content: `
En la República Dominicana, los Números de Comprobante Fiscal (NCF) son emitidos por la DGII. Iubel ERP te facilita su gestión.

### 1. Obtener autorización de la DGII
Antes de configurar el sistema, verifica que la DGII te ha autorizado una secuencia nueva (ej. B0100000001 - B0100000100).

### 2. Registrar en Iubel
1. Ve a **Configuración** > **General**.
2. En la sección *Gestión de NCF*, selecciona el tipo (ej. Crédito Fiscal B01).
3. Introduce el número actual autorizado por DGII y el límite de advertencia.

### Importante
El sistema te enviará una notificación visual (Banner) cuando te queden menos de 10 NCF en tu secuencia. ¡Asegúrate de solicitar nuevos a tiempo!
        `
    },
    {
        id: 'formato_606',
        category: 'impuestos',
        title: 'Guía para generar el Formato 606 (Compras)',
        readTime: '4 min',
        content: `
El Formato 606 es vital para reportar tus compras y retenciones a la DGII cada mes.

### Pasos para generarlo automáticamente:
1. Navega a **Impuestos (DGII)** en el menú principal y haz clic en la pestaña **606**.
2. Selecciona el **Mes y Año** que deseas declarar.
3. Haz clic en **Generar Archivo TXT**.

### Solución de Errores Comunes
- **Un RNC está en blanco**: Asegúrate de que todos tus proveedores registrados en compras tengan su RNC o Cédula válidos (11 y 9 dígitos respectivamente).
- **Monto de ITBIS incorrecto**: Revisa la factura de compra específica. Recuerda que el sistema te permite anular el cálculo del ITBIS si marcaste la compra como "Exenta".
        `
    },
    {
        id: 'conciliacion_bancaria',
        category: 'tesoreria',
        title: 'Realizando una Conciliación Bancaria Automática',
        readTime: '5 min',
        content: `
Iubel te ahorra horas de trabajo cruzando los movimientos de tu banco con la contabilidad.

### Funcionalidades
El cruce se hace comparando:
- Número de referencia (Cheque/Transferencia).
- Fechas de corte exactas.
- Montos de depósito y retiro.

### Modo Automático
Si importas un archivo de tu extracto bancario (próximamente CSV de bancos dominicanos), nuestro motor hará un "Auto-Match" de hasta un 95% de las transacciones con tus asientos en libro, marcándolos en color verde (Conciliado).
        `
    },
    {
        id: '2fa_config',
        category: 'seguridad',
        title: 'Protege tu cuenta con la Autenticación de 2 Pasos (2FA)',
        readTime: '2 min',
        content: `
La seguridad de tu empresa es nuestra prioridad. Te recomendamos activar 2FA para evitar accesos no autorizados.

### ¿Cómo activarlo?
1. Ve a **Configuración** y selecciona la pestaña **Mi Perfil**.
2. Encuentra la sección *Autenticación de 2 Pasos*.
3. Haz clic en el botón de encendido.
4. Usa una aplicación móvil (Authy o Google Authenticator) y escanea el código QR que aparecerá.
5. Confirma digitando el código temporal (Para la demo técnica: 123456).

> **Nota para Administradores**: Próximamente podrás forzar que todos tus contadores activen 2FA antes de acceder al ERP.
        `
    },
    {
        id: 'backup_restore',
        category: 'seguridad',
        title: 'Generando y guardando copias de seguridad',
        readTime: '2 min',
        content: `
Como Administrador, tienes el control total de tus datos.

Para descargar una copia local:
1. Entra a **Configuración** > **Centro de Backups**.
2. Haz clic en el gran botón "Generar Copia de Seguridad".
3. El sistema comprimirá tu base de datos y te descargará un archivo estructurado (.json). 

*Guarda estos archivos en unidades externas seguras. Puedes usarlos como punto histórico (Point-in-Time).*
        `
    },
    {
        id: 'creacion_empresa',
        category: 'getting_started',
        title: 'Cómo crear y cambiar de Empresas (Multitenant)',
        readTime: '3 min',
        content: `
Si administras 5 compañías, no necesitas 5 instalaciones de software. Iubel es multiempresa.

### Alternar entre empresas
En la esquina superior derecha, verás un selector dorado con el ícono de un edificio. Al hacer clic, verás tu portafolio.
Cuando cambias, Iubel crea un muro virtual: no se cruzan reportes, cuentas ni balances. Cada empresa vive en su universo aislado.

*Si solicitaste la versión Enterprise, los prefijos de las tablas evitarán cualquier corrupción de datos local.*
        `
    }
];

const Help = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [feedbackState, setFeedbackState] = useState(0); // 0=none, 1=up, -1=down

    const filteredArticles = useMemo(() => {
        return articlesDB.filter(article => {
            const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  article.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    const handleSelectArticle = (article) => {
        setSelectedArticle(article);
        setFeedbackState(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderMarkdown = (text) => {
        return text.split('\n').map((line, idx) => {
            if (line.startsWith('### ')) return <h4 key={idx} style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>{line.replace('### ', '')}</h4>;
            if (line.startsWith('> ')) return <blockquote key={idx} style={{ borderLeft: '4px solid var(--primary)', background: 'var(--primary-light)', padding: '1rem', borderRadius: '4px', margin: '1rem 0', fontStyle: 'italic', color: 'var(--text-main)' }}>{line.replace('> ', '')}</blockquote>;
            if (line.startsWith('- ')) return <li key={idx} style={{ marginLeft: '1.5rem', marginBottom: '0.25rem' }}>{line.replace('- ', '')}</li>;
            if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ')) {
                return <div key={idx} style={{ marginLeft: '1rem', marginBottom: '0.25rem', display: 'flex', gap: '0.5rem' }}><strong>{line.substring(0,2)}</strong> <span>{line.substring(3)}</span></div>;
            }
            if (line.trim() === '') return <br key={idx} />;
            
            // Bold handling
            let parts = line.split(/(\*\*.*?\*\*)/g);
            return <p key={idx} style={{ lineHeight: '1.7', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                {parts.map((p, i) => {
                    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
                    if (p.startsWith('*') && p.endsWith('*')) return <em key={i} style={{color: 'var(--text-muted)'}}>{p.slice(1, -1)}</em>;
                    return p;
                })}
            </p>;
        });
    };

    return (
        <div className="animate-up" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Search Area */}
            <div style={{ background: 'var(--primary)', margin: '-2rem -2rem 2rem -2rem', padding: '4rem 2rem', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(30px)' }}></div>
                <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
                
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
                    <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 800 }}>¿Cómo podemos ayudarte?</h1>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '2rem' }}>Busca entre nuestras guías operativas, manuales financieros y consejos para optimizar tu negocio.</p>
                    
                    <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                            <Search size={24} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Ej. Crear factura, Formulario 606, Modificar clave..." 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); if(selectedArticle) setSelectedArticle(null); }}
                            style={{ 
                                width: '100%', padding: '1.25rem 1.5rem 1.25rem 3.5rem', 
                                borderRadius: '30px', border: 'none', fontSize: '1.1rem',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                outline: 'none', transition: 'box-shadow 0.3s'
                            }}
                            onFocus={(e) => e.target.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.3)'}
                            onBlur={(e) => e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)'}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr', gap: '3rem', alignItems: 'start' }}>
                
                {/* Lateral Sidebar (Categories) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', position: 'sticky', top: '2rem' }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingLeft: '1rem' }}>Soporte Temático</h4>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className="btn btn-secondary"
                            onClick={() => { setSelectedCategory(cat.id); setSelectedArticle(null); }}
                            style={{
                                justifyContent: 'flex-start',
                                padding: '0.75rem 1rem',
                                fontSize: '0.95rem',
                                background: selectedCategory === cat.id ? 'var(--primary-light)' : 'transparent',
                                color: selectedCategory === cat.id ? 'var(--primary)' : 'var(--text-main)',
                                borderColor: selectedCategory === cat.id ? 'var(--primary-light)' : 'transparent',
                                borderRadius: '8px'
                            }}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}

                    <div style={{ marginTop: '2rem', background: 'var(--background)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                        <div style={{ width: '48px', height: '48px', margin: '0 auto 1rem', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                            <Mail size={24} />
                        </div>
                        <h4 style={{ marginBottom: '0.5rem' }}>¿Necesitas ayuda humana?</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Escríbenos y nuestro equipo analizará tu caso contable.</p>
                        <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem' }}>
                            Crear Ticket
                        </button>
                    </div>
                </div>

                {/* Content Panel */}
                <div style={{ paddingBottom: '4rem' }}>
                    {selectedArticle ? (
                        <div className="animate-fade-in card glass" style={{ padding: '3rem', background: '#fff' }}>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => setSelectedArticle(null)}
                                style={{ marginBottom: '2rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: 'none' }}
                            >
                                <ArrowLeft size={16} /> Volver a los resultados
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <span>{categories.find(c => c.id === selectedArticle.category)?.name}</span>
                                <span style={{ color: 'var(--border)' }}>•</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}><Clock size={14} /> Lectura de {selectedArticle.readTime}</span>
                            </div>

                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2rem', lineHeight: '1.2' }}>
                                {selectedArticle.title}
                            </h1>

                            <div style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                                {renderMarkdown(selectedArticle.content)}
                            </div>

                            {/* Feedback Section */}
                            <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>¿Te resultó útil este artículo?</h4>
                                    {feedbackState !== 0 && <p style={{ margin: '0.25rem 0 0 0', color: 'var(--success)', fontSize: '0.85rem' }}>¡Gracias por enviarnos tus comentarios!</p>}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                        className="btn btn-secondary" 
                                        onClick={() => setFeedbackState(1)}
                                        style={{ background: feedbackState === 1 ? 'var(--success)' : 'transparent', color: feedbackState === 1 ? 'white' : 'var(--text-main)' }}
                                    >
                                        <ThumbsUp size={18} /> Sí, me sirvió
                                    </button>
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={() => setFeedbackState(-1)}
                                        style={{ background: feedbackState === -1 ? 'var(--danger)' : 'transparent', color: feedbackState === -1 ? 'white' : 'var(--text-main)' }}
                                    >
                                        <ThumbsDown size={18} /> Aún tengo dudas
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>
                                    {searchQuery ? `Resultados de búsqueda (${filteredArticles.length})` : 
                                    (selectedCategory === 'all' ? 'Artículos Destacados' : categories.find(c => c.id === selectedCategory)?.name)}
                                </h3>
                            </div>

                            {filteredArticles.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--background)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                                    <Search size={48} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
                                    <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No encontramos resultados</h4>
                                    <p style={{ color: 'var(--text-muted)' }}>Intenta con otras palabras clave o explora el menú lateral.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {filteredArticles.map(article => (
                                        <div 
                                            key={article.id} 
                                            onClick={() => handleSelectArticle(article)}
                                            className="card glass" 
                                            style={{ padding: '1.5rem', cursor: 'pointer', transition: '0.2s', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                        >
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
                                                {categories.find(c => c.id === article.category)?.name}
                                            </div>
                                            <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{article.title}</h4>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {article.content.substring(0, 120).replace(/[#*>-]/g, '').trim()}...
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Help;
