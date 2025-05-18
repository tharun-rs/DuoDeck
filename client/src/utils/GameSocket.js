import { useEffect, useState } from 'react';
import socket from './socket';
import { useNavigate } from "react-router-dom";


const GameSocket = () => {
    const [playerList, setPlayerList] = useState({});
    const [hand, setHand] = useState([]);
    const [playerName, setPlayerName] = useState("");
    const [playersHandCount, setPlayersHandCount] = useState({});
    const [currentPlayer, setCurrentPlayer] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        socket.connect();
        socket.on("players-list", (players) => {
            console.log("Received players-list:", players);
            setPlayerList(players);
        });

        socket.on("player-hand", (cards) => {
            console.log("Received player-hand:", cards);
            setHand(cards);
        });

        socket.on("players-hand-count", (handCount) => {
            console.log("Received players-hand-count:", handCount);
            setPlayersHandCount(handCount);
        });

        socket.on("current-player", (player) => {
            console.log("Received current-player:", player);
            setCurrentPlayer(player);
        });

        socket.on("room-full", (message) => {
            console.log("Received room-full:", message);
            alert(message);
            navigate("/");
        });


        return () => {
            socket.disconnect();
        };
    }, []);

    const emitEvents = {
        joinRoom: (roomId, roomSize) => {
            socket.emit("join-room", { roomId, roomSize, playerName });
        },
    };

    return {
        // Data
        playerList,
        hand,
        playerName,
        currentPlayer,
        playersHandCount,

        // Emit Events
        emitEvents,

        // State Setters
        setPlayerName
    };
};

export default GameSocket;
