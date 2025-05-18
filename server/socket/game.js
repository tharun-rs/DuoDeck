const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [];

suits.forEach(suit => {
    ranks.forEach(rank => {
        deck.push(`${rank}_of_${suit}`);
    });
});
deck.push('joker_black');
deck.push('joker_red');

const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

shuffle(deck);

const dealCards = (room) => {
    const players = [...room.redPlayers, ...room.bluePlayers];
    const playerNames = players.map(player => player.playerName);

    const hands = {};
    playerNames.forEach(name => {
        hands[name] = [];
    });

    for (let i = 0; i < deck.length; i++) {
        const playerIndex = i % playerNames.length;
        hands[playerNames[playerIndex]].push(deck[i]);
    }

    return hands;
};


export { dealCards };
