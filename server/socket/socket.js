const setupSocketEvents = (io, redisClient) => {
    io.on("connection", (socket) => {
        socket.on("join-room", async ({roomId, roomSize, playerName}) => {

            //Join room
            socket.join(roomId);

            //Store data on redis
            const redisKey = `room:${roomId}`;
            const currentUser = { playerName, id: socket.id};

            let roomStr = await redisClient.get(redisKey);
            let room;

            //If game created
            if (roomStr == null) {
                room = {
                    size: roomSize,
                    bluePlayers: [currentUser],
                    redPlayers: [],
                    status: "WAITING_FOR_PLAYERS"
                };
                await redisClient.set(redisKey, JSON.stringify(room));
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
                    io.to(roomId)
                }
            }

            await redisClient.set(redisKey, JSON.stringify(room));
        });
    });
};

export default setupSocketEvents;
