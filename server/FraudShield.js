/**
 * Iubel FraudShield - Threat Detection Engine
 * Analiza transacciones en tiempo real para detectar anomalías y fraudes potenciales.
 */
class FraudShield {
    constructor() {
        this.thresholds = {
            unusualAmount: 500000, // Monto considerado inusual para escrutinio extra
            velocityLimit: 10,     // Transacciones por minuto por usuario
            ipGeoDrift: true       // Detectar cambios bruscos de IP/Ubicación
        };
    }

    /**
     * Evalúa el riesgo de una transacción basándose en el historial y contexto.
     */
    evaluateRisk(transaction, context) {
        let riskScore = 0; // 0 a 100
        const { amount, entity } = transaction;
        const { userRole, lastTransactions } = context;

        // 1. Anomalía de Monto
        if (amount > this.thresholds.unusualAmount) {
            riskScore += 40;
        }

        // 2. Anomalía de Rol
        if (entity === 'ajustes_contables' && userRole !== 'admin' && userRole !== 'contador') {
            riskScore += 60;
        }

        // 3. Velocidad
        if (lastTransactions && lastTransactions.length > this.thresholds.velocityLimit) {
            riskScore += 30;
        }

        const isHighRisk = riskScore >= 70;
        
        if (isHighRisk) {
            console.warn(`[FraudShield Alert] High Risk Transaction Detected! Score: ${riskScore}`);
        }

        return {
            riskScore,
            isHighRisk,
            recommendation: isHighRisk ? 'BLOCK_AND_VERIFY' : 'ALLOW',
            shieldId: `SHD-${Date.now()}`
        };
    }
}

export default new FraudShield();
