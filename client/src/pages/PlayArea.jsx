import React, { useState, useEffect } from "react";
import "../styles/PlayArea.css";
import cardSets from '../data/cardSet.json';
import { useGameSocket } from "../utils/GameSocket";

const PlayArea = () => {
    // ----------------------------------socket---------------------------------------------------------
    const {
        playerName,
        hand,
        playerList,
        currentPlayer,
        playersHandCount,
        socketRoomID,
        blueScore,
        redScore,

        emitEvents,
    } = useGameSocket();

    // ------------------------------------Use State variables-----------------------------------------------
    const [selectedCard, setSelectedCard] = useState(null);
    const [activeSets, setActiveSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState(null);

    // -------------------------------------Use Effects---------------------------------------------------------
    useEffect(() => {
        const setsWithMatches = cardSets.sets.filter(set =>
            set.cards.some(card => hand.includes(card))
        );
        setActiveSets(setsWithMatches);
    }, [hand]);


    // ----------------------------------------Utility Methods----------------------------------------------------
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

    // -------------------------------------------Handlers--------------------------------------------------------
    const handleCardClick = (card) => {
        console.log('Card clicked:', card);
        setSelectedCard(card === selectedCard ? null : card);
    };

    const handleOpponentClick = (player) => {
        console.log(currentPlayer);
        console.log(playerName);
        if (playerName !== currentPlayer) {
            alert("Not your turn!!");
            return;
        }
        if (selectedCard) {
            emitEvents.reqCard(selectedCard, player);
            setSelectedCard(null);
        }
    };

    const handleSetClick = () => {
        if(!selectedSet) return;
        console.log('Set clicked:', selectedSet);
        const teamName = getTeamColor(playerName)[0];
        const setId = selectedSet.id;
        console.log('Dropping set:', teamName, setId);
        emitEvents.dropCard(teamName, setId);
        setSelectedSet(null);
    }

    // ----------------------------------------------Renderers---------------------------------------------------
    const renderCardSet = (set) => {
        const isSetSelected = selectedSet?.name === set.name;

        return (
            <div
                key={set.name}
                className={`card-set-wrapper ${isSetSelected ? 'selected-set' : ''}`}
                onClick={(e) => {
                    // Prevent set click from overriding card click
                    if (e.target.tagName !== 'IMG') {
                        setSelectedSet(isSetSelected ? null : set);
                    }
                }}
            >
                <div className="set-name">{set.name}</div>
                <div className="set-cards">
                    {set.cards.map(card => {
                        const isAvailable = hand.includes(card);
                        const isCardSelected = selectedCard === card;

                        return (
                            <img
                                key={card}
                                src={`/cards/${card}.png`}
                                alt={card}
                                className={`set-card ${isAvailable ? 'available' : 'missing'} ${!isAvailable && isCardSelected ? 'selected-missing' : ''}`}
                                title={isAvailable ? card : `Missing: ${card}`}
                                onClick={() => {
                                    if (!isAvailable) {
                                        setSelectedCard(isCardSelected ? null : card);
                                    }
                                }}
                                style={{ cursor: !isAvailable ? 'pointer' : 'default' }}
                            />
                        );
                    })}
                </div>
            </div>
        );
    };

    // ---------------------------------------------Return----------------------------------------------------------
    return (
        <div className="play-area">
            <h2 className="current-player-header">Room ID: {socketRoomID} | Current Player: {currentPlayer}</h2>
            <h3 className="current-player-header">Blue Score: {blueScore} | Red Score: {redScore}</h3>
            {selectedSet && (
                <button
                    className="drop-button"
                    onClick={handleSetClick}
                >
                    Drop
                </button>
            )}
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
                                className={`player-summary ${teamColor} ${selectedCard && isOpponent ? 'missing-card-selected' : ''}`}
                                onClick={() => handleOpponentClick(player)}
                                style={{
                                    cursor: selectedCard && isOpponent ? 'pointer' : 'default',
                                }}
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
