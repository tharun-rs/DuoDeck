import io from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // Replace with your backend URL
const ROOM_ID = "7d306";
const ROOM_SIZE = 4;

// Simulate 4 players joining
const players = [
  { name: "Player1" },
  { name: "Player2" },
  { name: "Player3" },
  { name: "Player4" },
];

// Store all sockets to prevent garbage collection
const activeSockets = [];

players.forEach((player) => {
  const socket = io(SOCKET_URL, {
    path: "/api/socket.io",
    transports: ["websocket"],
    reconnection: true,       // Enable reconnection
    reconnectionAttempts: 5, // Retry up to 5 times
    reconnectionDelay: 1000, // Wait 1s between retries
  });

  activeSockets.push(socket); // Keep socket in memory

  socket.on("connect", () => {
    console.log(`[${player.name}] Connected (ID: ${socket.id})`);

    // Join the room
    socket.emit("join-room", {
      roomId: ROOM_ID,
      roomSize: ROOM_SIZE,
      playerName: player.name,
    });
  });

  // Listen for game events
  socket.on("players-list", (data) => {
    console.log(`[${player.name}] Received players-list:`, data);
  });

  socket.on("current-player", (currentPlayer) => {
    console.log(`[${player.name}] Current player: ${currentPlayer}`);
  });

  socket.on("player-hand", (hand) => {
    console.log(`[${player.name}] Received hand:`, hand);
  });

  socket.on("player-hand-count", (counts) => {
    console.log(`[${player.name}] Hand counts:`, counts);
  });

  socket.on("room-full", (msg) => {
    console.error(`[${player.name}] Room full: ${msg}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`[${player.name}] Disconnected: ${reason}`);
  });

  socket.on("connect_error", (err) => {
    console.error(`[${player.name}] Connection error:`, err.message);
  });
});

console.log("Test started. Keeping sockets alive...");

// Prevent script from exiting
setInterval(() => {
  console.log("[Keepalive] Sockets active:", activeSockets.length);
}, 10000); // Log every 10s to keep Node.js running