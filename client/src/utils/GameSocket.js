import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import socket from './socket';

const SocketContext = createContext();

export const GameSocket = ({ children }) => {
    const [playerList, setPlayerList] = useState({});
    const [hand, setHand] = useState([]);
    const [playerName, setPlayerName] = useState("");
    const [playersHandCount, setPlayersHandCount] = useState({});
    const [currentPlayer, setCurrentPlayer] = useState("");
    const [socketRoomID, setSocketRoomID] = useState("");

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
            toast.error(message);
        });

        socket.on("backend-error", (message) => {
            toast.error(message);
        });

        socket.on("card-transferred", ({from, to, card}) => {
            toast.info(`${to} got ${card} from ${from}`);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const emitEvents = {
        joinRoom: (roomId, roomSize) => {
            socket.emit("join-room", { roomId, roomSize, playerName });
        },
        reqCard: (cardName, targetPlayer) => {
            socket.emit("request-card", { cardName, targetPlayer });
        }
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
                socketRoomID,

                // Emit Events
                emitEvents,

                // State Setters
                setPlayerName,
                setSocketRoomID
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useGameSocket = () => useContext(SocketContext);
