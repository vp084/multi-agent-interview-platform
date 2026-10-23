import Redis from "ioredis";

const client = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
        if (times > 2) return null;
        return 500;
    }
});

client.on("connect", () => {
    console.log("redis connected");
});

client.on("error", (err) => {
    // console.warn("Redis connection warning:", err.message);
});

const redis = {
    get: async (...args) => {
        try { return await client.get(...args); } catch (e) { return null; }
    },
    set: async (...args) => {
        try { return await client.set(...args); } catch (e) { return null; }
    },
    del: async (...args) => {
        try { return await client.del(...args); } catch (e) { return null; }
    },
    on: (...args) => client.on(...args),
};

export default redis;
