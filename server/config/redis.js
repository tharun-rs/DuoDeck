import { createClient } from 'redis';

class RedisManager {
    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL,
            socket: {
                reconnectStrategy: retries => {
                    if (retries > 5) {
                        console.error("Too many retries giving up");
                        return new Error("Max retries reached");
                    }
                    return retries * 100;
                }
            }
        });

        this.client.on('error', err => console.error("Error occured in Redis client: ",err));
    }
    async getClient() {
        if (! this.client.isOpen) {
            await this.client.connect();
        }
        return this.client;
    }
}

const redisManager = new RedisManager();
const redisClient = await redisManager.getClient()
export default redisClient;