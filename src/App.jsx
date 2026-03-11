import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import FeatureProtectedRoute from './components/FeatureProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Cuentas from './pages/Cuentas';
import Inventario from './pages/Inventario';
import Facturacion from './pages/Facturacion';
import DiarioGeneral from './pages/DiarioGeneral';
import Compras from './pages/Compras';
import Reportes from './pages/Reportes';
import Tesoreria from './pages/Tesoreria';
import Contactos from './pages/Contactos';
import Bancos from './pages/Bancos';
import ReportesFiscales from './pages/ReportesFiscales';
import Cotizaciones from './pages/Cotizaciones';
import Prestamos from './pages/Prestamos';
import FixedAssets from './pages/FixedAssets';
import Socios from './pages/Socios';
import Caja from './pages/Caja';
import PagosEnCaja from './pages/PagosEnCaja';
import Boveda from './pages/Boveda';
import BankingHub from './pages/BankingHub';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Nomina from './pages/Nomina';
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
import Segmentacion from './pages/Segmentacion';
import CobrosYDeducciones from './pages/CobrosYDeducciones';
import ParametrosCore from './pages/ParametrosCore';
import Juridico from './pages/Juridico';
import Ahorros from './pages/Ahorros';
import Procesos from './pages/Procesos';
import UsuariosRoles from './pages/UsuariosRoles';
import CuentasPorCobrar from './pages/CuentasPorCobrar';
import CuentasPorPagar from './pages/CuentasPorPagar';
import WealthTerminal from './pages/WealthTerminal';
import Copilot from './pages/Copilot';
import Tarjetas from './pages/Tarjetas';
import DataNode from './pages/DataNode';
import Exchange from './pages/Exchange';

// Providers
import { AuthProvider } from './context/AuthContext';
import { CuentasProvider } from './context/CuentasContext';
import { InventarioProvider } from './context/InventarioContext';
import { ContabilidadProvider } from './context/ContabilidadContext';
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
import { NCFProvider } from './context/NCFContext';
import { PrestamosProvider } from './context/PrestamosContext';
import { BovedaProvider } from './context/BovedaContext';
import { CajaProvider } from './context/CajaContext';
import { SociosProvider } from './context/SociosContext';
import { TalentoHumanoProvider } from './context/TalentoHumanoContext';
import { ControlInternoProvider } from './context/ControlInternoContext';
import { JuridicoProvider } from './context/JuridicoContext';
import { BalanceSocialProvider } from './context/BalanceSocialContext';
import { CobrosProvider } from './context/CobrosContext';
import { SegmentacionProvider } from './context/SegmentacionContext';
import { AhorrosProvider } from './context/AhorrosContext';
import { SuperAdminProvider } from './context/SuperAdminContext';

import Auditoria from './pages/Auditoria';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import BiAnalytics from './pages/BiAnalytics';
import GestionDocumental from './pages/GestionDocumental';
import ProyectosTareas from './pages/ProyectosTareas';
import SecuritySovereign from './pages/SecuritySovereign';
import Portal from './pages/Portal';

function App() {
  return (
    <SuperAdminProvider>
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
                                                                    <BrowserRouter>
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
                                                                    </BrowserRouter>
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
    </SuperAdminProvider>
  );
}

export default App;
