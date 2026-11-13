import { WebSocketServer } from "ws";

const port = Number(process.env.PORT) || 4001;
const wss = new WebSocketServer({ port });

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "ready", message: "Realtime service connected" }));
});

console.log(`Realtime service running on ws://localhost:${port}`);
