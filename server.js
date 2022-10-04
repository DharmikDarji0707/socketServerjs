const app = require("express")();
const httpServer = require("http").createServer(app);
const options = {
  cors: "*",
};
const io = require("socket.io")(httpServer, options);
const { group } = require("console");
const cors = require("cors");
const { emit } = require("process");
const uniqueId = require("uuid").v4;
const CHAT_BOT = "ChatBot";

//PORT
const PORT = 3000;
let users = {};
let rooms = {};
let usersinRoom = {};

// basic route
app.get("/", (req, res) => {
  res.send("hello world");
});

// when connected
io.on("connection", (socket) => {
  console.log("Connected...");

  socket.on("iam", (name) => {
    users[socket.id] = name;

    console.log(users);
    io.emit("userActiveList", Object.entries(users));
    1;
    socket.broadcast.emit("user-added", { name: name, id: socket.id });
  });

  socket.on("createRoom", (enteredUser) => {
    let __createdtime__ = Date.now(); // Current timestamp

    let id = uniqueId();
    console.log(enteredUser, id);

    // Send message to all users currently in the room, apart from the user that just joined
    // socket.to(room).emit('receive_message', {
    //   message: `${username} has joined the chat room`,
    //   username: CHAT_BOT,
    //   __createdtime__,
    // });

    rooms[id] = enteredUser;

    socket.emit("roomId", id);
    socket.join(id);

    // socket.emit('receive_message', {
    //   message: `Welcome ${username}`,
    //   username: CHAT_BOT,
    //   __createdtime__,
    // });

    io.emit("roomlist", Object.entries(rooms));
  });

  socket.on("joinRoom", (gid) => {
    socket.join(gid);
  });

  // io.socket.in(room).emit('rRoomID', () => {})

  socket.on("message", (user) => {
    console.log(user);
    socket.broadcast.emit("rmes", user);
  });

  socket.on("messageOne", (user) => {
    console.log(user);

    io.to(user.id).emit("peer-receive", user);
  });

  socket.on("messageGroup", (groupObj) => {
    console.log(groupObj);

    socket.to(groupObj.id).emit("group-receive", groupObj);
  });

  //disconnect when user is not active
  socket.on("disconnect", () => {
    io.emit("user-removed", users[socket.id]);

    delete users[socket.id];

    io.emit("userActiveList", Object.entries(users));
  });
});

// server
httpServer.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
