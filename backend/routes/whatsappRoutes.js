const express = require("express");
const router = express.Router();
const { getQRCode, getIsConnected } = require("../services/whatsappService");

/**
 * GET /api/whatsapp/qr
 * Shows a beautiful HTML page with the QR code to scan.
 * After scanning, this page auto-refreshes to show "Connected ✅"
 */
router.get("/qr", (req, res) => {
  const connected = getIsConnected();
  const qr = getQRCode();

  // Connected — show success page
  if (connected) {
    return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>WhatsApp Connected ✅</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #0a0a0a;
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #111;
      border: 1px solid rgba(34,197,94,0.3);
      border-radius: 1.5rem;
      padding: 3rem 2.5rem;
      text-align: center;
      max-width: 440px;
      width: 90%;
      box-shadow: 0 0 60px rgba(34,197,94,0.08);
    }
    .icon { font-size: 4rem; margin-bottom: 1rem; }
    h1 { color: #22c55e; font-size: 1.8rem; margin-bottom: 0.5rem; }
    p { color: #888; line-height: 1.6; margin-top: 0.5rem; }
    .badge {
      display: inline-block;
      background: rgba(34,197,94,0.1);
      border: 1px solid rgba(34,197,94,0.3);
      color: #22c55e;
      border-radius: 9999px;
      padding: 0.3rem 1rem;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      margin-bottom: 1.5rem;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <div class="badge">WHATSAPP CONNECTED</div>
    <h1>You're All Set!</h1>
    <p>WhatsApp is connected and running.<br/>
    Booking notifications will now be sent<br/>
    automatically to admin and customers.</p>
    <p style="margin-top:1.5rem; font-size:0.8rem; color:#555;">
      This window can be closed safely.
    </p>
  </div>
</body>
</html>`);
  }

  // QR not yet generated — show loading
  if (!qr) {
    return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="refresh" content="5"/>
  <title>WhatsApp — Starting…</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #0a0a0a;
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #111;
      border: 1px solid rgba(201,162,39,0.3);
      border-radius: 1.5rem;
      padding: 3rem 2.5rem;
      text-align: center;
      max-width: 440px;
      width: 90%;
    }
    .spinner {
      width: 50px; height: 50px;
      border: 4px solid #222;
      border-top-color: #c9a227;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1.5rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h1 { color: #c9a227; font-size: 1.5rem; }
    p { color: #888; margin-top: 0.75rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h1>Starting WhatsApp…</h1>
    <p>QR code is being generated.<br/>This page refreshes automatically.</p>
  </div>
</body>
</html>`);
  }

  // QR ready — show scan page with auto-refresh every 25s (QR expires every 20s)
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Scan WhatsApp QR</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #0a0a0a;
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #111;
      border: 1px solid rgba(201,162,39,0.3);
      border-radius: 1.5rem;
      padding: 2.5rem;
      text-align: center;
      max-width: 480px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .brand { color: #c9a227; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.75rem; }
    h1 { color: #e8d5a3; font-size: 1.5rem; margin-bottom: 0.4rem; }
    .sub { color: #888; font-size: 0.875rem; margin-bottom: 1.75rem; line-height: 1.6; }
    .qr-wrap {
      background: #fff;
      border-radius: 1rem;
      padding: 1.25rem;
      display: inline-block;
      margin-bottom: 1.75rem;
      box-shadow: 0 0 40px rgba(201,162,39,0.1);
    }
    .qr-wrap img { display: block; width: 240px; height: 240px; }
    .steps { text-align: left; margin: 0 auto 1.5rem; max-width: 320px; }
    .step {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .num {
      background: rgba(201,162,39,0.15);
      border: 1px solid rgba(201,162,39,0.3);
      color: #c9a227;
      border-radius: 50%;
      width: 24px; height: 24px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 700;
      flex-shrink: 0;
    }
    .step p { color: #aaa; font-size: 0.82rem; line-height: 1.5; margin: 0; padding-top: 2px; }
    .step strong { color: #e8d5a3; }
    .timer { color: #555; font-size: 0.75rem; margin-top: 0.25rem; }
    .refresh-btn {
      background: rgba(201,162,39,0.1);
      border: 1px solid rgba(201,162,39,0.3);
      color: #c9a227;
      padding: 0.6rem 1.5rem;
      border-radius: 9999px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .countdown { color: #c9a227; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <p class="brand">✦ Mani's Elite Makeover Studio</p>
    <h1>Scan to Connect WhatsApp</h1>
    <p class="sub">Scan this QR code with WhatsApp to enable<br/>automatic booking notifications</p>

    <div class="qr-wrap">
      <img src="${qr}" alt="WhatsApp QR Code"/>
    </div>

    <div class="steps">
      <div class="step">
        <div class="num">1</div>
        <p>Open <strong>WhatsApp</strong> on your phone</p>
      </div>
      <div class="step">
        <div class="num">2</div>
        <p>Tap <strong>⋮ Menu → Linked Devices → Link a Device</strong></p>
      </div>
      <div class="step">
        <div class="num">3</div>
        <p>Point your camera at the QR code above</p>
      </div>
      <div class="step">
        <div class="num">4</div>
        <p>Done! This page will show ✅ when connected</p>
      </div>
    </div>

    <p class="timer">QR refreshes in <span class="countdown" id="cd">25</span>s</p>
  </div>

  <script>
    // Countdown + auto-refresh
    let t = 25;
    const cd = document.getElementById('cd');
    const iv = setInterval(() => {
      t--;
      cd.textContent = t;
      if (t <= 0) { clearInterval(iv); location.reload(); }
    }, 1000);
    // Also poll every 5s for connection status
    setInterval(() => {
      fetch('/api/whatsapp/status')
        .then(r => r.json())
        .then(d => { if (d.connected) location.reload(); })
        .catch(() => {});
    }, 5000);
  </script>
</body>
</html>`);
});

/**
 * GET /api/whatsapp/status
 * JSON status endpoint — polled by the QR page to auto-redirect when connected
 */
router.get("/status", (req, res) => {
  res.json({
    connected: getIsConnected(),
    hasQR: !!getQRCode(),
  });
});

module.exports = router;
