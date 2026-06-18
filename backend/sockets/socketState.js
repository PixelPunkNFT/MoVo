const onlineUsers = new Map();
let io = null;

function setIO(instance) {
  io = instance;
}

function getIO() {
  return io;
}

function emitToUser(userId, event, data) {
  const socketId = onlineUsers.get(userId.toString());
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
}

module.exports = { onlineUsers, setIO, getIO, emitToUser };
