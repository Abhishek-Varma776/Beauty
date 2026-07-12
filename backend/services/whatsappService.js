/**
 * WhatsApp Service using @whiskeysockets/baileys
 * ─────────────────────────────────────────────
 * - Connects to WhatsApp Web via Baileys (lightweight, no browser needed)
 * - Stores auth session in MongoDB via mongo-baileys
 *   → QR only needs scanning ONCE — auto-reconnects on restart
 * - Exports sendWhatsAppMessage(phone, message) for use in controllers
 */

const {
  default: makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");
const { useMongoDBAuthState } = require("mongo-baileys");
const mongoose = require("mongoose");
const QRCode   = require("qrcode");
const pino     = require("pino");

// ── State ────────────────────────────────────────────────────────────────────
let sock              = null;
let currentQRBase64   = null;   // base64 PNG of QR shown at /api/whatsapp/qr
let isConnected       = false;
let reconnectAttempts = 0;
const MAX_RECONNECT   = 10;

// ── Silent logger (keeps Render logs clean) ──────────────────────────────────
const logger = pino({ level: "silent" });

// ── Init — called once after MongoDB is ready ─────────────────────────────────
async function initWhatsApp() {
  try {
    console.log("📱 Starting WhatsApp service (Baileys)…");

    // Access the native MongoDB collection via Mongoose connection
    const collection = mongoose.connection.db.collection("whatsapp_auth");
    const { state, saveCreds } = await useMongoDBAuthState(collection);

    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      logger,
      auth: {
        creds: state.creds,
        keys:  makeCacheableSignalKeyStore(state.keys, logger),
      },
      printQRInTerminal:     true,   // backup: QR printed to Render logs
      browser:               ["Mani Studio Bot", "Chrome", "1.0"],
      connectTimeoutMs:      60_000,
      defaultQueryTimeoutMs: 60_000,
      keepAliveIntervalMs:   25_000,
      retryRequestDelayMs:   2_000,
      markOnlineOnConnect:   false,  // reduce bot-detection risk
    });

    // Save session credentials every time they change
    sock.ev.on("creds.update", saveCreds);

    // Handle connection state changes
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        // New QR generated — convert to base64 PNG for the web page
        currentQRBase64 = await QRCode.toDataURL(qr);
        isConnected     = false;
        console.log("📱 QR ready — open /api/whatsapp/qr in your browser to scan");
      }

      if (connection === "open") {
        isConnected       = true;
        currentQRBase64   = null;
        reconnectAttempts = 0;
        console.log("✅ WhatsApp connected! Booking notifications are live.");
      }

      if (connection === "close") {
        isConnected = false;
        const code  = lastDisconnect?.error?.output?.statusCode;
        const loggedOut = code === DisconnectReason.loggedOut;

        console.log(`⚡ WhatsApp closed (code: ${code}). Logged out: ${loggedOut}`);

        if (!loggedOut && reconnectAttempts < MAX_RECONNECT) {
          reconnectAttempts++;
          const delay = Math.min(5_000 * reconnectAttempts, 60_000);
          console.log(`🔄 Reconnecting in ${delay / 1000}s (${reconnectAttempts}/${MAX_RECONNECT})…`);
          setTimeout(initWhatsApp, delay);
        } else if (loggedOut) {
          console.warn("⚠️  WhatsApp logged out. Clearing session — please scan QR again.");
          try {
            await mongoose.connection.db.collection("whatsapp_auth").deleteMany({});
          } catch (_) { /* ignore */ }
          // Restart fresh after 5s
          setTimeout(initWhatsApp, 5_000);
        }
      }
    });

  } catch (err) {
    console.error("❌ WhatsApp init error:", err.message);
    setTimeout(initWhatsApp, 30_000); // retry in 30s
  }
}

// ── Send a WhatsApp message ───────────────────────────────────────────────────
async function sendWhatsAppMessage(rawPhone, message) {
  // Normalise: keep only digits, add India code if needed
  let phone = String(rawPhone).replace(/[^0-9]/g, "");
  if (phone.startsWith("0"))   phone = "91" + phone.slice(1);
  if (phone.length === 10)     phone = "91" + phone;
  const jid = phone + "@s.whatsapp.net";

  if (!sock || !isConnected) {
    console.warn(`⚠️  WhatsApp offline — message to +${phone} logged (will not be sent):`);
    console.log(`📲 [QUEUED LOG]\n${message}\n`);
    return { success: false, reason: "not_connected" };
  }

  try {
    await sock.sendMessage(jid, { text: message });
    console.log(`✅ WhatsApp sent → +${phone}`);
    return { success: true };
  } catch (err) {
    console.error(`❌ WhatsApp send failed → +${phone}:`, err.message);
    return { success: false, reason: err.message };
  }
}

// ── Getters for the QR route ─────────────────────────────────────────────────
function getQRCode()      { return currentQRBase64; }
function getIsConnected() { return isConnected; }

module.exports = { initWhatsApp, sendWhatsAppMessage, getQRCode, getIsConnected };
