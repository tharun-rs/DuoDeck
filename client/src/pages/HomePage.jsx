import React, { useState } from "react";
import "../styles/HomePage.css";
import { generateRoomId } from "../utils/utilfunctions";
import GameSocket from "../utils/GameSocket";

const HomePage = () => {
    //import sockets
    const {
        emitEvents,
        playerName,
        setPlayerName,
    } = GameSocket();

    const [mode, setMode] = useState("new"); // 'new' or 'join'
    const [roomId, setRoomId] = useState("");
    const [numPlayers, setNumPlayers] = useState(4);

    const handleStartGame = () => {
        const room_id = generateRoomId();
        setRoomId(room_id)
        emitEvents.joinRoom(room_id, numPlayers);
        alert(`Starting a new game with ${numPlayers} players!`);
    };

    const handleJoinGame = () => {
        emitEvents.joinRoom(roomId, "");
        alert(`Joining game with Room ID: ${roomId}`);
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (mode === "join") {
            handleJoinGame();
        } else {
            handleStartGame();
        }
    };

    return (
        <div className="home-container">
            <h1 className="home-title">
                <img src="/logo.png" alt="Logo" className="logo-image" />
                DuoDeck
            </h1>
            <form className="game-form" onSubmit={handleSubmit}>
                <div className="mode-toggle">
                    <button
                        type="button"
                        className={`toggle-button ${mode === "new" ? "active" : ""}`}
                        onClick={() => setMode("new")}
                    >
                        Start New Game
                    </button>
                    <button
                        type="button"
                        className={`toggle-button ${mode === "join" ? "active" : ""}`}
                        onClick={() => setMode("join")}
                    >
                        Join Existing Game
                    </button>
                </div>

                {mode === "join" && (
                    <input
                        type="text"
                        placeholder="Enter Room ID"
                        value={roomId}
                        onChange={e => setRoomId(e.target.value)}
                        className="room-input"
                        required
                    />
                )}

                {mode === "new" && (
                    <div className="player-select-container">
                        <label htmlFor="numPlayers">Number of Players:</label>
                        <select
                            id="numPlayers"
                            value={numPlayers}
                            onChange={e => setNumPlayers(parseInt(e.target.value))}
                            className="player-select"
                        >
                            <option value={4}>4</option>
                            <option value={6}>6</option>
                        </select>
                    </div>
                )}

                <input
                    type="text"
                    placeholder="Enter Player Name"
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value)}
                    className="room-input"
                    required
                />

                <button type="submit" className="submit-button">
                    {mode === "join" ? "Join Game" : "Start Game"}
                </button>
            </form>
        </div>
    );
};

export default HomePage;
