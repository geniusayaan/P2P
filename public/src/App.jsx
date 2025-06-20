import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://192.168.1.7:3000"); // Replace with IP for LAN testing

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef();

  const sendMessage = () => {
    if (!input) return;
    socket.emit("send-message", { message: input });
    setMessages((prev) => [...prev, { message: input, from: "You" }]);
    setInput("");
  };

  useEffect(() => {
    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receive-message");
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>💬 Real-Time Socket Chat</h2>

      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: msg.from === "You" ? "flex-end" : "flex-start",
              backgroundColor: msg.from === "You" ? "#0084FF" : "#E5E5EA",
              color: msg.from === "You" ? "#fff" : "#000",
            }}
          >
            <span style={styles.sender}>{msg.from}</span>
            <span>{msg.message}</span>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <div style={styles.inputRow}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.button}>
          ➤
        </button>
      </div>
    </div>
  );
}

export default App;

// 🎨 Styles
const styles = {
  container: {
    maxWidth: 500,
    margin: "40px auto",
    padding: 20,
    fontFamily: "'Segoe UI', sans-serif",
    backgroundColor: "#F4F6F8",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  chatBox: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    height: "300px",
    overflowY: "auto",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: "10px",
    boxShadow: "inset 0 0 5px rgba(0,0,0,0.05)",
    marginBottom: 20,
  },
  message: {
    maxWidth: "70%",
    padding: "10px 14px",
    borderRadius: "16px",
    lineHeight: "1.4",
    fontSize: "14px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  sender: {
    fontSize: "10px",
    opacity: 0.6,
    marginBottom: -4,
  },
  inputRow: {
    display: "flex",
    gap: 10,
  },
  input: {
    flex: 1,
    padding: "12px 14px",
    fontSize: "14px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    outline: "none",
  },
  button: {
    padding: "12px 16px",
    backgroundColor: "#0078D4",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "18px",
    cursor: "pointer",
  },
};
