import React, { useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://192.168.1.7:3000"); // Connect to backend

const config = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

function App() {
  const [room, setRoom] = useState("");
  const [status, setStatus] = useState("Not connected");
  const [isInitiator, setIsInitiator] = useState(false);
  const fileRef = useRef();

  const pc = useRef(null);
  const dataChannel = useRef(null);

  const joinRoom = () => {
    if (!room) return alert("Please enter a room ID");

    socket.emit("join-room", room);
    setStatus(`🟡 Joined room: ${room}`);
    pc.current = new RTCPeerConnection(config);

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          room,
          candidate: event.candidate
        });
      }
    };

    // Handle incoming data channel
    pc.current.ondatachannel = (event) => {
      const channel = event.channel;

      channel.onmessage = (e) => {
        const blob = new Blob([e.data]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "received_file";
        a.click();
        setStatus("✅ File received!");
      };

      channel.onopen = () => {
        dataChannel.current = channel;
        setStatus("✅ Ready to receive file");
        console.log("📶 Data channel open (receiver)");
      };
    };

    // This tab becomes initiator
    socket.on("user-joined", async () => {
      setIsInitiator(true);
      dataChannel.current = pc.current.createDataChannel("fileChannel");

      dataChannel.current.onopen = () => {
        setStatus("✅ Ready to send file");
        console.log("📶 Data channel open (initiator)");
      };

      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);
      socket.emit("offer", { room, offer });
    });

    // Handle offer
    socket.on("offer", async (offer) => {
      await pc.current.setRemoteDescription(offer);
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      socket.emit("answer", { room, answer });
    });

    // Handle answer
    socket.on("answer", async (answer) => {
      await pc.current.setRemoteDescription(answer);
    });

    // Handle ICE candidate
    socket.on("ice-candidate", async ({ candidate }) => {
      console.log("📩 Received ICE candidate:", candidate);

      if (candidate && candidate.candidate) {
        try {
          await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("✅ ICE candidate added");
        } catch (err) {
          console.error("❌ ICE Error:", err);
        }
      }
    });
  };

  const sendFile = () => {
    const file = fileRef.current.files[0];

    if (!file) {
      alert("Select a file first!");
      return;
    }

    if (!dataChannel.current || dataChannel.current.readyState !== "open") {
      alert("Please wait... Connection not ready yet.");
      console.log("DataChannel state:", dataChannel.current?.readyState);
      return;
    }

    dataChannel.current.send(file);
    setStatus("📤 File sent!");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
    
    <p>Debug: {dataChannel.current?.readyState || "Not connected"}</p>


      <h2>📁 P2P File Share (React + Vite)</h2>

      <input
        type="text"
        placeholder="Room ID"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        style={{ marginRight: "0.5rem" }}
      />
      <button onClick={joinRoom}>Join Room</button>

      <br /><br />

      <input type="file" ref={fileRef} />
      <button
        onClick={sendFile}
        disabled={dataChannel.current?.readyState !== "open"}
      >
        Send File
      </button>

      <br /><br />
      <p>Status: {status}</p>
    </div>
  );
}

export default App;
