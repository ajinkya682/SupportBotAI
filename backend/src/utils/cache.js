class CacheService {
    constructor(maxSize = 500) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.stats = { hits: 0, misses: 0, evictions: 0 };
        
        
        this.cleanupInterval = setInterval(() => this.purge(), 5 * 60 * 1000);
    }

    /**
     * Set a value in cache with TTL
     * @param {string} key 
     * @param {any} value 
     * @param {number} ttl - Time to live in milliseconds (default 1 hour)
     */
    set(key, value, ttl = 3600000) {
        
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        
        
        if (this.cache.size >= this.maxSize) {
            
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
            this.stats.evictions++;
        }

        const expiry = Date.now() + ttl;
        this.cache.set(key, { value, expiry, accessCount: 0, createdAt: Date.now() });
    }

    /**
     * Get a value from cache
     * @param {string} key 
     * @returns {any|null}
     */
    get(key) {
        const cached = this.cache.get(key);

        if (!cached) {
            this.stats.misses++;
            return null;
        }

        
        if (Date.now() > cached.expiry) {
            this.cache.delete(key);
            this.stats.misses++;
            return null;
        }

        
        cached.accessCount++;
        this.stats.hits++;
        return cached.value;
    }

    /**
     * Delete a specific key
     */
    del(key) {
        this.cache.delete(key);
    }

    /**
     * Clear all expired entries automatically
     */
    purge() {
        const now = Date.now();
        let purged = 0;
        
        for (const [key, { expiry }] of this.cache) {
            if (now > expiry) {
                this.cache.delete(key);
                purged++;
            }
        }
        
        if (purged > 0) {
            console.log(`🧹 Cache purged: ${purged} expired entries removed`);
        }
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 
            ? ((this.stats.hits / total) * 100).toFixed(2)
            : 0;
        
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hits: this.stats.hits,
            misses: this.stats.misses,
            evictions: this.stats.evictions,
            hitRate: `${hitRate}%`
        };
    }

    /**
     * Clear everything
     */
    flush() {
        this.cache.clear();
        this.stats = { hits: 0, misses: 0, evictions: 0 };
    }

    /**
     * Cleanup on shutdown
     */
    shutdown() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.flush();
    }
}


const cache = new CacheService(500); // Max 500 items
export default cache;