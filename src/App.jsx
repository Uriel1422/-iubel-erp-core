import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import FeatureProtectedRoute from './components/FeatureProtectedRoute';
import Dashboard from './pages/Dashboard';
import Contactos from './pages/Contactos';
import Socios from './pages/Socios';
import Caja from './pages/Caja';
import PagosEnCaja from './pages/PagosEnCaja';
import Boveda from './pages/Boveda';
import BankingHub from './pages/BankingHub';
import Prestamos from './pages/Prestamos';
import Cotizaciones from './pages/Cotizaciones';
import Cuentas from './pages/Cuentas';
import Bancos from './pages/Bancos';
import Inventario from './pages/Inventario';
import Facturacion from './pages/Facturacion';
import Compras from './pages/Compras';
import Tesoreria from './pages/Tesoreria';
import DiarioGeneral from './pages/DiarioGeneral';
import Reportes from './pages/Reportes';
import ReportesFiscales from './pages/ReportesFiscales';
import FixedAssets from './pages/FixedAssets';
import Nomina from './pages/Nomina';
import Settings from './pages/Settings';
import Help from './pages/Help';
import MayorGeneral from './pages/MayorGeneral';
import AgingReports from './pages/AgingReports';
import Presupuestos from './pages/Presupuestos';
import FlujoEfectivo from './pages/FlujoEfectivo';
import OrdenesCompra from './pages/OrdenesCompra';
import ConciliacionBancaria from './pages/ConciliacionBancaria';
import NotasCreditoDebito from './pages/NotasCreditoDebito';
import TransaccionesRecurrentes from './pages/TransaccionesRecurrentes';
import EstadosCuenta from './pages/EstadosCuenta';
import CierreFiscal from './pages/CierreFiscal';
import CentrosCosto from './pages/CentrosCosto';
import IndicadoresFinancieros from './pages/IndicadoresFinancieros';
import NCFManager from './pages/NCFManager';
import TalentoHumano from './pages/TalentoHumano';
import BalanceSocial from './pages/BalanceSocial';
import ControlInterno from './pages/ControlInterno';
import ParametrosCore from './pages/ParametrosCore';
import Segmentacion from './pages/Segmentacion';
import CobrosYDeducciones from './pages/CobrosYDeducciones';
import Juridico from './pages/Juridico';
import Ahorros from './pages/Ahorros';
import Procesos from './pages/Procesos';
import Copilot from './pages/Copilot';
import Tarjetas from './pages/Tarjetas';
import DataNode from './pages/DataNode';
import Exchange from './pages/Exchange';
import WealthTerminal from './pages/WealthTerminal';
import CuentasPorCobrar from './pages/CuentasPorCobrar';
import CuentasPorPagar from './pages/CuentasPorPagar';
import UsuariosRoles from './pages/UsuariosRoles';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { NCFProvider } from './context/NCFContext';
import { PrestamosProvider } from './context/PrestamosContext';
import { BovedaProvider } from './context/BovedaContext';
import { CajaProvider } from './context/CajaContext';
import { SociosProvider } from './context/SociosContext';
import { ContabilidadProvider } from './context/ContabilidadContext';
import { CuentasProvider } from './context/CuentasContext';
import { InventarioProvider } from './context/InventarioContext';
import { FacturacionProvider } from './context/FacturacionContext';
import { ComprasProvider } from './context/ComprasContext';
import { ContactosProvider } from './context/ContactosContext';
import { BancosProvider } from './context/BancosContext';
import { CotizacionesProvider } from './context/CotizacionesContext';
import { NotificationProvider } from './context/NotificationContext';
import { SettingsProvider } from './context/SettingsContext';
import { FixedAssetsProvider } from './context/FixedAssetsContext';
import { NominaProvider } from './context/NominaContext';
import { MonedaProvider } from './context/MonedaContext';
import { PresupuestoProvider } from './context/PresupuestoContext';
import { NotasProvider } from './context/NotasContext';
import { RecurrentesProvider } from './context/RecurrentesContext';
import { CierreProvider } from './context/CierreContext';
import { CentrosCostoProvider } from './context/CentrosCostoContext';
import { TalentoHumanoProvider } from './context/TalentoHumanoContext';
import { ControlInternoProvider } from './context/ControlInternoContext';
import { JuridicoProvider } from './context/JuridicoContext';
import { BalanceSocialProvider } from './context/BalanceSocialContext';
import { CobrosProvider } from './context/CobrosContext';
import { SegmentacionProvider } from './context/SegmentacionContext';
import { AhorrosProvider } from './context/AhorrosContext';
import { SuperAdminProvider, useSuperAdmin } from './context/SuperAdminContext';
import { ShieldAlert } from 'lucide-react';

import Auditoria from './pages/Auditoria';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import BiAnalytics from './pages/BiAnalytics';
import GestionDocumental from './pages/GestionDocumental';
import ProyectosTareas from './pages/ProyectosTareas';
import SecuritySovereign from './pages/SecuritySovereign';
import Portal from './pages/Portal';

const GlobalUIWrapper = ({ children }) => {
  const { globalKillSwitch, broadcastMessage, token: saToken } = useSuperAdmin();
  const location = useLocation();
  
  // Inmunidad Total: Si estás en una ruta de superadmin O tienes el token de SA activo, BYPASS TOTAL.
  const isSuperAdminRoute = location.pathname.startsWith('/superadmin');
  const isImmune = isSuperAdminRoute || !!saToken;

  if (globalKillSwitch && !isImmune) {
    return (
      <div style={{ height: '100vh', width: '100vw', background: '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', gap: '2rem', textAlign: 'center', padding: '2rem', position: 'fixed', inset: 0, zIndex: 99999 }}>
        <style>{`@keyframes pulse { 0% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 0.8; } }`}</style>
        <div style={{ padding: '2rem', background: '#ef444422', borderRadius: '50%', animation: 'pulse 2s infinite' }}>
          <ShieldAlert size={80} color="#ef4444" />
        </div>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>SISTEMA SUSPENDIDO</h1>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
            El Superadministrador ha activado el <strong>Kill-Switch Global</strong> por razones de seguridad o mantenimiento crítico. 
            Todas las operaciones están pausadas temporalmente.
          </p>
        </div>
        <div style={{ padding: '1rem 2rem', border: '1px solid #1e293b', borderRadius: '12px', background: '#0f172a', fontSize: '0.9rem', color: '#38bdf8', fontFamily: 'monospace' }}>
          STATUS: LOCKED_BY_ROOT
        </div>
      </div>
    );
  }

  return (
    <>
      {broadcastMessage && (
        <div style={{ 
          background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', 
          color: 'white', 
          padding: '0.75rem', 
          textAlign: 'center', 
          fontWeight: 700, 
          fontSize: '0.9rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.75rem', 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 10000,
          boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
        }}>
          <ShieldAlert size={18} />
          <span>ADVISORY: {broadcastMessage}</span>
        </div>
      )}
      <div style={{ paddingTop: broadcastMessage ? '3rem' : 0 }}>
        {children}
      </div>
    </>
  );
};

function App() {
  return (
    <SuperAdminProvider>
      <BrowserRouter>
        <GlobalUIWrapper>
          <AuthProvider>
            <NCFProvider>
              <PrestamosProvider>
                <BovedaProvider>
                  <CajaProvider>
                    <SociosProvider>
                      <ContabilidadProvider>
                        <CuentasProvider>
                          <InventarioProvider>
                            <FacturacionProvider>
                              <ComprasProvider>
                                <ContactosProvider>
                                  <BancosProvider>
                                    <CotizacionesProvider>
                                      <NotificationProvider>
                                        <SettingsProvider>
                                          <FixedAssetsProvider>
                                            <NominaProvider>
                                              <MonedaProvider>
                                                <PresupuestoProvider>
                                                  <NotasProvider>
                                                    <RecurrentesProvider>
                                                      <CierreProvider>
                                                        <CentrosCostoProvider>
                                                          <TalentoHumanoProvider>
                                                            <ControlInternoProvider>
                                                              <JuridicoProvider>
                                                                <BalanceSocialProvider>
                                                                  <CobrosProvider>
                                                                    <SegmentacionProvider>
                                                                      <AhorrosProvider>
                                                                        <Routes>
                                                                          <Route path="/login" element={<LoginPage />} />
                                                                          <Route path="/register" element={<RegisterPage />} />
                                                                          <Route path="/" element={<Portal />} />
                                                                          <Route path="/erp" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                                                                            <Route index element={<Dashboard />} />
                                                                            <Route path="contactos" element={<FeatureProtectedRoute featureId="contactos"><Contactos /></FeatureProtectedRoute>} />
                                                                            <Route path="socios" element={<FeatureProtectedRoute featureId="banking"><Socios /></FeatureProtectedRoute>} />
                                                                            <Route path="caja" element={<FeatureProtectedRoute featureId="caja"><Caja /></FeatureProtectedRoute>} />
                                                                            <Route path="pagos-caja" element={<FeatureProtectedRoute featureId="caja"><PagosEnCaja /></FeatureProtectedRoute>} />
                                                                            <Route path="boveda" element={<FeatureProtectedRoute featureId="caja"><Boveda /></FeatureProtectedRoute>} />
                                                                            <Route path="banking-hub" element={<FeatureProtectedRoute featureId="banking"><BankingHub /></FeatureProtectedRoute>} />
                                                                            <Route path="prestamos" element={<FeatureProtectedRoute featureId="prestamos"><Prestamos /></FeatureProtectedRoute>} />
                                                                            <Route path="cotizaciones" element={<FeatureProtectedRoute featureId="facturacion"><Cotizaciones /></FeatureProtectedRoute>} />
                                                                            <Route path="cuentas" element={<FeatureProtectedRoute featureId="contabilidad"><Cuentas /></FeatureProtectedRoute>} />
                                                                            <Route path="bancos" element={<FeatureProtectedRoute featureId="banking"><Bancos /></FeatureProtectedRoute>} />
                                                                            <Route path="inventario" element={<FeatureProtectedRoute featureId="inventario"><Inventario /></FeatureProtectedRoute>} />
                                                                            <Route path="facturas" element={<FeatureProtectedRoute featureId="facturacion"><Facturacion /></FeatureProtectedRoute>} />
                                                                            <Route path="compras" element={<FeatureProtectedRoute featureId="compras"><Compras /></FeatureProtectedRoute>} />
                                                                            <Route path="ingresos" element={<FeatureProtectedRoute featureId="banking"><Tesoreria tipo="ingreso" /></FeatureProtectedRoute>} />
                                                                            <Route path="egresos" element={<FeatureProtectedRoute featureId="banking"><Tesoreria tipo="egreso" /></FeatureProtectedRoute>} />
                                                                            <Route path="diario" element={<FeatureProtectedRoute featureId="contabilidad"><DiarioGeneral /></FeatureProtectedRoute>} />
                                                                            <Route path="reportes" element={<FeatureProtectedRoute featureId="reportes"><Reportes /></FeatureProtectedRoute>} />
                                                                            <Route path="fiscal" element={<FeatureProtectedRoute featureId="fiscal"><ReportesFiscales /></FeatureProtectedRoute>} />
                                                                            <Route path="activos" element={<FeatureProtectedRoute featureId="activos"><FixedAssets /></FeatureProtectedRoute>} />
                                                                            <Route path="nomina" element={<FeatureProtectedRoute featureId="personal"><Nomina /></FeatureProtectedRoute>} />
                                                                            <Route path="config" element={<Settings />} />
                                                                            <Route path="ayuda" element={<Help />} />
                                                                            <Route path="mayor" element={<FeatureProtectedRoute featureId="contabilidad"><MayorGeneral /></FeatureProtectedRoute>} />
                                                                            <Route path="aging" element={<FeatureProtectedRoute featureId="contabilidad"><AgingReports /></FeatureProtectedRoute>} />
                                                                            <Route path="presupuestos" element={<FeatureProtectedRoute featureId="reportes"><Presupuestos /></FeatureProtectedRoute>} />
                                                                            <Route path="efectivo" element={<FeatureProtectedRoute featureId="reportes"><FlujoEfectivo /></FeatureProtectedRoute>} />
                                                                            <Route path="ordenes" element={<FeatureProtectedRoute featureId="compras"><OrdenesCompra /></FeatureProtectedRoute>} />
                                                                            <Route path="conciliacion" element={<FeatureProtectedRoute featureId="banking"><ConciliacionBancaria /></FeatureProtectedRoute>} />
                                                                            <Route path="notas" element={<FeatureProtectedRoute featureId="facturacion"><NotasCreditoDebito /></FeatureProtectedRoute>} />
                                                                            <Route path="recurrentes" element={<FeatureProtectedRoute featureId="contabilidad"><TransaccionesRecurrentes /></FeatureProtectedRoute>} />
                                                                            <Route path="estados-cuenta" element={<FeatureProtectedRoute featureId="facturacion"><EstadosCuenta /></FeatureProtectedRoute>} />
                                                                            <Route path="cierre" element={<FeatureProtectedRoute featureId="contabilidad"><CierreFiscal /></FeatureProtectedRoute>} />
                                                                            <Route path="centros-costo" element={<FeatureProtectedRoute featureId="contabilidad"><CentrosCosto /></FeatureProtectedRoute>} />
                                                                            <Route path="indicadores" element={<FeatureProtectedRoute featureId="reportes"><IndicadoresFinancieros /></FeatureProtectedRoute>} />
                                                                            <Route path="ncf" element={<FeatureProtectedRoute featureId="fiscal"><NCFManager /></FeatureProtectedRoute>} />
                                                                            <Route path="talento-humano" element={<FeatureProtectedRoute featureId="personal"><TalentoHumano /></FeatureProtectedRoute>} />
                                                                            <Route path="balance-social" element={<FeatureProtectedRoute featureId="personal"><BalanceSocial /></FeatureProtectedRoute>} />
                                                                            <Route path="control-interno" element={<FeatureProtectedRoute featureId="auditoria"><ControlInterno /></FeatureProtectedRoute>} />
                                                                            <Route path="parametros-core" element={<FeatureProtectedRoute featureId="contabilidad"><ParametrosCore /></FeatureProtectedRoute>} />
                                                                            <Route path="segmentacion" element={<FeatureProtectedRoute featureId="personal"><Segmentacion /></FeatureProtectedRoute>} />
                                                                            <Route path="cobros" element={<FeatureProtectedRoute featureId="personal"><CobrosYDeducciones /></FeatureProtectedRoute>} />
                                                                            <Route path="juridico" element={<FeatureProtectedRoute featureId="auditoria"><Juridico /></FeatureProtectedRoute>} />
                                                                            <Route path="ahorros" element={<FeatureProtectedRoute featureId="ahorros"><Ahorros /></FeatureProtectedRoute>} />
                                                                            <Route path="procesos" element={<FeatureProtectedRoute featureId="contabilidad"><Procesos /></FeatureProtectedRoute>} />
                                                                            <Route path="auditoria" element={<FeatureProtectedRoute featureId="auditoria"><Auditoria /></FeatureProtectedRoute>} />
                                                                            <Route path="analytics" element={<FeatureProtectedRoute featureId="reportes"><BiAnalytics /></FeatureProtectedRoute>} />
                                                                            <Route path="documentos" element={<FeatureProtectedRoute featureId="auditoria"><GestionDocumental /></FeatureProtectedRoute>} />
                                                                            <Route path="proyectos" element={<FeatureProtectedRoute featureId="reportes"><ProyectosTareas /></FeatureProtectedRoute>} />
                                                                            <Route path="seguridad" element={<FeatureProtectedRoute featureId="auditoria"><UsuariosRoles /></FeatureProtectedRoute>} />
                                                                            <Route path="cxc" element={<FeatureProtectedRoute featureId="facturacion"><CuentasPorCobrar /></FeatureProtectedRoute>} />
                                                                            <Route path="cxp" element={<FeatureProtectedRoute featureId="compras"><CuentasPorPagar /></FeatureProtectedRoute>} />
                                                                            <Route path="wealth" element={<FeatureProtectedRoute featureId="banking"><WealthTerminal /></FeatureProtectedRoute>} />
                                                                            <Route path="copilot" element={<FeatureProtectedRoute featureId="dashboard"><Copilot /></FeatureProtectedRoute>} />
                                                                            <Route path="tarjetas" element={<FeatureProtectedRoute featureId="banking"><Tarjetas /></FeatureProtectedRoute>} />
                                                                            <Route path="datanode" element={<FeatureProtectedRoute featureId="banking"><DataNode /></FeatureProtectedRoute>} />
                                                                            <Route path="exchange" element={<FeatureProtectedRoute featureId="banking"><Exchange /></FeatureProtectedRoute>} />
                                                                            <Route path="*" element={<Navigate to="/" replace />} />
                                                                          </Route>

                                                                          {/* SaaS Super Admin Routes */}
                                                                          <Route path="/superadmin/login" element={<SuperAdminLogin />} />
                                                                          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
                                                                          <Route path="/superadmin/sovereign" element={<SecuritySovereign />} />
                                                                          <Route path="/superadmin" element={<Navigate to="/superadmin/dashboard" replace />} />
                                                                        </Routes>
                                                                      </AhorrosProvider>
                                                                    </SegmentacionProvider>
                                                                  </CobrosProvider>
                                                                </BalanceSocialProvider>
                                                              </JuridicoProvider>
                                                            </ControlInternoProvider>
                                                          </TalentoHumanoProvider>
                                                        </CentrosCostoProvider>
                                                      </CierreProvider>
                                                    </RecurrentesProvider>
                                                  </NotasProvider>
                                                </PresupuestoProvider>
                                              </MonedaProvider>
                                            </NominaProvider>
                                          </FixedAssetsProvider>
                                        </SettingsProvider>
                                      </NotificationProvider>
                                    </CotizacionesProvider>
                                  </BancosProvider>
                                </ContactosProvider>
                              </ComprasProvider>
                            </FacturacionProvider>
                          </InventarioProvider>
                        </CuentasProvider>
                      </ContabilidadProvider>
                    </SociosProvider>
                  </CajaProvider>
                </BovedaProvider>
              </PrestamosProvider>
            </NCFProvider>
          </AuthProvider>
        </GlobalUIWrapper>
      </BrowserRouter>
    </SuperAdminProvider>
  );
}

export default App;
