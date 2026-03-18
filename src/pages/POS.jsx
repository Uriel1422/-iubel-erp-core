import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { useInventario } from '../context/InventarioContext';
import { useContactos } from '../context/ContactosContext';
import { useNCF } from '../context/NCFContext';
import { 
    Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, 
    Banknote, CheckCircle, Package, Filter, X, Edit, PlusCircle,
    ShoppingBag, Tag, ChevronRight, Zap, Image as ImageIcon,
    User, FileText, Printer, Download, Sparkles
} from 'lucide-react';

const POS = () => {
    const { 
        cart, addToCart, removeFromCart, updateQuantity, 
        totals, processCheckout, checkoutStatus, setCheckoutStatus,
        lastTransaction, resetCheckout
    } = usePOS();
    
    const { 
        articulos, addArticulo, eliminarArticulo, toggleStatusArticulo 
    } = useInventario();

    const { contactos } = useContactos();
    const { rangos } = useNCF();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('Todos');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isManageMode, setIsManageMode] = useState(false);
    
    // Elite Checkout State
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [ncfType, setNcfType] = useState('B02');
    const [paymentMethod, setPaymentMethod] = useState('Efectivo');
    const [custSearch, setCustSearch] = useState('');

    // Manage Mode State
    const [newItem, setNewItem] = useState({
        nombre: '',
        precioVenta: '',
        imagen: '',
        animacion: 'none',
        tipo: 'Producto',
        gravado: true
    });

    const categories = ['Todos', 'Producto', 'Servicio'];
    
    const filteredProducts = useMemo(() => {
        return articulos.filter(art => {
            const matchesSearch = art.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 (art.codigo && art.codigo.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCategory = category === 'Todos' || art.tipo === category;
            return matchesSearch && matchesCategory;
        }).sort((a, b) => b.activa - a.activa);
    }, [articulos, searchTerm, category]);

    const filteredCustomers = useMemo(() => {
        if (!custSearch) return [];
        return contactos.filter(c => 
            c.nombre.toLowerCase().includes(custSearch.toLowerCase()) ||
            (c.rnc && c.rnc.includes(custSearch))
        ).slice(0, 5);
    }, [contactos, custSearch]);

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    const handleAddProduct = () => {
        if (!newItem.nombre || !newItem.precioVenta) return;
        
        addArticulo({
            ...newItem,
            precioVenta: parseFloat(newItem.precioVenta),
            costo: parseFloat(newItem.precioVenta) * 0.7,
            existencia: 100,
            activa: true,
            codigo: 'POS-' + Math.floor(Math.random() * 1000)
        });
        
        setNewItem({ nombre: '', precioVenta: '', imagen: '', animacion: 'none', tipo: 'Producto', gravado: true });
    };

    const runCheckout = async () => {
        try {
            await processCheckout({
                paymentMethod,
                tipoComprobante: ncfType,
                cliente: selectedCustomer
            });
        } catch (e) {
            alert("Error en el cobro: " + e.message);
        }
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: '1.5rem', overflow: 'hidden' }}>
            
            {/* ─── MAIN: PRODUCT GRID ─── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                
                {/* Header & Filters */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            placeholder="Buscar productos..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '0.875rem 1rem 0.875rem 2.75rem', 
                                borderRadius: '12px', 
                                border: '1px solid var(--border)',
                                background: 'var(--bg-card)',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                style={{
                                    padding: '0.875rem 1.25rem',
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    background: category === cat ? 'var(--grad-primary)' : 'var(--bg-card)',
                                    color: category === cat ? 'white' : 'var(--text-muted)',
                                    border: '1px solid var(--border)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => setIsManageMode(!isManageMode)}
                        style={{
                            padding: '0.875rem 1.25rem',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            background: isManageMode ? '#ef4444' : 'var(--bg-card)',
                            color: isManageMode ? 'white' : 'var(--primary)',
                            border: `1px solid ${isManageMode ? '#ef4444' : 'var(--primary)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {isManageMode ? <X size={16} /> : <Edit size={16} />}
                        {isManageMode ? 'Cerrar Gestión' : 'Gestionar'}
                    </button>
                </div>

                {isManageMode && (
                    <div className="card animate-reveal" style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--primary-light)', border: '1px solid var(--primary)' }}>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <input 
                                placeholder="Nombre del Producto" 
                                value={newItem.nombre} 
                                onChange={e => setNewItem({...newItem, nombre: e.target.value})}
                                style={{ flex: 2, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                            />
                            <input 
                                placeholder="Precio" 
                                type="number"
                                value={newItem.precioVenta} 
                                onChange={e => setNewItem({...newItem, precioVenta: e.target.value})}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                            />
                            <input 
                                placeholder="Imagen URL (Opcional)" 
                                value={newItem.imagen} 
                                onChange={e => setNewItem({...newItem, imagen: e.target.value})}
                                style={{ flex: 2, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                            />
                            <select 
                                value={newItem.animacion}
                                onChange={e => setNewItem({...newItem, animacion: e.target.value})}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                            >
                                <option value="none">Sin Animación</option>
                                <option value="animate-float">Flotar (Levitación)</option>
                                <option value="animate-pulse-slow">Pulso (Respiración)</option>
                                <option value="animate-glow">Brillo (Neón)</option>
                            </select>
                            <button 
                                onClick={handleAddProduct}
                                style={{ padding: '0.75rem 1.5rem', background: 'var(--grad-primary)', color: 'white', borderRadius: '8px', fontWeight: 800 }}
                            >
                                AÑADIR
                            </button>
                        </div>
                    </div>
                )}

                {/* Grid */}
                <div style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                    gap: '1.5rem',
                    padding: '0.5rem'
                }}>
                    {filteredProducts.map(prod => (
                        <div 
                            key={prod.id} 
                            onClick={() => !isManageMode && prod.activa && addToCart(prod)}
                            className={`card product-card animate-reveal ${prod.animacion !== 'none' ? prod.animacion : ''}`}
                            style={{ 
                                padding: '1rem', 
                                cursor: isManageMode ? 'default' : (prod.activa ? 'pointer' : 'not-allowed'),
                                opacity: prod.activa ? 1 : 0.6,
                                background: 'var(--bg-card)',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                border: '1px solid var(--border)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {isManageMode && (
                                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.25rem', zIndex: 10 }}>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleStatusArticulo(prod.id); }}
                                        style={{ background: 'white', padding: '0.4rem', borderRadius: '8px', color: prod.activa ? '#f59e0b' : '#10b981', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                                    >
                                        <Zap size={14} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); if(confirm('¿Eliminar producto?')) eliminarArticulo(prod.id); }}
                                        style={{ background: 'white', padding: '0.4rem', borderRadius: '8px', color: '#ef4444', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}

                            <div className="pos-media-container">
                                {prod.imagen ? (
                                    <img src={prod.imagen} alt={prod.nombre} className="pos-media-img" />
                                ) : (
                                    <div style={{ color: 'var(--primary)', opacity: 0.5 }}>
                                        {prod.tipo === 'Servicio' ? <ShoppingBag size={48} /> : <Package size={48} />}
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{prod.codigo}</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.25rem' }}>{prod.nombre}</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>{formatMoney(prod.precioVenta)}</div>
                            </div>

                            {!prod.activa && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}>
                                    <span style={{ background: '#ef4444', color: 'white', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 900 }}>INACTIVO</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── SIDEBAR: CART ─── */}
            <div className="card glass-premium" style={{ width: '400px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderLeft: '1px solid var(--border)' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ position: 'relative' }}>
                            <ShoppingCart color="var(--primary)" size={24} />
                            {cart.length > 0 && (
                                <span style={{ position: 'absolute', top: -5, right: -10, background: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 900 }}>{cart.length}</span>
                            )}
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>Carrito</h2>
                    </div>
                    <button onClick={() => confirm('¿Vaciar carrito?') && clearCart()} style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700 }}>Vaciar</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {cart.map(item => (
                        <div key={item.id} className="animate-up" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ width: 50, height: 50, background: 'var(--background)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {item.imagen ? <img src={item.imagen} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={20} color="var(--text-muted)" />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{item.nombre}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatMoney(item.precioVenta)} / ud</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--background)', padding: '0.35rem', borderRadius: '10px' }}>
                                <button onClick={() => updateQuantity(item.id, -1)} style={{ padding: '0.25rem', color: 'var(--text-muted)' }}><Minus size={14} /></button>
                                <span style={{ width: '25px', textAlign: 'center', fontWeight: 900, fontSize: '0.9rem' }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} style={{ padding: '0.25rem', color: 'var(--primary)' }}><Plus size={14} /></button>
                            </div>
                        </div>
                    ))}
                    
                    {cart.length === 0 && (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                            <ShoppingBag size={80} strokeWidth={1} />
                            <p style={{ marginTop: '1.5rem', fontWeight: 800, fontSize: '1.1rem' }}>Esperando artículos...</p>
                        </div>
                    )}
                </div>

                <div style={{ padding: '1.5rem 2rem', background: 'var(--bg-card)', borderTop: '2px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <span>Subtotal</span>
                        <span style={{ fontWeight: 700 }}>{formatMoney(totals.subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <span>ITBIS (18%)</span>
                        <span style={{ fontWeight: 700 }}>{formatMoney(totals.itbis)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <span style={{ fontWeight: 900, fontSize: '1.25rem' }}>TOTAL</span>
                        <span style={{ fontWeight: 900, fontSize: '1.85rem', color: 'var(--primary)' }}>{formatMoney(totals.total)}</span>
                    </div>

                    <button 
                        disabled={cart.length === 0 || checkoutStatus === 'processing'}
                        onClick={() => setIsCheckoutOpen(true)}
                        style={{ 
                            width: '100%', 
                            padding: '1.35rem', 
                            background: 'var(--grad-primary)', 
                            color: 'white', 
                            borderRadius: '20px', 
                            fontWeight: 900, 
                            fontSize: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            boxShadow: '0 15px 30px rgba(37, 99, 235, 0.4)',
                            transition: 'all 0.3s'
                        }}
                    >
                        <Zap size={22} fill="white" />
                        PAGAR AHORA
                    </button>
                </div>
            </div>

            {/* ─── ELITE CHECKOUT MODAL ─── */}
            {isCheckoutOpen && (
                <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
                    <div className="card glass-premium animate-reveal" style={{ width: '600px', padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        
                        {checkoutStatus === 'success' ? (
                            <div style={{ padding: '3rem', textAlign: 'center' }}>
                                <div className="animate-success" style={{ color: '#10b981', marginBottom: '2rem' }}>
                                    <CheckCircle size={100} style={{ margin: '0 auto' }} />
                                </div>
                                <h1 style={{ fontWeight: 900, fontSize: '2.5rem', marginBottom: '0.5rem', color: '#10b981' }}>PAGO RECIBIDO</h1>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                                    Factura <strong>#{lastTransaction?.numeroInterno}</strong> generada con éxito.<br/>
                                    NCF: <strong>{lastTransaction?.ncf}</strong>
                                </p>
                                
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <button 
                                        onClick={() => window.print()}
                                        style={{ flex: 1, padding: '1.25rem', background: 'var(--primary)', color: 'white', borderRadius: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <Printer size={20} /> Imprimir Ticket
                                    </button>
                                    <button 
                                        style={{ flex: 1, padding: '1.25rem', background: '#f8fafc', color: '#64748b', borderRadius: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <Download size={20} /> Descargar PDF
                                    </button>
                                </div>

                                <button 
                                    onClick={() => { resetCheckout(); setIsCheckoutOpen(false); }}
                                    style={{ width: '100%', padding: '1rem', color: 'var(--primary)', fontWeight: 800, fontSize: '1rem' }}
                                >
                                    VOLVER AL PUNTO DE VENTA
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {/* Header */}
                                <div style={{ padding: '1.5rem 2rem', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase' }}>Configuración de Pago</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>Elite Checkout</div>
                                    </div>
                                    <button onClick={() => setIsCheckoutOpen(false)} style={{ color: 'white' }}><X size={24} /></button>
                                </div>

                                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    
                                    {/* Customer Selection */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>CLIENTE / ENTIDAD</label>
                                        <div style={{ position: 'relative' }}>
                                            <input 
                                                type="text"
                                                placeholder="Buscar cliente por nombre o RNC..."
                                                value={selectedCustomer ? selectedCustomer.nombre : custSearch}
                                                onChange={e => { setSelectedCustomer(null); setCustSearch(e.target.value); }}
                                                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: 700 }}
                                            />
                                            <User size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                            {selectedCustomer && (
                                                <button onClick={() => setSelectedCustomer(null)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}><X size={16} /></button>
                                            )}
                                        </div>
                                        {custSearch && !selectedCustomer && filteredCustomers.length > 0 && (
                                            <div className="card" style={{ position: 'absolute', zIndex: 100, width: 'calc(100% - 4rem)', marginTop: '0.5rem', padding: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                                                {filteredCustomers.map(c => (
                                                    <div key={c.id} onClick={() => { setSelectedCustomer(c); setCustSearch(''); }} style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderRadius: '8px', hover: { background: 'var(--background)' }, display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontWeight: 700 }}>{c.nombre}</span>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.rnc}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Fiscal Type */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>TIPO DE COMPROBANTE (NCF)</label>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button 
                                                onClick={() => setNcfType('B02')}
                                                style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: `2px solid ${ncfType === 'B02' ? 'var(--primary)' : 'var(--border)'}`, background: ncfType === 'B02' ? 'var(--primary-light)' : 'transparent', fontWeight: 800, transition: '0.2s' }}
                                            >
                                                Consumidor (B02)
                                            </button>
                                            <button 
                                                onClick={() => setNcfType('B01')}
                                                style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: `2px solid ${ncfType === 'B01' ? 'var(--primary)' : 'var(--border)'}`, background: ncfType === 'B01' ? 'var(--primary-light)' : 'transparent', fontWeight: 800, transition: '0.2s' }}
                                            >
                                                Crédito Fiscal (B01)
                                            </button>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>MÉTODO DE PAGO</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                            {[
                                                { id: 'Efectivo', icon: <Banknote size={24} />, color: '#10b981' },
                                                { id: 'Tarjeta', icon: <CreditCard size={24} />, color: '#3b82f6' },
                                                { id: 'Transferencia', icon: <FileText size={24} />, color: '#8b5cf6' }
                                            ].map(m => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => setPaymentMethod(m.id)}
                                                    style={{ 
                                                        padding: '1.25rem 0.5rem', 
                                                        borderRadius: '16px', 
                                                        border: `2px solid ${paymentMethod === m.id ? m.color : 'var(--border)'}`,
                                                        background: paymentMethod === m.id ? `${m.color}11` : 'transparent',
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                                        transition: '0.2s'
                                                    }}
                                                >
                                                    <div style={{ color: m.color }}>{m.icon}</div>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: paymentMethod === m.id ? m.color : 'var(--text-muted)' }}>{m.id.toUpperCase()}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Summary & Confirm */}
                                    <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f1f5f9', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>TOTAL A COBRAR</div>
                                            <div style={{ fontSize: '2rem', fontWeight: 950, color: 'var(--primary)' }}>{formatMoney(totals.total)}</div>
                                        </div>
                                        <button 
                                            disabled={checkoutStatus === 'processing'}
                                            onClick={runCheckout}
                                            style={{ padding: '1.5rem 3rem', background: 'var(--grad-primary)', color: 'white', borderRadius: '18px', fontWeight: 900, fontSize: '1.2rem', boxShadow: '0 10px 20px rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                                        >
                                            {checkoutStatus === 'processing' ? 'Procesando...' : <><CheckCircle size={22} /> CONFIRMAR</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .product-card {
                    backface-visibility: hidden;
                    transform: translateZ(0);
                }
                .product-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
                    border-color: var(--primary);
                }
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
            `}</style>
        </div>
    );
};

export default POS;
