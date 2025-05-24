import React from "react";
import "../styles/PlayArea.css";

const PlayArea = () => {
    const playerName = 'rst';

    const hand = [
        '10_of_spades', '2_of_diamonds', '6_of_diamonds',
        'J_of_clubs', 'J_of_hearts', 'A_of_diamonds',
        '2_of_hearts', '9_of_diamonds', '4_of_clubs',
        '10_of_diamonds', '8_of_spades', 'Q_of_hearts', 'Q_of_diamonds', 'joker_black'
    ];

    const currentPlayer = 'varsha';

    const playersHandCount = {
        'rst': 14,
        'varsha': 13,
        'ansh': 14,
        'vikrant': 13,
    };

    const playerList = [
        { playerName: "rst", team: "blue" },
        { playerName: "vikrant", team: "red" },
        { playerName: "varsha", team: "blue" },
        { playerName: "ansh", team: "red" },
    ];

    const getTeamColor = (name) => {
        const player = playerList.find(p => p.playerName === name);
        return player?.team || 'neutral';
    };

    return (
        <div className="play-area">
            <h2 className="current-player-header">Current Player: {currentPlayer}</h2>
            <div className="game-layout">
                <div className="current-player-pane">
                    <h3>Your Hand</h3>
                    <div className="cards-container">
                        {hand.map((card, index) => (
                            <img
                                key={index}
                                src={`/cards/${card}.png`}
                                alt={card}
                                className="card-image"
                            />
                        ))}
                    </div>
                </div>
                <div className="other-players-pane">
                    {Object.entries(playersHandCount).map(([player, count]) => {
                        if (player === playerName) return null;

                        const teamColor = getTeamColor(player);
                        const isCurrent = player === currentPlayer;

                        return (
                            <div
                                key={player}
                                className={`player-summary ${teamColor}`}
                            >
                                <h4 className={isCurrent ? "highlight" : ""}>
                                    {player} - {count} cards
                                </h4>
                                <div
                                    className="card-stack"
                                    style={{ '--card-count': count }}
                                >
                                    {Array.from({ length: count }).map((_, index) => (
                                        <img
                                            key={index}
                                            src="/cards/back.png"
                                            alt="card back"
                                            className="card-back"
                                            style={{ '--card-index': index + 1 }}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PlayArea;
