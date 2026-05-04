const cache = new Map();

const set = (key, value, ttl = 3600000) => {
    const expiry = Date.now() + ttl;
    cache.set(key, { value, expiry });
};

const get = (key) => {
    const cached = cache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiry) {
        cache.delete(key);
        return null;
    }
    return cached.value;
};

const del = (key) => {
    cache.delete(key);
};

module.exports = { set, get, del };
