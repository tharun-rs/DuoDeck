const generateRoomId = () => {
    return crypto.randomUUID().slice(0, 5);
};

export {
    generateRoomId,
};