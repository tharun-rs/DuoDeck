import startGame from "./utils.js";

const setupSocketEvents = (io, redisClient) => {
    io.on("connection", (socket) => {
        console.log("socket connected:", socket.id);

        socket.on("disconnect", (reason) => {
            console.log("socket disconnected:", socket.id, "reason:", reason);
        });
        socket.on("join-room", async ({ roomId, roomSize, playerName }) => {

            //Store data on redis
            const redisKey = `room:${roomId}`;
            const currentUser = { playerName, id: socket.id };

            let roomStr = await redisClient.get(redisKey);
            let room;

            if (roomStr == null) {
                room = {
                    roomId,
                    size: roomSize,
                    bluePlayers: [currentUser],
                    redPlayers: [],
                    status: "WAITING_FOR_PLAYERS"
                };
                await redisClient.set(redisKey, JSON.stringify(room));
                //Join room
                socket.join(roomId);
                console.log(`${playerName} joined socket room: ${roomId}`);
                return;
            }

            room = JSON.parse(roomStr);

            if (room.status !== "WAITING_FOR_PLAYERS") {
                socket.emit("room-full", "The room you are trying to join is full");
                return;
            }

            if (room.bluePlayers.length < room.size / 2) {
                room.bluePlayers.push(currentUser);
            } else {
                room.redPlayers.push(currentUser);
                if (room.redPlayers.length === room.size / 2) {
                    room.status = "GAME_STARTED";
                    startGame(io, room);
                }
            }
            socket.join(roomId);
            console.log(`${playerName} joined socket room: ${roomId}`);
            await redisClient.set(redisKey, JSON.stringify(room));
        });
    });
};

export default setupSocketEvents;
