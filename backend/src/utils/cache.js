class CacheService {
    constructor(maxSize = 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    /**
     * Set a value in cache
     * @param {string} key 
     * @param {any} value 
     * @param {number} ttl - Time to live in milliseconds (default 1 hour)
     */
    set(key, value, ttl = 3600000) {
        // Size Management: If cache is full, delete the oldest entry (First-In)
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        const expiry = Date.now() + ttl;
        this.cache.set(key, { value, expiry });
    }

    /**
     * Get a value from cache
     * @param {string} key 
     * @returns {any|null}
     */
    get(key) {
        const cached = this.cache.get(key);

        if (!cached) return null;

        // Check if expired
        if (Date.now() > cached.expiry) {
            this.cache.delete(key);
            return null;
        }

        return cached.value;
    }

    /**
     * Delete a specific key
     */
    del(key) {
        this.cache.delete(key);
    }

    /**
     * Clear all expired entries manually (Optional helper)
     */
    purge() {
        const now = Date.now();
        for (const [key, { expiry }] of this.cache) {
            if (now > expiry) this.cache.delete(key);
        }
    }

    /**
     * Clear everything
     */
    flush() {
        this.cache.clear();
    }
}


const cache = new CacheService(500); // Max 500 items
export default cache;