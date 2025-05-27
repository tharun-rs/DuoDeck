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
    const [blueScore, setBlueScore] = useState(0);
    const [redScore, setRedScore] = useState(0);
    const [nextPlayerOptions, setNextPlayerOptions] = useState(null);

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
            setNextPlayerOptions(null);
        });

        socket.on("room-full", (message) => {
            toast.error(message);
        });

        socket.on("backend-error", (message) => {
            toast.error(message);
        });

        socket.on("card-transferred", ({ from, to, card }) => {
            toast.info(`${to} got ${card} from ${from}`);
        });

        socket.on("score-update", (scores) => {
            setBlueScore(scores.blue);
            setRedScore(scores.red);
        });

        socket.on("select-next-player", ({ options }) => {
            setNextPlayerOptions(options);
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
        },
        dropCard: (teamName, setID) => {
            socket.emit("drop-set", { teamName, setID });
        },
        setNextPlayer: (playerName) => {
            socket.emit("set-next-player", playerName);
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
                blueScore,
                redScore,
                nextPlayerOptions,

                // Emit Events
                emitEvents,

                // State Setters
                setPlayerName,
                setSocketRoomID,
                setNextPlayerOptions,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useGameSocket = () => useContext(SocketContext);
