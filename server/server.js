const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const twilio = require("twilio");
const {
  SigningKeyPage,
} = require("twilio/lib/rest/api/v2010/account/signingKey");

const PORT = process.env.PORT || 5002;
const app = express();
const server = http.createServer(app);
app.use(cors());

let connectedUsers = [];
let rooms = [];
app.get("/api/room-exists/:roomId", (req, res) => {
  const { roomId } = req.params;
  const room = rooms.find((room) => room.id === roomId);
  if (room) {
    if (room.connectedUsers.length > 3) {
      return res.send({ roomExists: true, full: true });
    } else {
      return res.send({ roomExists: true, full: false });
    }
  } else {
    return res.send({ roomExists: false });
  }
});

// app.get(`/api/get-turn-credentials`, (req, res) => {
//   const accountSid = "ACd768520c6287e419d5118ff989a5ff69";
//   const authToken = "cb129a8af27dbac3308537ed1d1bf799";

//   const client = twilio(accountSid, authToken);
//   let responseToken = null;
//   try {
//     client.tokens.create().then((token) => {
//       responseToken = token;
//       res.send({ token });
//     });
//   } catch (err) {
//     console.log("errr occured during turn");
//     console.log(err);
//     res.send({ token: null });
//   }
// });

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  console.log(`user connected ${socket.id}`);

  socket.on("create-new-room", (data) => {
    createNewRoomHandler(data, socket);
  });
  socket.on("join-room", (data) => {
    joinRoomHandler(data, socket);
  });

  socket.on("disconnect", () => {
    disconnectHandler(socket);
  });
  socket.on("conn-signal", (data) => {
    signalingHandler(data, socket);
  });
  socket.on("conn-init", (data) => {
    initializeConnectionHandler(data, socket);
  });
});

const createNewRoomHandler = (data, socket) => {
  console.log("host is creating new room");
  console.log(data);
  const { identity, onlyAudio } = data;
  const roomId = uuidv4();

  const newUser = {
    identity,
    id: uuidv4(),
    socketId: socket.id,
    roomId,
    onlyAudio,
  };
  connectedUsers = [...connectedUsers, newUser];
  const newRoom = {
    id: roomId,
    connectedUsers: [newUser],
  };
  socket.join(roomId);
  rooms = [...rooms, newRoom];

  socket.emit("room-id", { roomId });

  socket.emit("room-update", { connectedUsers: newRoom.connectedUsers });
};
const joinRoomHandler = (data, socket) => {
  console.log("signed in");
  console.log(data);
  const { identity, roomId, onlyAudio } = data;

  const newUser = {
    identity,
    id: uuidv4(),
    socketId: socket.id,
    roomId,
    onlyAudio,
  };

  const room = rooms.find((room) => room.id === roomId);
  room.connectedUsers = [...room.connectedUsers, newUser];
  socket.join(roomId);
  connectedUsers = [...connectedUsers, newUser];
  room.connectedUsers.forEach((user) => {
    if (user.socketId !== socket.id) {
      const data = {
        connUserSocketId: socket.id,
      };
      io.to(user.socketId).emit("conn-prepare", data);
    }
  });
  io.to(roomId).emit("room-update", { connectedUsers: room.connectedUsers });
};
const disconnectHandler = (socket) => {
  // if user has registered find him and disconnect him
  const user = connectedUsers.find((user) => user.socketId === socket.id);
  if (user) {
    //remove user in srever
    const room = rooms.find((room) => room.id === user.roomId);
    room.connectedUsers = room.connectedUsers.filter(
      (user) => user.socketId !== socket.id
    );
    // leave socket io room
    socket.leave(user.roomId);

    if (room.connectedUsers.length > 0) {
      io.to(room.id).emit("user-disconnected", { socketId: socket.id });
      // emit an event to rest users which are still in the room
      io.to(room.id).emit("room-update", {
        connectedUsers: room.connectedUsers,
      });
      // close room if number of users is 0
    } else {
      rooms = rooms.filter((r) => r.id != room.id);
    }
  }
};
const signalingHandler = (data, socket) => {
  const { connUserSocketId, signal } = data;
  const signalingData = { signal, connUserSocketId: socket.id };
  io.to(connUserSocketId).emit("conn-signal", signalingData);
};
const initializeConnectionHandler = (data, socket) => {
  const { connUserSocketId } = data;
  const initData = { connUserSocketId: socket.id };
  io.to(connUserSocketId).emit("conn-init", initData);
};
server.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
