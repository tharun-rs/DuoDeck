import redisClient from "../config/redis.js";
import { dealCards } from "./game.js";
import cardSets from "../config/cardSet.json" assert { type: "json" };


const startGame = async (io, room) => {
    console.log("Starting game");
    const hands = dealCards(room);
    const handsCount = Object.fromEntries(
        Object.entries(hands).map(([playerName, cards]) => [playerName, cards.length])
    );

    const playerDetails = [];
    const playerToTeamMapping = [];
    for (let i = 0; i < room.bluePlayers.length; i++) {
        playerToTeamMapping.push({ playerName: room.bluePlayers[i].playerName, team: "blue" });
        playerToTeamMapping.push({ playerName: room.redPlayers[i].playerName, team: "red" });

        playerDetails.push({ id: room.bluePlayers[i].id, playerName: room.bluePlayers[i].playerName, team: "blue" });
        playerDetails.push({ id: room.redPlayers[i].id, playerName: room.redPlayers[i].playerName, team: "red" });
    }

    await redisClient.set(`room:${room.roomId}:currentPlayer`, playerToTeamMapping[0].playerName);
    await redisClient.set(`room:${room.roomId}:players`, JSON.stringify(playerDetails));


    io.to(room.roomId).emit("players-list", playerToTeamMapping);
    console.log("playertoteammapp", playerDetails);
    console.log("room id: ", room.roomId);
    io.to(room.roomId).emit("current-player", playerToTeamMapping[0].playerName);
    io.to(room.roomId).emit("players-hand-count", handsCount);
    io.to(room.roomId).emit("score-update", { blue: 0, red: 0 });
    console.log("hand", hands);

    for (let i = 0; i < playerDetails.length; i++) {
        const player = playerDetails[i];
        const playerHand = hands[player.playerName];

        // Emit player's hand
        io.to(player.id).emit("player-hand", playerHand);

        // Store player's hand in Redis as a Set
        const redisKey = `room:${room.roomId}:hand:${player.playerName}`;
        if (playerHand && playerHand.length > 0) {
            for (const card of playerHand) {
                await redisClient.sAdd(redisKey, card);
            }
        }
    }

    await redisClient.hSet(`room:${room.roomId}:handscount`, handsCount); // store only count to display for all players
    await redisClient.del(`room:${room.roomId}`); // delete room details once all players join
    await redisClient.set(`room:${room.roomId}:score`, JSON.stringify({ blue: 0, red: 0 })); // initialize score
};


const getSetById = (setID) => {
    return cardSets.sets.find(set => set.id === setID);
};

export {
    startGame,
    getSetById
};