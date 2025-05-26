import { startGame, getSetById } from "./utils.js";

const setupSocketEvents = (io, redisClient) => {
    io.on("connection", (socket) => {
        console.log("socket connected:", socket.id);

        // ----------------------------------------Socket Disconnet listener-------------------------------------------------------
        socket.on("disconnect", (reason) => {
            console.log("socket disconnected:", socket.id, "reason:", reason);
        });

        // ---------------------------------------------Join Room------------------------------------------------------------------
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
                await redisClient.set(`room:${roomId}:socket:${socket.id}:player`, playerName); //socket to player mapping
                await redisClient.set(`room:${roomId}:player:${playerName}:socket`, socket.id); //player to socket mapping
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
            await redisClient.set(`room:${roomId}:socket:${socket.id}:player`, playerName); //socket to player mapping
            await redisClient.set(`room:${roomId}:player:${playerName}:socket`, socket.id); //player to socket mapping
        });

        // ---------------------------------------------Request Card--------------------------------------------------------------
        socket.on("request-card", async ({ cardName, targetPlayer }) => {
            try {
                // Get room and player info
                const rooms = Array.from(socket.rooms);
                const roomId = rooms[1];
                const currentPlayerKey = `room:${roomId}:currentPlayer`;
                const thisPlayerKey = `room:${roomId}:socket:${socket.id}:player`;

                // Validate turn
                const currentPlayer = await redisClient.get(currentPlayerKey);
                const thisPlayer = await redisClient.get(thisPlayerKey);

                if (currentPlayer !== thisPlayer) {
                    return socket.emit("backend-error", "Not your turn");
                }

                // Key definitions
                const targetPlayerHandKey = `room:${roomId}:hand:${targetPlayer}`;
                const currentPlayerHandKey = `room:${roomId}:hand:${currentPlayer}`;
                const handsCountKey = `room:${roomId}:handscount`;

                // Check if target player has the card
                const hasCard = await redisClient.sIsMember(targetPlayerHandKey, cardName);
                if (!hasCard) {
                    io.to(roomId).emit("current-player", targetPlayer);
                    await redisClient.set(`room:${room.roomId}:currentPlayer`, targetPlayer);
                    return socket.emit("backend-error", "Card not available");
                }

                // Transaction to move card and update counts
                const multi = redisClient.multi();

                // 1. Remove from target player
                multi.sRem(targetPlayerHandKey, cardName);

                // 2. Add to current player
                multi.sAdd(currentPlayerHandKey, cardName);

                // 3. Update hands count
                multi.hIncrBy(handsCountKey, targetPlayer, -1); // Decrement target
                multi.hIncrBy(handsCountKey, currentPlayer, 1); // Increment current

                await multi.exec();

                // Notify players
                io.to(roomId).emit("card-transferred", {
                    from: targetPlayer,
                    to: currentPlayer,
                    card: cardName
                });

                // emit hands count
                const handsCount = await redisClient.hGetAll(handsCountKey);
                io.to(roomId).emit("players-hand-count", handsCount);

                // emit updated  cards
                const thisPlayerHand = await redisClient.sMembers(currentPlayerHandKey);
                socket.emit("player-hand", thisPlayerHand);

                const targetPlayerHand = await redisClient.sMembers(targetPlayerHandKey);
                const targetPlayerSocket = await redisClient.get(`room:${roomId}:player:${targetPlayer}:socket`);
                io.to(targetPlayerSocket).emit("player-hand", targetPlayerHand);
                console.log(`Card ${cardName} transferred from ${targetPlayer} to ${currentPlayer}`);
            } catch (error) {
                console.error("Card transfer error:", error);
                socket.emit("backend-error", "Card transfer failed");
            }
        });

        // -----------------------------------------------Drop Set---------------------------------------------------------------

        socket.on("drop-set", async ({ teamName, setID }) => {
            try {
                const rooms = Array.from(socket.rooms);
                const roomId = rooms[1];
                if (!roomId || !teamName || !setID) return;

                const set = getSetById(setID);
                if (!set) {
                    socket.emit("set-drop-result", { success: false, reason: "Invalid set ID" });
                    return;
                }

                // Get all players in the team
                const playersRaw = await redisClient.get(`room:${roomId}:players`);
                if (!playersRaw) return;
                const players = JSON.parse(playersRaw);

                const teamPlayers = players.filter(p => p.team === teamName);
                const opponentTeam = teamName === "blue" ? "red" : "blue";

                const allCardsInHand = new Set();

                for (const player of teamPlayers) {
                    const redisKey = `room:${roomId}:hand:${player.playerName}`;
                    const hand = await redisClient.sMembers(redisKey);
                    hand.forEach(card => allCardsInHand.add(card));
                }

                const missingCards = set.cards.filter(card => !allCardsInHand.has(card));

                if (missingCards.length > 0) {
                    socket.emit("set-drop-result", {
                        success: false,
                        reason: "Missing cards"
                    });
                    // set score to oponent team
                    const scoreKey = `room:${roomId}:score`;
                    const scoreRaw = await redisClient.get(scoreKey);
                    const score = scoreRaw ? JSON.parse(scoreRaw) : { blue: 0, red: 0 };

                    score[opponentTeam] += 1;
                    await redisClient.set(scoreKey, JSON.stringify(score));

                    io.to(roomId).emit("score-update", score);
                } else {
                    io.to(roomId).emit("set-drop-result", {
                        success: true,
                        team: teamName,
                    });
                    // set score to oponent team
                    const scoreKey = `room:${roomId}:score`;
                    const scoreRaw = await redisClient.get(scoreKey);
                    const score = scoreRaw ? JSON.parse(scoreRaw) : { blue: 0, red: 0 };

                    score[teamName] += 1;
                    await redisClient.set(scoreKey, JSON.stringify(score));

                    io.to(roomId).emit("score-update", score);
                }

                // All cards present — remove them from Redis
                const handsCountKey = `room:${roomId}:handscount`;

                for (const player of players) {
                    const redisKey = `room:${roomId}:hand:${player.playerName}`;
                    for (const card of set.cards) {
                        const removed = await redisClient.sRem(redisKey, card);
                        if (removed) {
                            await redisClient.hIncrBy(handsCountKey, player.playerName, -1);
                        }
                    }
                }

                // Emit updated hands count
                const handsCount = await redisClient.hGetAll(handsCountKey);
                io.to(roomId).emit("players-hand-count", handsCount);

                // send hands of each player seperately
                for (const player of players) {
                    const redisKey = `room:${roomId}:hand:${player.playerName}`;
                    const updatedHand = await redisClient.sMembers(redisKey);
                    const playerSocketId = await redisClient.get(`room:${roomId}:player:${player.playerName}:socket`);
                    io.to(playerSocketId).emit("player-hand", updatedHand);
                }

            } catch (error) {
                console.error("Error dropping set:", error);
                socket.emit("backend-error", "Failed to drop set");
            }
        });
    });
};

export default setupSocketEvents;
