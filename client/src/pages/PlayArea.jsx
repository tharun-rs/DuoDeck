import React, { useState, useEffect } from "react";
import "../styles/PlayArea.css";
import cardSets from '../data/cardSet.json';

const PlayArea = () => {
    const [selectedCard, setSelectedCard] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [activeSets, setActiveSets] = useState([]);

    const handleCardClick = (card) => {
        console.log('Card clicked:', card);
        setSelectedCard(card === selectedCard ? null : card);
    };

    const handleOpponentClick = (player) => {
        console.log('Opponent clicked:', player);
        setSelectedPlayer(player === selectedPlayer ? null : player);
    };
    // Delete this section after integrating with backend
    const playerName = 'rst';

    const hand = [
        '10_of_spades', '2_of_diamonds', '6_of_diamonds',
        'J_of_clubs', 'J_of_hearts', 'A_of_diamonds',
        '2_of_hearts', '9_of_diamonds', '4_of_clubs',
        '10_of_diamonds', '8_of_spades', 'Q_of_hearts', 'Q_of_diamonds', 'joker_black',
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

    // Delete uptil this

    useEffect(() => {
        const setsWithMatches = cardSets.sets.filter(set =>
            set.cards.some(card => hand.includes(card))
        );
        setActiveSets(setsWithMatches);
    }, [hand]);

    const renderCardSet = (set) => {
        return (
            <div key={set.name} className="card-set">
                <div className="set-cards">
                    {set.cards.map(card => {
                        const isAvailable = hand.includes(card);
                        return (
                            <img
                                key={card}
                                src={`/cards/${card}.png`}
                                alt={card}
                                className={`set-card ${isAvailable ? 'available' : 'missing'}`}
                                title={isAvailable ? card : `Missing: ${card}`}
                            />
                        );
                    })}
                </div>
            </div>
        );
    };

    const getTeamColor = (name) => {
        const player = playerList.find(p => p.playerName === name);
        const thisPlayer = playerList.find(p => p.playerName === playerName);
        if (thisPlayer.team === player.team) {
            return [player.team, false];
        }
        else {
            return [player.team, true];
        }
    };

    return (
        <div className="play-area">
            <h2 className="current-player-header">Current Player: {currentPlayer}</h2>
            <div className="game-layout">
                <div className="current-player-pane">
                    <h3>Your Hand</h3>
                    <div className="sets-container">
                        {activeSets.length > 0 ? (
                            activeSets.map(renderCardSet)
                        ) : (
                            <p>No Cards available</p>
                        )}
                    </div>
                </div>
                <div className="other-players-pane">
                    {Object.entries(playersHandCount).map(([player, count]) => {
                        if (player === playerName) return null;

                        const [teamColor, isOpponent] = getTeamColor(player);
                        const isCurrent = player === currentPlayer;

                        return (
                            <div
                                key={player}
                                className={`player-summary ${teamColor}`}
                                onClick={() => handleOpponentClick(player)}
                                style={{ cursor: isOpponent ? 'pointer' : 'default' }}
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
