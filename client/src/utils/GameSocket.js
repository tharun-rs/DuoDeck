import { useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.SOCKET_URL;

const socket = io(SOCKET_URL, {
    transports: ["websocket"]
});

const [playerList, setPlayerList] = useState({});
const [cardList, setCardList] = useState();

socket.on("player-list", (players) => {
    setPlayerList(players);
});

socket.on("cardList", (cards) => {
    setCardList(cards);
});

const emitEvents = {
    joinRoom: (roomId, roomSize) => {
        socket.emit("join-room", { roomId, roomSize });
    },

}

export {
    playerList,
    cardList,
    emitEvents
}

