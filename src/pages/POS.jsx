import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { useInventario } from '../context/InventarioContext';
import { 
    Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, 
    Banknote, CheckCircle, Package, Filter, X, Edit, PlusCircle,
    ShoppingBag, Tag, ChevronRight, Zap
} from 'lucide-react';

const POS = () => {
    const { 
        cart, addToCart, removeFromCart, updateQuantity, clearCart, 
        totals, processCheckout, checkoutStatus 
    } = usePOS();
    
    const { 
        articulos, addArticulo, eliminarArticulo, toggleStatusArticulo 
    } = useInventario();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('Todos');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isManageMode, setIsManageMode] = useState(false);
    
    // Categorías únicas de los productos (simulado por ahora o basado en tipo)
    const categories = ['Todos', 'Producto', 'Servicio'];
    
    const filteredProducts = useMemo(() => {
        return articulos.filter(art => {
            const matchesSearch = art.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 art.codigo.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = category === 'Todos' || art.tipo === category;
            return matchesSearch && matchesCategory;
        }).sort((a, b) => b.activa - a.activa);
    }, [articulos, searchTerm, category]);

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    const handleQuickAdd = () => {
        const nombre = prompt('Nombre del nuevo artículo:');
        if (!nombre) return;
        const precio = parseFloat(prompt('Precio de venta:'));
        if (isNaN(precio)) return;
        
        addArticulo({
            nombre,
            precioVenta: precio,
            costo: precio * 0.7,
            tipo: 'Producto',
            existencia: 100,
            activa: true,
            gravado: true,
            codigo: 'POS-' + Math.floor(Math.random() * 1000)
        });
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
                            placeholder="Buscar por nombre o código..." 
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
                                    transition: 'all 0.2s',
                                    boxShadow: category === cat ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none'
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
                        {isManageMode ? 'Salir Gestión' : 'Gestionar'}
                    </button>
                    
                    {!isManageMode && (
                        <button 
                            onClick={handleQuickAdd}
                            style={{
                                padding: '0.875rem',
                                borderRadius: '12px',
                                background: 'var(--grad-success)',
                                color: 'white',
                                display: 'flex'
                            }}
                            title="Añadir Producto Rápido"
                        >
                            <PlusCircle size={20} />
                        </button>
                    )}
                </div>

                {/* Grid */}
                <div style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                    gap: '1.25rem',
                    padding: '0.25rem'
                }}>
                    {filteredProducts.map(prod => (
                        <div 
                            key={prod.id} 
                            onClick={() => !isManageMode && prod.activa && addToCart(prod)}
                            className="card animate-reveal"
                            style={{ 
                                padding: '1rem', 
                                cursor: isManageMode ? 'default' : (prod.activa ? 'pointer' : 'not-allowed'),
                                opacity: prod.activa ? 1 : 0.5,
                                background: 'var(--bg-card)',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                border: '1px solid var(--border)',
                                height: '220px'
                            }}
                        >
                            {isManageMode && (
                                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.25rem' }}>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleStatusArticulo(prod.id); }}
                                        style={{ background: '#f8fafc', padding: '0.4rem', borderRadius: '8px', color: prod.activa ? '#f59e0b' : '#10b981' }}
                                    >
                                        <Zap size={14} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); if(confirm('¿Eliminar producto?')) eliminarArticulo(prod.id); }}
                                        style={{ background: '#fef2f2', padding: '0.4rem', borderRadius: '8px', color: '#ef4444' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}

                            <div style={{ background: 'var(--primary-light)', padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                                {prod.tipo === 'Servicio' ? <ShoppingBag size={32} color="var(--primary)" /> : <Package size={32} color="var(--primary)" />}
                            </div>
                            
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>{prod.codigo}</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.nombre}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>{formatMoney(prod.precioVenta)}</div>
                            </div>

                            {!prod.activa && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}>
                                    <span style={{ background: '#64748b', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800 }}>INACTIVO</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── SIDEBAR: CART ─── */}
            <div className="card glass-premium" style={{ width: '380px', display: 'flex', flexDirection: 'column', pading: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ShoppingCart color="var(--primary)" size={22} />
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Mi Carrito</h2>
                    </div>
                    <button onClick={clearCart} style={{ color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 700 }}>Vaciar</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {cart.map(item => (
                        <div key={item.id} className="animate-up" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ width: 45, height: 45, background: 'var(--background)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Package size={20} color="var(--text-muted)" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.nombre}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatMoney(item.precioVenta)}/ud</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--background)', padding: '0.25rem', borderRadius: '8px' }}>
                                <button onClick={() => updateQuantity(item.id, -1)} style={{ padding: '0.2rem', color: 'var(--text-muted)' }}><Minus size={14} /></button>
                                <span style={{ width: '20px', textAlign: 'center', fontWeight: 800, fontSize: '0.85rem' }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} style={{ padding: '0.2rem', color: 'var(--primary)' }}><Plus size={14} /></button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} style={{ color: '#ef444455' }}><X size={16} /></button>
                        </div>
                    ))}
                    
                    {cart.length === 0 && (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                            <ShoppingBag size={60} strokeWidth={1} />
                            <p style={{ marginTop: '1rem', fontWeight: 600 }}>Cargar productos...</p>
                        </div>
                    )}
                </div>

                <div style={{ padding: '1.5rem', background: 'rgba(248, 250, 252, 0.5)', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span>Subtotal</span>
                        <span>{formatMoney(totals.subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span>ITBIS (18%)</span>
                        <span>{formatMoney(totals.itbis)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Total a Pagar</span>
                        <span style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--primary)' }}>{formatMoney(totals.total)}</span>
                    </div>

                    <button 
                        disabled={cart.length === 0 || checkoutStatus === 'processing'}
                        onClick={() => setIsCheckoutOpen(true)}
                        style={{ 
                            width: '100%', 
                            padding: '1.25rem', 
                            background: 'var(--grad-primary)', 
                            color: 'white', 
                            borderRadius: '16px', 
                            fontWeight: 800, 
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)'
                        }}
                    >
                        <CreditCard size={20} />
                        COBRAR AHORA
                    </button>
                </div>
            </div>

            {/* ─── CHECKOUT MODAL ─── */}
            {isCheckoutOpen && (
                <div className="modal-overlay">
                    <div className="card glass-premium animate-reveal" style={{ width: '450px', padding: '2rem', textAlign: 'center' }}>
                        {checkoutStatus === 'success' ? (
                            <div style={{ padding: '2rem 1rem' }}>
                                <div style={{ color: 'var(--success)', marginBottom: '1.5rem' }}><CheckCircle size={80} style={{ margin: '0 auto' }} /></div>
                                <h1 style={{ fontWeight: 900, fontSize: '1.75rem', marginBottom: '0.5rem' }}>¡VENTA EXITOSA!</h1>
                                <p style={{ color: 'var(--text-muted)' }}>El stock ha sido actualizado y se registró el recibo en caja.</p>
                                <button 
                                    onClick={() => { setIsCheckoutOpen(false); }}
                                    style={{ marginTop: '2rem', width: '100%', padding: '1rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '12px', fontWeight: 800 }}
                                >
                                    Cerrar y Nueva Venta
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem' }}>Selecciona Método de Pago</h2>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                    <button 
                                        onClick={() => processCheckout('Efectivo')}
                                        style={{ padding: '2rem 1rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
                                    >
                                        <Banknote size={32} color="var(--success)" />
                                        <span style={{ fontWeight: 800 }}>EFECTIVO</span>
                                    </button>
                                    <button 
                                        onClick={() => processCheckout('Tarjeta')}
                                        style={{ padding: '2rem 1rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
                                    >
                                        <CreditCard size={32} color="var(--primary)" />
                                        <span style={{ fontWeight: 800 }}>TARJETA</span>
                                    </button>
                                </div>

                                <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: '12px', marginBottom: '2rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>TOTAL A RECIBIR</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>{formatMoney(totals.total)}</div>
                                </div>

                                <button 
                                    onClick={() => setIsCheckoutOpen(false)}
                                    style={{ color: 'var(--text-muted)', fontWeight: 700 }}
                                >
                                    Cancelar transaccion
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default POS;
