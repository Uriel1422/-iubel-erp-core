/**
 * AnalyticCacheManager - Iubel Quantum Engine
 * Capa de caché analítica de alto rendimiento para emular la velocidad de SAP HANA.
 */
class AnalyticCacheManager {
    constructor() {
        this.cache = new Map();
        this.ttl = 1000 * 60 * 15; // 15 minutos de vida para reportes pesados
        this.hitCount = 0;
        this.missCount = 0;
    }

    /**
     * Obtiene datos del caché o retorna null si no existen.
     */
    get(key) {
        if (!this.cache.has(key)) {
            this.missCount++;
            return null;
        }

        const data = this.cache.get(key);
        if (Date.now() > data.expiry) {
            this.cache.delete(key);
            this.missCount++;
            return null;
        }

        this.hitCount++;
        console.log(`[Cache Hit] Serving: ${key} (Total Hits: ${this.hitCount})`);
        return data.val;
    }

    /**
     * Almacena datos en el caché.
     */
    set(key, val) {
        this.cache.set(key, {
            val,
            expiry: Date.now() + this.ttl
        });
        console.log(`[Cache Set] Stored: ${key}`);
    }

    /**
     * Invalida el caché cuando ocurre una transacción masiva.
     */
    invalidate(pattern) {
        if (pattern === '*') {
            this.cache.clear();
            return;
        }
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }

    getStatus() {
        return {
            items: this.cache.size,
            hits: this.hitCount,
            misses: this.missCount,
            efficiency: ((this.hitCount / (this.hitCount + this.missCount)) * 100 || 0).toFixed(2) + '%'
        };
    }
}

export default new AnalyticCacheManager();
