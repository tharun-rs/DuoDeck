import express from 'express';
import cors from 'cors';
import redisClient from './config/redis.js';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import http from 'http';
import setupSocketEvents from './socket/socket.js';


/**
 * Express setup
 */

const app = express();
const port = process.env.PORT;
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Socket.io setup
 */
const pubClient = redisClient.duplicate();
const subClient = redisClient.duplicate();

await Promise.all([
    pubClient.connect(),
    subClient.connect()
]);

const io = new Server(server, {
    adapter: createAdapter(pubClient, subClient),
    path: '/api/socket.io'
});

setupSocketEvents(io, redisClient);


//Start server
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
