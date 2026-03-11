import crypto from 'crypto';

/**
 * ImmutableLedger - Iubel Sovereign Security Core
 * Implementa una cadena de integridad criptográfica para registros financieros.
 * Cada entrada contiene un hash del registro anterior, creando un encadenamiento inmutable.
 */
class ImmutableLedger {
    /**
     * Genera un hash SHA-256 único para un objeto de datos y un hash previo.
     */
    generateHash(data, previousHash = '0000000000000000000000000000000000000000000000000000000000000000') {
        const content = JSON.stringify(data) + previousHash;
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    /**
     * Firma criptográficamente una transacción.
     * Retorna el objeto formateado con su firma de integridad.
     */
    signTransaction(transaction, lastKnownHash) {
        const timestamp = Date.now();
        const nonce = crypto.randomBytes(8).toString('hex');
        const signatureBase = {
            ...transaction,
            _ledger: {
                timestamp,
                nonce,
                previousHash: lastKnownHash || 'genesis'
            }
        };

        const hash = this.generateHash(signatureBase, lastKnownHash);
        signatureBase._ledger.hash = hash;
        
        console.log(`[Sovereign Ledger] Signed Transaction: ${hash.substring(0, 12)}...`);
        return signatureBase;
    }

    /**
     * Valida si una cadena de transacciones ha sido alterada.
     */
    verifyChain(transactions) {
        let isValid = true;
        for (let i = 1; i < transactions.length; i++) {
            const current = transactions[i];
            const previous = transactions[i-1];

            const recalculatedHash = this.generateHash(
                { ...current, _ledger: { ...current._ledger, hash: undefined } },
                previous._ledger.hash
            );

            if (recalculatedHash !== current._ledger.hash) {
                console.error(`[Sovereign Alert] Integrity Breach at Index ${i}`);
                isValid = false;
                break;
            }
        }
        return isValid;
    }
}

export default new ImmutableLedger();
