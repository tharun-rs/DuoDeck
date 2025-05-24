import { createContext, useContext, useEffect, useState } from 'react';
import socket from './socket';

const SocketContext = createContext();

export const GameSocket = ({ children }) => {
    const [playerList, setPlayerList] = useState({});
    const [hand, setHand] = useState([]);
    const [playerName, setPlayerName] = useState("");
    const [playersHandCount, setPlayersHandCount] = useState({});
    const [currentPlayer, setCurrentPlayer] = useState("");
    const [roomFull, setRoomFull] = useState(false);

    useEffect(() => {
        socket.connect();
        socket.on("players-list", (players) => {
            setPlayerList(players);
        });

        socket.on("player-hand", (cards) => {
            setHand(cards);
        });

        socket.on("players-hand-count", (handCount) => {
            setPlayersHandCount(handCount);
        });

        socket.on("current-player", (player) => {
            setCurrentPlayer(player);
        });

        socket.on("room-full", (message) => {
            alert(message);
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

    return (
        <SocketContext.Provider
            value={{
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
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useGameSocket = () => useContext(SocketContext);
