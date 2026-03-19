export const SYSTEM_KNOWLEDGE = {
    // --- OPERACIONES ---
    "panel": {
        "title": "Panel de Control Institucional",
        "description": "Centro neurálgico de inteligencia de negocios donde convergen todos los KPIs críticos de la institución.",
        "functions": ["Resumen de activos y pasivos.", "Gráficos de tendencia de ingresos/egresos.", "Acceso rápido a módulos críticos.", "Monitor de salud financiera en tiempo real."],
        "how_to": ["1. Ve a **Operaciones -> Panel**.", "2. Visualiza las tarjetas de KPIs para un resumen ejecutivo.", "3. Utiliza los selectores de fechas para filtrar la analítica.", "4. Haz clic en las gráficas para profundizar en los detalles."],
        "tags": ["dashboard", "inicio", "resumen", "graficas", "kpi", "analítica", "principal"]
    },
    "banking_hub": {
        "title": "Banking Hub (Interconexión Bancaria)",
        "description": "Terminal de alta tecnología para la gestión centralizada de cuentas externas y liquidez bancaria.",
        "functions": ["Visualización de saldos en tiempo real.", "Transferencias interbancarias automáticas.", "Monitor de conectividad con el sistema financiero.", "Mapeo de tesorería institucional."],
        "how_to": ["1. Accede a **Operaciones -> Banking Hub**.", "2. Verifica el estatus de conexión de cada banco.", "3. Usa el botón **Sincronizar** para actualizar movimientos.", "4. Realiza movimientos de tesorería entre nodos financieros."],
        "tags": ["banco", "transferencia", "tesoreria", "liquidez", "bhd", "banreservas", "popular"]
    },
    "caja": {
        "title": "Caja, Bóveda y Tesorería",
        "description": "Módulo de gestión de efectivo físico, arqueos y custodia de valores en bóvedas institucionales.",
        "functions": ["Apertura y cierre de turnos de caja.", "Gestión de recibos de ingreso y egreso.", "Auditoría de arqueos.", "Transferencias entre caja y bóveda."],
        "how_to": ["1. Dirígete a **Operaciones -> Caja y Bóveda**.", "2. Abre tu turno con el monto base.", "3. Registra movimientos de entrada o salida según la operación.", "4. Al final del día, realiza el arqueo y cierra el turno para generar el reporte."],
        "tags": ["efectivo", "dinero", "arqueo", "cajero", "recibo", "boveda", "turno"]
    },
    "prestamos": {
        "title": "Cartera de Crédito y Préstamos",
        "description": "Gestión integral del ciclo de vida crediticio: desde la solicitud hasta la recuperación de cartera.",
        "functions": ["Scoring de riesgo automático.", "Simulación de tablas de amortización.", "Desembolso masivo e individual.", "Gestión de mora y cobros preventivos."],
        "how_to": ["1. Entra a **Operaciones -> Préstamos**.", "2. Haz clic en **Nueva Solicitud** y elige al socio.", "3. Configura el monto, la tasa y el sistema (Francés/Alemán).", "4. Genera la tabla y pulsa **Desembolsar** para afectar la contabilidad."],
        "tags": ["credito", "prestamo", "interes", "mora", "scoring", "financiamiento", "amortizacion"]
    },
    "socios": {
        "title": "Gestión de Socios y KYC",
        "description": "Ecosistema de identidad institucional centrado en el conocimiento profundo del socio (CRM 360).",
        "functions": ["Registro KYC (Know Your Customer).", "Dashboards 360 de actividad del socio.", "Gestión de dependientes y beneficiarios.", "Mapeo de relaciones y círculos de confianza."],
        "how_to": ["1. Ve a **Operaciones -> Gestión de Socios**.", "2. Usa el buscador para encontrar socios existentes o el botón **+** para nuevos.", "3. En el perfil, navega por las pestañas para ver ahorros, préstamos y documentos.", "4. Actualiza la información de cumplimiento periódicamente."],
        "tags": ["socio", "miembro", "kyc", "perfil", "crm", "civil", "documentacion"]
    },
    "contactos": {
        "title": "Clientes y Proveedores (Entidades Externas)",
        "description": "Base de datos maestra para la gestión de relaciones comerciales y fiscales con terceros.",
        "functions": ["Registro de RNC/Cédula.", "Clasificación por tipo (Cliente/Proveedor).", "Historial de transacciones vinculadas.", "Gestión de contactos y direcciones."],
        "how_to": ["1. Ve a **Operaciones -> Clientes / Prov.**.", "2. Utiliza el botón **Nuevo Contacto** para registrar una entidad.", "3. Completa los datos fiscales para asegurar la validez de los NCF.", "4. Vincula contactos a facturas o compras desde sus respectivos módulos."],
        "tags": ["clientes", "proveedores", "contactos", "rnc", "entidades", "terceros"]
    },
    "cuentas": {
        "title": "Catálogo de Cuentas (Arquitectura Contable)",
        "description": "Estructura jerárquica que define la organización financiera y el plan de cuentas de la institución.",
        "functions": ["Gestión de niveles contables.", "Configuración de cuentas madre y auxiliares.", "Asignación de tipos de cuenta (Activo, Pasivo, etc.).", "Control de cuentas de cierre."],
        "how_to": ["1. Accede a **Operaciones -> Catálogo Cuentas**.", "2. Navega por el árbol jerárquico para ver la estructura.", "3. Selecciona una cuenta para editar sus parámetros o ver su saldo actual.", "4. Crea nuevas cuentas auxiliares respetando la codificación institucional."],
        "tags": ["catalogo", "cuentas", "contabilidad", "auxiliar", "plan", "jerarquia"]
    },
    "inventario": {
        "title": "Gestión de Almacén e Inventario",
        "description": "Control de activos corrientes y mercaderías con valoración automática y alertas de reposición.",
        "functions": ["Control de existencias multi-sucursal.", "Valoración PEPS/Costo Promedio.", "Manejo de servicios y productos físicos.", "Historial de movimientos detallado."],
        "how_to": ["1. Ve a **Operaciones -> Inventario**.", "2. Registra nuevos artículos en el botón **+**.", "3. Los niveles de stock se ajustan automáticamente con compras y ventas.", "4. Realiza ajustes manuales para mermas o inventario físico."],
        "tags": ["productos", "stock", "existencia", "almacen", "reposicion", "servicio", "costo"]
    },

    // --- VENTAS Y COMPRAS ---
    "pos": {
        "title": "Punto de Venta Elite (POS)",
        "description": "Terminal de ventas de alto rendimiento optimizado para una experiencia de usuario 'Elite' con soporte multimedia.",
        "functions": ["Venta rápida mediante escaneo o selección visual.", "Soporte para múltiples métodos de pago.", "Integración total con NCF.", "Gestión de productos con imágenes y animaciones."],
        "how_to": ["1. Accede a **Ventas -> Punto de Venta**.", "2. Selecciona los artículos o usa el buscador.", "3. Configura el tipo de NCF y cliente en el botón **Pagar Ahora**.", "4. Confirma el pago e imprime el ticket de venta digital."],
        "tags": ["pos", "venta", "caja", "recaudacion", "ticket", "factura", "elite"]
    },
    "documentos": {
        "title": "Gestión Documental (DMS)",
        "description": "Repositorio centralizado de expedientes operativos y legales con control de versiones y seguridad avanzada.",
        "functions": ["Indexación de expedientes de socios.", "Escaneo y carga masiva de documentos.", "Búsqueda por metadatos.", "Control de permisos de acceso."],
        "how_to": ["1. Ve a **Ventas -> Gestión Documental**.", "2. Busca el expediente por nombre o cédula.", "3. Carga nuevos archivos arrastrándolos a la zona de carga.", "4. Categoriza el documento para facilitar su recuperación posterior."],
        "tags": ["documentos", "archivo", "expediente", "gestion", "digitalizacion", "dms"]
    },
    "proyectos": {
        "title": "Proyectos & Tareas Operativas",
        "description": "Herramienta de gestión por objetivos para el seguimiento de la ejecución institucional.",
        "functions": ["Tablero Kanban de tareas.", "Seguimiento de tiempos y hitos.", "Asignación de responsables.", "Reportes de productividad operativa."],
        "how_to": ["1. Accede a **Ventas -> Proyectos & Tareas**.", "2. Crea un nuevo proyecto para una iniciativa específica.", "3. Añade tareas y muévelas entre columnas según su progreso.", "4. Revisa las fechas límite para asegurar el cumplimiento de objetivos."],
        "tags": ["proyectos", "tareas", "kanban", "gestion", "operacion", "seguimiento"]
    },
    "facturacion": {
        "title": "Sistema de Facturación NCF",
        "description": "Motor fiscal para la emisión de facturas oficiales bajo los estándares de la DGII.",
        "functions": ["Emisión de comprobantes B01, B02, etc.", "Cálculo automático de ITBIS.", "Generación masiva de facturas recurrente.", "Control de créditos y vencimientos."],
        "how_to": ["1. Dirígete a **Ventas -> Facturación**.", "2. Haz clic en **Nueva Factura**.", "3. Selecciona el NCF y los ítems del inventario.", "4. Guarda o aprueba la factura para registrarla en el ledger."],
        "tags": ["ncf", "dgii", "fiscal", "comprobante", "itbis", "impuesto", "cuenta"]
    },
    "cxc": {
        "title": "Cuentas por Cobrar (CxC)",
        "description": "Gestión del ciclo de cobros y administración de la deuda comercial de clientes.",
        "functions": ["Dashboard de antigüedad de saldos.", "Aplicación de recibos de cobro.", "Gestión de promesas de pago.", "Notificación automática de vencimientos."],
        "how_to": ["1. Ve a **Ventas -> C. por Cobrar**.", "2. Visualiza el resumen de montos vencidos y por vencer.", "3. Utiliza la opción **Recibo de Cobro** para aplicar pagos a facturas.", "4. Genera estados de cuenta para enviar a clientes en mora."],
        "tags": ["cxc", "cobros", "deuda", "clientes", "recibo", "vencimiento"]
    },
    "cxp": {
        "title": "Cuentas por Pagar (CxP)",
        "description": "Administración de obligaciones financieras con proveedores y cronograma de desembolsos.",
        "functions": ["Planificación de pagos.", "Registro de facturas de proveedores.", "Control de vencimientos de deuda.", "Integración con Tesorería/Bancos."],
        "how_to": ["1. Entra a **Ventas -> C. por Pagar**.", "2. Revisa las facturas pendientes de pago.", "3. Selecciona las obligaciones a liquidar según la disponibilidad de caja.", "4. Genera la orden de pago para su procesamiento bancario."],
        "tags": ["cxp", "pagos", "deuda", "proveedores", "desembolso", "obligaciones"]
    },
    "compras": {
        "title": "Gestión de Compras y Gastos ELITE",
        "description": "Módulo avanzado de registro de adquisiciones con el nuevo panel de Asiento Contable 'Image 2 style' que permite un cuadre visual inmediato y automático.",
        "functions": ["Registro de facturas de compra con NCF.", "Auto-generación de asiento contable equilibrado.", "Validación visual de cuadre (Badge CUADRADO).", "Soporte para las 9 categorías de gasto DGII."],
        "how_to": ["1. Accede a **Ventas -> Compras**.", "2. Ingresa el **Monto Total**; el sistema calculará ITBIS y Retenciones automáticamente.", "3. Observa el **Asiento Contable Elite** abajo: usa las barras azules/verdes para identificar Débitos y Créditos.", "4. Verifica el badge **[✓ CUADRADO]** y presiona 'Registrar' para afectar el Ledger."],
        "tags": ["compras", "gastos", "proveedor", "ncf", "gasto", "factura", "elite", "asiento"],
        "path": "/erp/compras"
    },
    "cotizaciones": {
        "title": "Cotizaciones y Presupuestos",
        "description": "Herramienta para la creación de propuestas comerciales formales que pueden convertirse en facturas con un solo clic.",
        "functions": ["Creación de cotizaciones con validez temporal.", "Conversión automática a factura.", "Seguimiento de estatus (Pendiente, Aceptada, Vencida)."],
        "how_to": ["1. Ve a **Ventas -> Cotizaciones**.", "2. Crea una nueva propuesta para tu cliente.", "3. Envía por correo o descarga en PDF.", "4. Cuando sea aprobada, usa el botón **Convertir a Factura**."],
        "tags": ["cotizacion", "presupuesto", "propuesta", "oferta", "cliente"],
        "path": "/erp/cotizaciones"
    },
    "notas": {
        "title": "Notas de Crédito y Débito",
        "description": "Módulo de ajustes fiscales para facturas emitidas, permitiendo devoluciones o cargos adicionales con NCF de serie B04.",
        "functions": ["Anulación parcial o total de facturas.", "Ajuste de montos por errores o devoluciones.", "Integración con reporte 607."],
        "how_to": ["1. Accede a **Ventas -> Notas Cred./Déb.**.", "2. Selecciona la factura a la cual aplicarás el ajuste.", "3. Define si es Crédito (Bajar deuda) o Débito (Subir deuda).", "4. Completa el motivo y genera el comprobante fiscal."],
        "tags": ["nota de credito", "devolucion", "ncf", "ajuste", "descuento", "b04"],
        "path": "/erp/notas"
    },
    "ordenes_compra": {
        "title": "Órdenes de Compra",
        "description": "Control preventivo de adquisiciones que permite formalizar pedidos a proveedores antes de recibir la factura.",
        "functions": ["Solicitud de mercancías a proveedores.", "Control de recepción parcial o total.", "Vinculación directa con el módulo de Compras."],
        "how_to": ["1. Ve a **Ventas -> Órdenes de Compra**.", "2. Genera una orden detallando productos y precios pactados.", "3. Al recibir la mercancía, convierte la orden en una **Compra** para registrar el gasto fiscal."],
        "tags": ["orden", "pedido", "proveedor", "adquisicion", "stock"],
        "path": "/erp/ordenes"
    },
    "estados_cuenta": {
        "title": "Estados de Cuenta (Auxiliares)",
        "description": "Visión consolidada de todos los movimientos y saldos pendientes de un cliente o proveedor específico.",
        "functions": ["Reporte histórico de transacciones.", "Balance de antigüedad de saldos.", "Exportación masiva para conciliación externa."],
        "how_to": ["1. Accede a **Ventas -> Estados de Cuenta**.", "2. Busca la entidad (Cliente o Proveedor).", "3. Define el rango de fechas.", "4. Visualiza la columna de 'Balance' para conocer la deuda neta actual."],
        "tags": ["estado de cuenta", "balance", "deuda", "historial", "movimientos", "conciliacion"],
        "path": "/erp/estados-cuenta"
    },
    "recurrentes": {
        "title": "Asientos y Facturación Recurrente",
        "description": "Automatización de procesos repetitivos mensuales como alquileres, suscripciones o depreciaciones.",
        "functions": ["Plantillas de transacciones fijas.", "Ejecución masiva programada.", "Ahorro de tiempo en cierres mensuales."],
        "how_to": ["1. Ve a **Contabilidad -> Recurrentes**.", "2. Crea una plantilla con el asiento o factura que se repite.", "3. Define la frecuencia (mensual, quincenal).", "4. Ejecuta el proceso cada mes para generar todos los registros automáticamente."],
        "tags": ["recurrente", "automatizacion", "mensual", "plantilla", "depreciacion"],
        "path": "/erp/recurrentes"
    },
    "aging": {
        "title": "Antigüedad (Aging) de Saldos",
        "description": "Analítica especializada que clasifica las deudas (CxC) y compromisos (CxP) por rango de días vencidos (0-30, 31-60, etc.).",
        "functions": ["Identificación de morosidad temprana.", "Provisión de cuentas incobrables.", "Estrategia de cobranza basada en tiempo."],
        "how_to": ["1. Accede a **Contabilidad -> Antigüedad CxC/CxP**.", "2. Visualiza el gráfico de barras por antigüedad.", "3. Haz clic en un periodo para ver el detalle de facturas vencidas.", "4. Prioriza los cobros de las deudas en rojo (+90 días)."],
        "tags": ["aging", "antiguedad", "mora", "vencido", "cobro", "deuda"],
        "path": "/erp/aging"
    },
    "exchange": {
        "title": "Exchange & Tokens Tokenización",
        "description": "Módulo FinTech para la gestión de criptoactivos institucionales y emisión de tokens privados de la cooperativa.",
        "functions": ["Intercambio entre monedas (Fíat/Cripto).", "Gestión de reservar en tokens.", "Billetera digital integrada."],
        "how_to": ["1. Ve a **FinTech -> Exchange & Tokens**.", "2. Realiza el swap entre activos disponibles.", "3. Los movimientos se registran automáticamente en el Sovereign Vault."],
        "tags": ["exchange", "token", "crypto", "bitcoin", "swap", "fintech"],
        "path": "/erp/exchange"
    },
    "cobros": {
        "title": "Cobros y Deducciones (RRHH)",
        "description": "Gestión de cuotas de préstamos, seguros y otras deducciones que se aplican automáticamente a la nómina del personal.",
        "functions": ["Configuración de descuentos fijos.", "Aplicación automática en proceso de nómina.", "Historial de saldos por empleado."],
        "how_to": ["1. Accede a **Talento/RRHH -> Cobros y Deducciones**.", "2. Vincula un préstamo o servicio a un empleado.", "3. Define el monto a descontar por periodo.", "4. El sistema restará el valor automáticamente en el próximo volante de pago."],
        "tags": ["descuentos", "deducciones", "prestamo", "nomina", "sueldo"],
        "path": "/erp/cobros"
    },
    "segmentacion": {
        "title": "Segmentación de Socios",
        "description": "Clasificación inteligente de socios basada en comportamiento, depósitos y lealtad para campañas personalizadas.",
        "functions": ["Agrupación por nivel de ahorro.", "Segmentos por zona geográfica o edad.", "Exportación para marketing dirigido."],
        "how_to": ["1. Ve a **Talento/RRHH -> Segmentación Socios**.", "2. Define los criterios de filtrado.", "3. Guarda el segmento para aplicaciones futuras.", "4. Visualiza la salud de cada grupo en los dashboards específicos."],
        "tags": ["segmento", "grupos", "socios", "clasificacion", "marketing"],
        "path": "/erp/segmentacion"
    },
    "activos": {
        "title": "Gestión de Activos Fijos",
        "description": "Control detallado de los bienes de la empresa (maquinaria, edificios, equipos) y su depreciación acumulada.",
        "functions": ["Cálculo de depreciación (Línea Recta).", "Control de ubicación y responsables.", "Baja y venta de activos con impacto contable."],
        "how_to": ["1. Accede a **Empresa -> Activos Fijos**.", "2. Registra el nuevo activo con su fecha de compra y vida útil.", "3. Ejecuta el proceso de depreciación menusal.", "4. Consulta el valor en libros neto en cualquier momento."],
        "tags": ["activos", "depreciacion", "equipos", "mobiliario", "patrimonio"],
        "path": "/erp/activos"
    },
    "control_interno": {
        "title": "Control Interno y Auditoría Operativa",
        "description": "Herramienta de supervisión para verificar que las operaciones cumplen con las normativas institucionales.",
        "functions": ["Checklists de cumplimiento.", "Alertas de anomalías transaccionales.", "Reportes de desviación presupuestaria."],
        "how_to": ["1. Ve a **Empresa -> Control Interno**.", "2. Realiza las auditorías periódicas según los protocolos.", "3. Reporta hallazgos y asocia acciones correctivas.", "4. Monitorea el cierre de las incidencias reportadas."],
        "tags": ["auditoria", "control", "cumplimiento", "norma", "seguridad"],
        "path": "/erp/control-interno"
    },
    "juridico": {
        "title": "Gestión Jurídica y Legal",
        "description": "Módulo para el seguimiento de casos legales, contratos y garantías de préstamos en mora.",
        "functions": ["Seguimientos de procesos judiciales.", "Gestión de garantías y contratos.", "Alertas de vencimiento de poderes legales."],
        "how_to": ["1. Accede a **Empresa -> Gestión Jurídica**.", "2. Carga los expedientes legales vinculados a socios o proveedores.", "3. Actualiza el estatus de cada caso (En curso, Cerrado, Sentencia).", "4. Vincula abogados externos si es necesario."],
        "tags": ["legal", "abogados", "contratos", "garantias", "mora", "tribunal"],
        "path": "/erp/juridico"
    },
    "cierre": {
        "title": "Cierre Mensual y Fiscal",
        "description": "Bloqueo de periodos contables para evitar modificaciones en datos históricos ya reportados.",
        "functions": ["Bloqueo de fechas transaccionales.", "Generación automática de asientos de cierre de ingresos/gastos.", "Validación de integridad previa al IR-2."],
        "how_to": ["1. Ve a **Empresa -> Cierre Fiscal**.", "2. Ejecuta las validaciones de balance previas.", "3. Selecciona el mes a cerrar.", "4. Una vez cerrado, el sistema impedirá cualquier registro con fecha anterior."],
        "tags": ["cierre", "periodo", "bloqueo", "fiscal", "impuestos", "contabilidad"],
        "path": "/erp/cierre"
    },
    "seguridad": {
        "title": "Usuarios, Roles y Permisos",
        "description": "Centro de comando para la gestión de accesos y perfiles de seguridad de todo el personal.",
        "functions": ["Creación de usuarios con credenciales únicas.", "Asignación de roles (Cajero, Contador, etc.).", "Control granular de visibilidad de módulos."],
        "how_to": ["1. Accede a **Empresa -> Usuarios y Roles**.", "2. Crea el perfil del nuevo empleado.", "3. Elige el rol adecuado para limitar sus acciones.", "4. Activa la verificación de dos pasos (2FA) para mayor seguridad."],
        "tags": ["usuarios", "seguridad", "password", "permisos", "roles", "acceso"],
        "path": "/erp/seguridad"
    },
    "bancos": {
        "title": "Gestión de Bancos y Conciliación",
        "description": "Administración de cuentas bancarias institucionales y control de movimientos financieros.",
        "functions": ["Registro de depósitos y retiros.", "Conciliación bancaria automática.", "Importación de estados de cuenta.", "Control de transferencias internas."],
        "how_to": ["1. Ve a **Contabilidad -> Bancos**.", "2. Selecciona la cuenta bancaria a trabajar.", "3. Carga el estado de cuenta digital desde tu banco.", "4. Realiza el proceso de conciliación para asegurar el cuadre con el ledger."],
        "tags": ["bancos", "conciliacion", "cheques", "transferencias", "estado", "cuadre"],
        "path": "/erp/bancos"
},
    "asientos": {
        "title": "Entradas de Diario y Ledger",
        "description": "Registro contable maestro basado en el protocolo de doble partida con integridad institucional.",
        "functions": ["Creación de asientos manuales y automáticos.", "Cuadro automático de débitos y créditos.", "Conexión directa con auxiliares del catálogo.", "Firma criptográfica de transacciones."],
        "how_to": ["1. Entra a **Contabilidad -> Entradas de Diario**.", "2. Presiona **Nuevo Asiento**.", "3. Selecciona las cuentas del catálogo y los montos correspondientes.", "4. El sistema verificará el cuadre antes de permitir el guardado."],
        "tags": ["diario", "asiento", "contabilidad", "ledger", "cuadre", "transaccion", "libro"],
        "path": "/erp/diario"
    },
    "mayor": {
        "title": "Mayor General Sovereign",
        "description": "Visualización exhaustiva de los saldos acumulados en la arquitectura contable de la institución.",
        "functions": ["Consulta de movimientos por cuenta y periodo.", "Drill-down hasta el origen del asiento.", "Reportes comparativos multi-anuales.", "Auditoría de integridad de saldos."],
        "how_to": ["1. Accede a **Contabilidad -> Mayor General**.", "2. Selecciona la cuenta y el rango de fechas.", "3. Visualiza el detalle de transacciones que componen el saldo.", "4. Exporta los datos para análisis externo si es necesario."],
        "tags": ["mayor", "saldos", "balance", "contabilidad", "reporte", "libro", "historial"],
        "path": "/erp/mayor"
    },

    // --- REPORTES Y ANÁLISIS ---
    "reportes": {
        "title": "Estados Financieros Institucionales",
        "description": "Generación automática de informes financieros bajo estándares profesionales.",
        "functions": ["Balance General (Estado de Situación).", "Estado de Resultados (P&L).", "Balanza de Comprobación.", "Reportes de variaciones y presupuestos."],
        "how_to": ["1. Ve a **Reportes -> Estados Financieros**.", "2. Elige el tipo de reporte (Balance o Resultados).", "3. Define el periodo de corte.", "4. Haz clic en **Generar** para obtener la vista previa exportable."],
        "tags": ["reportes", "balance", "situacion", "ingresos", "gastos", "contabilidad", "financiero"],
        "path": "/erp/reportes"
    },
    "fiscal": {
        "title": "Reportes Fiscales (DGII)",
        "description": "Módulo especializado para la generación de formatos 606, 607 y otros requerimientos de la administración tributaria.",
        "functions": ["Generación de Formato 606 (Compras).", "Generación de Formato 607 (Ventas).", "Resumen de ITBIS (IT-1).", "Validación previa de NCFs."],
        "how_to": ["1. Accede a **Reportes -> Impuestos (DGII)**.", "2. Selecciona el mes fiscal a reportar.", "3. El sistema extraerá automáticamente todas las facturas y compras.", "4. Descarga el archivo TXT o Excel listo para subir a la oficina virtual."],
        "tags": ["dgii", "fiscal", "606", "607", "it1", "impuestos", "tributacion"],
        "path": "/erp/fiscal"
    },

    // --- RRHH Y TALENTO ---
    "nomina": {
        "title": "Gestión de Nómina y TSS",
        "description": "Procesamiento de compensaciones de nivel profesional con cumplimiento total de la ley laboral dominicana.",
        "functions": ["Cálculo de SFS, AFP e ISR.", "Generación masiva de volantes de pago.", "Integración con Tesorería.", "Gestión de deducciones y bonificaciones."],
        "how_to": ["1. Ve a **Talento y RRHH -> Nómina (RD)**.", "2. Verifica las incidencias del mes (horas extra, faltas).", "3. Procesa el cálculo de la nómina.", "4. Revisa y pulsa **Dispersar Pagos** para afectar bancos."],
        "tags": ["sueldo", "pago", "tss", "afp", "empleado", "rrhh", "personal"],
        "path": "/erp/nomina"
    },
    "ahorros": {
        "title": "Gestión de Ahorros y Captaciones",
        "description": "Administración integral de depósitos de socios y certificados financieros.",
        "functions": ["Apertura de libretas de ahorro.", "Cálculo de intereses acumulados.", "Gestión de certificados a plazo fijo.", "Depósitos y retiros en ventanilla."],
        "how_to": ["1. Accede a **RRHH -> Ahorros**.", "2. Selecciona al socio para ver su balance de captaciones.", "3. Registra el depósito o retiro de fondos.", "4. Imprime el comprobante de movimiento para el socio."],
        "tags": ["ahorros", "deposito", "interes", "banco", "retiro", "capital", "socio"],
        "path": "/erp/ahorros"
    },

    // --- FINTECH ENTERPRISE ---
    "sovereign_vault": {
        "title": "Sovereign Vault (Bóveda Soberana)",
        "description": "Fortaleza digital de ultra-lujo para la custodia de activos financieros críticos y reservas institucionales.",
        "functions": ["Custodia de Oro Digital y Bitcoin.", "Seguridad biométrica multicapa.", "Aislamiento de activos del balance ordinario.", "Protocolos de acceso restringido VIP."],
        "how_to": ["1. Accede a **FinTech -> Sovereign Vault**.", "2. Supera el escaneo de seguridad (biométrico).", "3. Gestiona los activos protegidos en el nodo de custodia.", "4. Solo los administradores nivel 'Sovereign' pueden realizar traslazos desde aquí."],
        "tags": ["vault", "boveda", "seguridad", "crypto", "bitcoin", "oro", "vip", "sovereign"],
        "path": "/erp/sovereign-vault"
    },
    "credit_intelligence": {
        "title": "Credit Intelligence AI",
        "description": "Motor predictivo de Inteligencia Artificial que analiza el comportamiento financiero para predecir riesgos y oportunidades.",
        "functions": ["Análisis de patrones de pago.", "Predicción de mora (Default Probability).", "Recomendación de tasas dinámicas.", "Optimización de colocación."],
        "how_to": ["1. Entra a **FinTech -> Credit Intelligence**.", "2. Visualiza el mapa de calor de riesgo de la cartera.", "3. Consulta perfiles individuales para ver su probabilidad de cumplimiento.", "4. El sistema aprende de cada transacción para refinar sus modelos."],
        "tags": ["ia", "ai", "riesgo", "analitica", "score", "predictivo", "inteligencia"],
        "path": "/erp/credit-intelligence"
    },

    // --- SISTEMA Y SEGURIDAD ---
    "parametros": {
        "title": "Parámetros del Core y Configuración",
        "description": "Configuración maestra de las reglas de negocio y parámetros operativos de Iubel.",
        "functions": ["Configuración de tasas globales.", "Parámetros de facturación.", "Reglas de cumplimiento KYC.", "Setup de interconexión API."],
        "how_to": ["1. Ve a **Empresa -> Parámetros Core**.", "2. Revisa cada pestaña de configuración según el área técnica.", "3. Asegúrate de que los valores coincidan con las políticas institucionales.", "4. Guarda los cambios para que se apliquen en todo el sistema."],
        "tags": ["configuracion", "setup", "parametros", "reglas", "core", "sistema"],
        "path": "/erp/parametros-core"
    },
    "auditoria": {
        "title": "Registro de Auditoría Forense",
        "description": "Log impenetrable de todas las acciones realizadas en el sistema para garantizar la máxima transparencia.",
        "functions": ["Tracking de usuarios y cambios.", "Detección de accesos no autorizados.", "Auditoría de integridad de base de datos.", "Reportes de cumplimiento institucional."],
        "how_to": ["1. Dirígete a **Empresa -> Auditoría**.", "2. Utiliza los filtros de usuario o módulo para auditar acciones específicas.", "3. Cada registro cuenta con una marca de tiempo inalterable.", "4. Genera informes de cumplimiento para revisores externos."],
        "tags": ["seguridad", "log", "auditoria", "cumplimiento", "control", "usuarios", "forense"],
        "path": "/erp/auditoria"
    },
    // --- ESPECIALIZADOS & FINTECH ---
    "wealth": {
        "title": "Wealth Terminal (Gestión de Patrimonio)",
        "description": "Plataforma de visualización y gestión de portafolios de inversión institucional y altos patrimonios.",
        "functions": ["Analítica de rendimientos.", "Mapeo de activos diversificados.", "Proyecciones de crecimiento.", "Gestión de dividendos."],
        "how_to": ["1. Ve a **FinTech -> Wealth Terminal**.", "2. Revisa el valor neto de los portafolios bajo gestión.", "3. Analiza las gráficas de rendimiento comparativo.", "4. Ejecuta ajustes de rebalanceo según la estrategia financiera."],
        "tags": ["patrimonio", "inversion", "wealth", "capital", "portafolio", "crecimiento"],
        "path": "/erp/wealth"
    },
    "tarjetas": {
        "title": "Card Issuing (Emisión de Tarjetas)",
        "description": "Centro de control para la emisión y gestión de tarjetas corporativas, de crédito y prepago.",
        "functions": ["Emisión instantánea de tarjetas virtuales.", "Control de límites y bloqueos.", "Monitoreo de consumos en tiempo real.", "Integración con redes de pago internacionales."],
        "how_to": ["1. Accede a **FinTech -> Card Issuing**.", "2. Selecciona al socio o empleado para emitir una tarjeta.", "3. Define los límites de gasto y categorías permitidas.", "4. Activa la tarjeta y monitorea sus transacciones desde el log central."],
        "tags": ["tarjetas", "card", "visa", "mastercard", "pago", "credito", "debito"],
        "path": "/erp/tarjetas"
    },
    "datanode": {
        "title": "Data Node (Nodos de Datos)",
        "description": "Arquitectura de procesamiento distribuido para asegurar la disponibilidad y redundancia de la información crítica.",
        "functions": ["Monitoreo de nodos de red.", "Sincronización de base de datos.", "Gestión de carga y performance.", "Blindaje de infraestructura."],
        "how_to": ["1. Ve a **FinTech -> Data Node**.", "2. Verifica que todos los nodos estén en estatus 'Online'.", "3. Revisa la integridad de la replicación de datos.", "4. En caso de alerta, el sistema activará automáticamente el nodo de respaldo."],
        "tags": ["nodos", "datos", "servidor", "red", "infraestructura", "seguridad", "performance"],
        "path": "/erp/datanode"
    },
    // --- RRHH AVANZADO ---
    "talento": {
        "title": "Gestión de Talento Humano",
        "description": "Módulo integral de capital humano enfocado en el desarrollo, cultura y desempeño del personal.",
        "functions": ["Expedientes digitales de empleados.", "Evaluación de desempeño.", "Plan de capacitación y crecimiento.", "Gestión de clima organizacional."],
        "how_to": ["1. Accede a **Talento y RRHH -> Talento Humano**.", "2. Crea o edita perfiles de empleados incluyendo sus competencias.", "3. Configura periodos de evaluación.", "4. Analiza los resultados para planes de incentivos o promociones."],
        "tags": ["talento", "empleados", "rrhh", "personal", "evaluacion", "cultura"],
        "path": "/erp/talento-humano"
    },
    "balance_social": {
        "title": "Balance Social y Cooperativo",
        "description": "Reporte estratégico que mide el impacto social, comunitario y ético de la institución.",
        "functions": ["Cálculo de indicadores de impacto social.", "Mapeo de beneficios a la comunidad.", "Reporte de cumplimiento ético.", "Visualización de aporte solidario."],
        "how_to": ["1. Ve a **Talento y RRHH -> Balance Social**.", "2. Selecciona el periodo de análisis social.", "3. Completa los indicadores cualitativos y cuantitativos.", "4. Genera el documento oficial para la asamblea de socios."],
        "tags": ["social", "impacto", "comunidad", "etica", "solidario", "cooperativa", "reporte"],
        "path": "/erp/balance-social"
    },
    // --- ESTADOS FINANCIEROS AVANZADOS ---
    "niif": {
        "title": "Reporting bajo Normas NIIF (IFRS)",
        "description": "Módulo de cumplimiento internacional para la presentación de estados financieros bajo estándares globales.",
        "functions": ["Conversión automática a NIIF.", "Gestión de valor razonable.", "Notas a los estados financieros automatizadas.", "Reportes multimoneda."],
        "how_to": ["1. Accede a **Reportes -> Estados NIIF**.", "2. Aplica las políticas contables internacionales definidas.", "3. Genera el Balance o Estado de Resultados con formato NIIF.", "4. Revisa las revelaciones automáticas sugeridas por la IA."],
        "tags": ["niif", "ifrs", "internacional", "contabilidad", "reporte", "global", "normas"],
        "path": "/erp/niif"
    },
    "analytics": {
        "title": "Analytics & Business Intelligence (BI)",
        "description": "Motor de descubrimiento de datos que transforma la información operativa en decisiones estratégicas.",
        "functions": ["Visualización de big data.", "Análisis de tendencias multi-dimensional.", "Dashboards interactivos.", "Exportación de data-sets para ciencia de datos."],
        "how_to": ["1. Entra a **Reportes -> Analytics & BI**.", "2. Selecciona el dashboard de interés (Ventas, Riesgo, etc.).", "3. Filtra y profundiza en los datos usando los gráficos interactivos.", "4. Descubre patrones ocultos mediante el motor de correlación."],
        "tags": ["bi", "analytics", "datos", "inteligencia", "estrategia", "bigdata", "ciencia"],
        "path": "/erp/analytics"
    }
};

