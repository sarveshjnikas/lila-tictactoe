import { Client } from "@heroiclabs/nakama-js";

const client = new Client("defaultkey", "localhost", "7350", false);

let session = null;
let socket = null;

export async function authenticateAndConnect() {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", deviceId);
    }
  
    session = await client.authenticateDevice(deviceId, true);
    session.userId = session.user_id;
    console.log("Session created, userId:", session.userId);
  
    socket = client.createSocket(false, false);
    
    socket.ondisconnect = (evt) => {
      console.log("Socket disconnected:", evt);
    };
  
    socket.onerror = (evt) => {
      console.error("Socket error:", evt);
    };
  
    await socket.connect(session, true);
    console.log("Socket connected!");
  
    return session;
  }
  export async function setDisplayName(name) {
    try {
      await client.updateAccount(session, { displayName: name });
      console.log("Display name set:", name);
    } catch(e) {
      console.error("setDisplayName failed:", e);
      throw e;
    }
  }

  async function ensureConnected() {
    if (!socket || !session) {
      await authenticateAndConnect();
    }
    try {
      await socket.connect(session, true);
    } catch(e) {
      // already connected, ignore
    }
  }
  
  export async function findMatch() {
    await ensureConnected();
    const rpc = await client.rpc(session, "find_match", {});
    const payload = typeof rpc.payload === 'string' ? JSON.parse(rpc.payload) : rpc.payload;
    return payload;
  }
  
  export async function listMatches() {
    await ensureConnected();
    const rpc = await client.rpc(session, "list_matches", {});
    const payload = typeof rpc.payload === 'string' ? JSON.parse(rpc.payload) : rpc.payload;
    return payload;
  }
  
  export async function joinMatch(matchId) {
    await ensureConnected();
    return await socket.joinMatch(matchId);
  }
export function sendMove(matchId, index) {
  socket.sendMatchState(matchId, 2, JSON.stringify({ index }));
}

// export function onMatchData(callback) {
//   socket.onmatchdata = callback;
// }

export function getSession() {
  return session;
}

export function getSocket() {
  return socket;
}