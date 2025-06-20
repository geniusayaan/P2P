const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: "http://192.168.1.7:5173",  // your frontend dev IP
  methods: ["GET", "POST"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.static("public"));

const io = new Server(server, {
  cors: corsOptions
});

io.on("connection", (socket) => {
  console.log("📡 New user connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`👤 ${socket.id} joined room: ${roomId}`);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  socket.on("offer", (data) => {
    socket.to(data.room).emit("offer", data.offer);
  });

  socket.on("answer", (data) => {
    socket.to(data.room).emit("answer", data.answer);
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.room).emit("ice-candidate", { candidate: data.candidate });
  });
});

server.listen(3000, "0.0.0.0", () => {
  console.log("🚀 Server running at http://192.168.1.7:3000");
});
