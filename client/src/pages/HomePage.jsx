import React, { useState } from "react";
import "../styles/HomePage.css";

const HomePage = () => {
    const [mode, setMode] = useState("new"); // 'new' or 'join'
    const [roomId, setRoomId] = useState("");

    const handleStartGame = () => {
        alert("Starting a new game!");
    };

    const handleJoinGame = () => {
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

                <button type="submit" className="submit-button">
                    {mode === "join" ? "Join Game" : "Start Game"}
                </button>
            </form>
        </div>
    );
};

export default HomePage;
