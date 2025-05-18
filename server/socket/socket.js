const setupSocketEvents = (io) => {
    io.on("connection", (socket) => {
        socket.on('join-room', (userData) => {
             if (!userData?.room || !userData?.user) {
                return socket.emit('error', 'Invalid room data');
            }
            socket.join(userData.room);
            console.log("User ",userData.user," joined the room: ", userData.room);
        });
    });
}
export default setupSocketEvents;