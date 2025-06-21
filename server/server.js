// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: "*", // Allow all for dev
  methods: ["GET", "POST"]
}));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("✅ New user connected:", socket.id);


  socket.on("send-message", (data) => {
    console.log("📨 Message from", socket.id, ":", data);

    // Broadcast to all others
    socket.broadcast.emit("receive-message", {
      message: data.message,
      from: socket.id
    });
  });

  socket.on("typing", () => {
  socket.broadcast.emit("typing",{
    typer:socket.id
  }); // don’t send to self
});


  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

server.listen(3000, () => {
// const socket = io("http://192.168.31.246:3000"); // Replace with IP for LAN testing
  console.log("🚀 Server running at http://192.168.1.7:3000");
});
