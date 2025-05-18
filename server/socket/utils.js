import redisClient from "../config/redis";
import { dealCards } from "./game";

const startGame = async (io, room) => {
    const hands = dealCards(room);
    const handsCount = Object.fromEntries(
        Object.entries(hands).map(([playerName, cards]) => [playerName, cards.length])
    );

    const playerDetails = [];
    const playerToTeamMapping = [];
    for (let i = 0; i < room.bluePlayers.length; i++) {
        playerToTeamMapping.push({ playerName: room.bluePlayer[i].playerName, team: "blue" });
        playerToTeamMapping.push({ playerName: room.redPlayer[i].playerName, team: "red" });

        playerDetails.push({ id: room.bluePlayer[i].id, playerName: room.bluePlayer[i].playerName, team: "blue" });
        playerDetails.push({ id: room.redPlayer[i].id, playerName: room.redPlayer[i].playerName, team: "red" });
    }

    await redisClient.set(`room:${room.roomId}:players`, JSON.stringify(playerDetails));
    await redisClient.set(`room:${room.roomId}:currentPlayer`, 1);
    await redisClient.set(`room:${room.roomId}:size`, room.size);


    io.to(room.roomId).emit("players-list", playerToTeamMapping);
    io.to(room.roomId).emit("current-player", playerToTeamMapping[0].playerName);
    io.to(room.roomId).emit("player-hand-count", handsCount);

    for (let i = 0; i < playerDetails.length; i++) {
        const player = playerDetails[i];
        const playerHand = hands[player.playerName];

        // Emit player's hand
        io.to(player.id).emit("player-hand", playerHand);

        // Store player's hand in Redis as a Set
        const redisKey = `room:${room.roomId}:hand:${player.playerName}`;
        if (playerHand && playerHand.length > 0) {
            await redisClient.sAdd(redisKey, ...playerHand);
        }
    }

    await redisClient.hset(`room:${room.roomId}:handscount`, handsCount); // store only count to display for all players
    await redisClient.del(`room:${room.roomId}`); // delete room details once all players join
};


export default startGame;