import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import fs from "fs";
import path from "path";

function crmSyncPlugin(): Plugin {
  const dataDir = path.resolve(process.cwd(), "data");
  const messagesFile = path.resolve(dataDir, "shared_messages.json");
  const presenceFile = path.resolve(dataDir, "shared_presence.json");
  const callsFile = path.resolve(dataDir, "shared_calls.json");

  // Ensure data folder and files exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(messagesFile)) {
    fs.writeFileSync(messagesFile, JSON.stringify([]), "utf-8");
  }
  if (!fs.existsSync(presenceFile)) {
    fs.writeFileSync(presenceFile, JSON.stringify({}), "utf-8");
  }
  if (!fs.existsSync(callsFile)) {
    fs.writeFileSync(callsFile, JSON.stringify({}), "utf-8");
  }

  const sseClients = new Set<any>();

  function broadcast(event: string, payload: any) {
    const dataString = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    sseClients.forEach(client => {
      try {
        client.write(dataString);
      } catch {
        sseClients.delete(client);
      }
    });
  }

  function readMessages(): any[] {
    try {
      const content = fs.readFileSync(messagesFile, "utf-8");
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  function saveMessages(msgs: any[]) {
    fs.writeFileSync(messagesFile, JSON.stringify(msgs, null, 2), "utf-8");
  }

  function readActiveCalls(): Record<string, any> {
    try {
      const content = fs.readFileSync(callsFile, "utf-8");
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  function saveActiveCalls(calls: Record<string, any>) {
    fs.writeFileSync(callsFile, JSON.stringify(calls, null, 2), "utf-8");
  }

  return {
    name: "vite-plugin-crm-sync",
    configureServer(server) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url?.split("?")[0] || "";

        // 1. SSE Real-Time Event Stream across LAN
        if (url === "/api/sync/events") {
          res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Access-Control-Allow-Origin": "*",
          });
          res.write(`event: connected\ndata: ${JSON.stringify({ status: "connected" })}\n\n`);

          sseClients.add(res);
          req.on("close", () => {
            sseClients.delete(res);
          });
          return;
        }

        // 2. Messages REST API
        if (url === "/api/sync/messages") {
          if (req.method === "GET") {
            const msgs = readMessages();
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.end(JSON.stringify(msgs));
            return;
          }

          if (req.method === "POST") {
            let body = "";
            req.on("data", (chunk: any) => (body += chunk));
            req.on("end", () => {
              try {
                const parsed = JSON.parse(body);
                const current = readMessages();
                const updated = [...current, parsed];
                saveMessages(updated);
                broadcast("new_message", parsed);
                res.setHeader("Content-Type", "application/json");
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.end(JSON.stringify({ success: true, message: parsed }));
              } catch (e: any) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          }
        }

        // 3. Reaction API
        if (url === "/api/sync/messages/reaction" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk: any) => (body += chunk));
          req.on("end", () => {
            try {
              const { messageId, emoji, userName } = JSON.parse(body);
              const current = readMessages();
              const updated = current.map(msg => {
                if (msg.id !== messageId) return msg;
                const reactions = msg.reactions || [];
                const existingIdx = reactions.findIndex((r: any) => r.emoji === emoji);
                if (existingIdx > -1) {
                  const reaction = reactions[existingIdx];
                  const userIdx = reaction.users.indexOf(userName);
                  if (userIdx > -1) {
                    reaction.users.splice(userIdx, 1);
                    reaction.count -= 1;
                    if (reaction.count <= 0) reactions.splice(existingIdx, 1);
                  } else {
                    reaction.users.push(userName);
                    reaction.count += 1;
                  }
                } else {
                  reactions.push({ emoji, count: 1, users: [userName] });
                }
                return { ...msg, reactions };
              });
              saveMessages(updated);
              broadcast("messages_updated", updated);
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify({ success: true, messages: updated }));
            } catch (e: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        // 4. Pin Toggle API
        if (url === "/api/sync/messages/pin" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk: any) => (body += chunk));
          req.on("end", () => {
            try {
              const { messageId } = JSON.parse(body);
              const current = readMessages();
              const updated = current.map(msg => (msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg));
              saveMessages(updated);
              broadcast("messages_updated", updated);
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify({ success: true, messages: updated }));
            } catch (e: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        // 5. Delete Message API
        if (url === "/api/sync/messages/delete" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk: any) => (body += chunk));
          req.on("end", () => {
            try {
              const { messageId } = JSON.parse(body);
              const current = readMessages();
              const updated = current.filter(m => m.id !== messageId);
              saveMessages(updated);
              broadcast("messages_updated", updated);
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify({ success: true, messages: updated }));
            } catch (e: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        // 6. Presence API
        if (url === "/api/sync/presence") {
          if (req.method === "GET") {
            try {
              const data = JSON.parse(fs.readFileSync(presenceFile, "utf-8"));
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify(data));
            } catch {
              res.end(JSON.stringify({}));
            }
            return;
          }

          if (req.method === "POST") {
            let body = "";
            req.on("data", (chunk: any) => (body += chunk));
            req.on("end", () => {
              try {
                const { userId, presence } = JSON.parse(body);
                let current: Record<string, string> = {};
                try {
                  current = JSON.parse(fs.readFileSync(presenceFile, "utf-8"));
                } catch {}
                current[userId] = presence;
                fs.writeFileSync(presenceFile, JSON.stringify(current), "utf-8");
                broadcast("presence_updated", current);
                res.setHeader("Content-Type", "application/json");
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.end(JSON.stringify({ success: true, presence: current }));
              } catch (e: any) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          }
        }

        // =========================================================================
        // 7. REAL-TIME WEB CALLING SIGNALING ENDPOINTS (VOICE & VIDEO CALLS)
        // =========================================================================

        // Start Call / Outgoing Call Offer
        if (url === "/api/sync/call/start" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk: any) => (body += chunk));
          req.on("end", () => {
            try {
              const callSession = JSON.parse(body);
              const activeCalls = readActiveCalls();
              activeCalls[callSession.callId] = {
                ...callSession,
                status: "RINGING",
                startedAt: Date.now(),
              };
              saveActiveCalls(activeCalls);
              broadcast("call_incoming", callSession);
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify({ success: true, call: activeCalls[callSession.callId] }));
            } catch (e: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        // Answer Call / Accept Offer
        if (url === "/api/sync/call/answer" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk: any) => (body += chunk));
          req.on("end", () => {
            try {
              const { callId, answer, responderId } = JSON.parse(body);
              const activeCalls = readActiveCalls();
              if (activeCalls[callId]) {
                activeCalls[callId].status = "CONNECTED";
                activeCalls[callId].answeredAt = Date.now();
                activeCalls[callId].answer = answer;
                saveActiveCalls(activeCalls);
                broadcast("call_answered", { callId, answer, responderId, call: activeCalls[callId] });
              }
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify({ success: true, call: activeCalls[callId] }));
            } catch (e: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        // ICE Candidate Relay for WebRTC
        if (url === "/api/sync/call/ice" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk: any) => (body += chunk));
          req.on("end", () => {
            try {
              const { callId, candidate, senderId, targetId } = JSON.parse(body);
              const activeCalls = readActiveCalls();
              if (activeCalls[callId]) {
                activeCalls[callId].candidates = activeCalls[callId].candidates || [];
                activeCalls[callId].candidates.push({ candidate, senderId, targetId });
                saveActiveCalls(activeCalls);
              }
              broadcast("call_ice_candidate", { callId, candidate, senderId, targetId });
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify({ success: true }));
            } catch (e: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        // Real-Time LAN Audio Packet Stream Relay (Guaranteed 2-Way Voice Delivery)
        if (url === "/api/sync/call/audio-packet" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk: any) => (body += chunk));
          req.on("end", () => {
            try {
              const { callId, senderId, targetId, audioBase64 } = JSON.parse(body);
              broadcast("call_audio_packet", { callId, senderId, targetId, audioBase64 });
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify({ success: true }));
            } catch (e: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        // End Call / Decline Call
        if (url === "/api/sync/call/end" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk: any) => (body += chunk));
          req.on("end", () => {
            try {
              const { callId, endedBy, reason, durationSeconds } = JSON.parse(body);
              const activeCalls = readActiveCalls();
              const call = activeCalls[callId];
              delete activeCalls[callId];
              saveActiveCalls(activeCalls);

              // Auto-log call to shared messages stream
              if (call) {
                const isAudio = call.callType === "audio";
                const icon = isAudio ? "📞" : "🎥";
                const typeText = isAudio ? "Audio Call" : "Video Call";
                const durText = durationSeconds
                  ? `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`
                  : reason === "declined"
                  ? "Declined"
                  : "Missed Call";

                const logMessage = {
                  id: `msg-call-${Date.now()}`,
                  senderId: call.callerId,
                  senderName: call.callerName,
                  senderRole: call.callerRole,
                  senderAvatarBg: call.callerAvatarBg || "#2563EB",
                  recipientId: call.recipientId,
                  content: `${icon} ${typeText} · ${durText}`,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  reactions: [],
                };

                const currentMsgs = readMessages();
                saveMessages([...currentMsgs, logMessage]);
                broadcast("new_message", logMessage);
              }

              broadcast("call_ended", { callId, endedBy, reason, durationSeconds });
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify({ success: true }));
            } catch (e: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        // Get Call Status
        if (url === "/api/sync/call/status") {
          const activeCalls = readActiveCalls();
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.end(JSON.stringify(activeCalls));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), basicSsl(), crmSyncPlugin()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    cors: true,
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.indexOf("recharts") >= 0 || id.indexOf("d3-") >= 0) return "charts";
          if (id.indexOf("framer-motion") >= 0) return "motion";
          if (id.indexOf("@supabase") >= 0) return "supabase";
          if (id.indexOf("react") >= 0 || id.indexOf("scheduler") >= 0) return "react-vendor";
        },
      },
    },
  },
});
