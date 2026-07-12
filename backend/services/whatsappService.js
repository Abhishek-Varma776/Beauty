/**
 * WhatsApp Service — Baileys + Custom MongoDB Auth State
 * ───────────────────────────────────────────────────────
 * No third-party mongo adapter needed — we implement auth state
 * directly using mongoose.connection.db (native MongoDB driver).
 *
 * Session is stored in the "whatsapp_auth" collection in MongoDB.
 * QR only needs scanning ONCE — reconnects automatically on restart.
 */

const {
  default: makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  initAuthCreds,
  BufferJSON,
} = require("@whiskeysockets/baileys");
const mongoose = require("mongoose");
const QRCode   = require("qrcode");
const pino     = require("pino");

// ── State ────────────────────────────────────────────────────────────────────
let sock              = null;
let currentQRBase64   = null;
let isConnected       = false;
let reconnectAttempts = 0;
const MAX_RECONNECT   = 10;

// ── Silent logger ─────────────────────────────────────────────────────────────
const logger = pino({ level: "silent" });

// ─────────────────────────────────────────────────────────────────────────────
// Custom MongoDB Auth State  (replaces mongo-baileys)
// ─────────────────────────────────────────────────────────────────────────────
async function useMongoAuthState() {
  const col = mongoose.connection.db.collection("whatsapp_auth");

  // ── Helpers ──────────────────────────────────────────────────────────────
  const encode = (val) => JSON.parse(JSON.stringify(val, BufferJSON.replacer));
  const decode = (val) => JSON.parse(JSON.stringify(val), BufferJSON.reviver);

  const readDoc = async (id) => {
    const doc = await col.findOne({ _id: id });
    return doc ? decode(doc.data) : null;
  };

  const writeDoc = async (id, data) => {
    await col.updateOne(
      { _id: id },
      { $set: { data: encode(data) } },
      { upsert: true }
    );
  };

  const deleteDoc = async (id) => col.deleteOne({ _id: id });

  // ── Load or initialise credentials ───────────────────────────────────────
  const storedCreds = await readDoc("creds");
  const creds       = storedCreds || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const result = {};
          await Promise.all(
            ids.map(async (id) => {
              const val = await readDoc(`${type}--${id}`);
              if (val !== null) result[id] = val;
            })
          );
          return result;
        },
        set: async (data) => {
          await Promise.all(
            Object.entries(data).flatMap(([type, entries]) =>
              Object.entries(entries).map(([id, value]) =>
                value != null
                  ? writeDoc(`${type}--${id}`, value)
                  : deleteDoc(`${type}--${id}`)
              )
            )
          );
        },
      },
    },
    saveCreds: async () => writeDoc("creds", creds),
  };
}

// ── Init — called once after MongoDB is ready ─────────────────────────────────
async function initWhatsApp() {
  try {
    console.log("📱 Starting WhatsApp service (Baileys)…");

    const { state, saveCreds } = await useMongoAuthState();
    const { version }          = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      logger,
      auth: {
        creds: state.creds,
        keys:  makeCacheableSignalKeyStore(state.keys, logger),
      },
      printQRInTerminal:     true,
      browser:               ["Mani Studio", "Chrome", "1.0"],
      connectTimeoutMs:      60_000,
      defaultQueryTimeoutMs: 60_000,
      keepAliveIntervalMs:   25_000,
      retryRequestDelayMs:   2_000,
      markOnlineOnConnect:   false,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQRBase64 = await QRCode.toDataURL(qr);
        isConnected     = false;
        console.log("📱 QR ready — open /api/whatsapp/qr in your browser");
      }

      if (connection === "open") {
        isConnected       = true;
        currentQRBase64   = null;
        reconnectAttempts = 0;
        console.log("✅ WhatsApp connected! Auto-notifications are live.");
      }

      if (connection === "close") {
        isConnected      = false;
        const code       = lastDisconnect?.error?.output?.statusCode;
        const loggedOut  = code === DisconnectReason.loggedOut;

        console.log(`⚡ WhatsApp disconnected (code: ${code})`);

        if (!loggedOut && reconnectAttempts < MAX_RECONNECT) {
          reconnectAttempts++;
          const delay = Math.min(5_000 * reconnectAttempts, 60_000);
          console.log(`🔄 Reconnect in ${delay / 1000}s (${reconnectAttempts}/${MAX_RECONNECT})…`);
          setTimeout(initWhatsApp, delay);
        } else if (loggedOut) {
          console.warn("⚠️  Logged out — clearing session. Scan QR again at /api/whatsapp/qr");
          try {
            await mongoose.connection.db.collection("whatsapp_auth").deleteMany({});
          } catch (_) { /* ignore */ }
          setTimeout(initWhatsApp, 5_000);
        }
      }
    });

  } catch (err) {
    console.error("❌ WhatsApp init error:", err.message);
    setTimeout(initWhatsApp, 30_000);
  }
}

// ── Send a WhatsApp message ───────────────────────────────────────────────────
async function sendWhatsAppMessage(rawPhone, message) {
  let phone = String(rawPhone).replace(/[^0-9]/g, "");
  if (phone.startsWith("0"))  phone = "91" + phone.slice(1);
  if (phone.length === 10)    phone = "91" + phone;
  const jid = phone + "@s.whatsapp.net";

  if (!sock || !isConnected) {
    console.warn(`⚠️  WhatsApp offline — message to +${phone} not sent:\n${message}\n`);
    return { success: false, reason: "not_connected" };
  }

  try {
    await sock.sendMessage(jid, { text: message });
    console.log(`✅ WhatsApp → +${phone}`);
    return { success: true };
  } catch (err) {
    console.error(`❌ WhatsApp send error → +${phone}:`, err.message);
    return { success: false, reason: err.message };
  }
}

function getQRCode()      { return currentQRBase64; }
function getIsConnected() { return isConnected; }

module.exports = { initWhatsApp, sendWhatsAppMessage, getQRCode, getIsConnected };
