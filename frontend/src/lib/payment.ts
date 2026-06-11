// ─── Salon Location (update these to your actual salon coordinates) ───────────
export const SALON_LAT = 17.3244416;
export const SALON_LNG = 78.5809408;
export const SALON_NAME = "Mani's Elite Makeover Studio";
export const SALON_UPI_ID = import.meta.env.VITE_UPI_ID || "9640449896@pthdfc";

// ─── Haversine Distance Formula (in km) ──────────────────────────────────────
export const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── Distance Surcharge Logic ─────────────────────────────────────────────────
export const getDeliveryCharge = (distanceKm: number): number => {
  if (distanceKm < 4) return 0;
  if (distanceKm <= 10) return 49;
  return 99;
};

export const getDeliveryLabel = (distanceKm: number): string => {
  if (distanceKm < 4) return "Free (within 4 km)";
  if (distanceKm <= 10) return "₹49 (4–10 km range)";
  return "₹99 (beyond 10 km)";
};

// ─── UPI Deep Link Generator ──────────────────────────────────────────────────
interface UPIParams {
  amount: number; // in rupees (not paise)
  description: string;
}

export const buildUPILink = (app: "gpay" | "phonepe" | "paytm" | "generic", params: UPIParams): string => {
  const base = SALON_UPI_ID; // Do NOT encode the UPI ID! Keeps the raw '@' sign for proper app parsing.
  const name = encodeURIComponent(SALON_NAME);
  const amt = params.amount.toFixed(2);

  const query = `pa=${base}&pn=${name}&am=${amt}&cu=INR`;

  const ua = navigator.userAgent.toLowerCase();
  const isIos = ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod");
  const isAndroid = ua.includes("android");

  if (isIos) {
    switch (app) {
      case "gpay":    return `gpay://upi/pay?${query}`;
      case "phonepe": return `phonepe://upi/pay?${query}`;
      case "paytm":   return `paytmmp://pay?${query}`;
      default:        return `upi://pay?${query}`;
    }
  } else if (isAndroid) {
    switch (app) {
      case "gpay":    return `intent://pay?${query}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
      case "phonepe": return `intent://pay?${query}#Intent;scheme=upi;package=com.phonepe.app;end`;
      case "paytm":   return `intent://pay?${query}#Intent;scheme=upi;package=net.one97.paytm;end`;
      default:        return `upi://pay?${query}`;
    }
  } else {
    // Desktop / Fallback
    switch (app) {
      case "gpay":    return `upi://pay?${query}`;
      case "phonepe": return `upi://pay?${query}`;
      case "paytm":   return `upi://pay?${query}`;
      default:        return `upi://pay?${query}`;
    }
  }
};

// ─── UPI Checkout Modal ───────────────────────────────────────────────────────
export const openUPICheckout = ({
  amount,
  description,
  onConfirm,
  onCancel,
}: {
  amount: number;       // rupees
  description: string;
  onConfirm: (upiTxnId: string | null, screenshotFile: File | null) => void;
  onCancel: () => void;
}): void => {
  // ── Overlay ──
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed", inset: "0", zIndex: "999999",
    backgroundColor: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "system-ui, -apple-system, sans-serif", padding: "1rem",
  });

  // ── Card ──
  const card = document.createElement("div");
  Object.assign(card.style, {
    width: "100%", maxWidth: "420px",
    background: "linear-gradient(145deg,#111,#0f0e00)",
    border: "1px solid rgba(201,162,39,0.35)",
    borderRadius: "1.5rem",
    boxShadow: "0 24px 64px rgba(0,0,0,0.9), 0 0 40px rgba(201,162,39,0.06)",
    padding: "2rem", color: "#e8d5a3", textAlign: "center",
    maxHeight: "90vh", overflowY: "auto",
  });
  overlay.appendChild(card);

  let selectedScreenshotFile: File | null = null;

  const renderStep = (step: 1 | 2) => {
    card.innerHTML = "";

    if (step === 1) {
      // ── Step 1: App Selection ──
      const header = document.createElement("div");
      header.innerHTML = `
        <div style="font-size:2.2rem;margin-bottom:0.5rem">💳</div>
        <h3 style="margin:0 0 0.25rem;font-size:1.25rem;color:#e8d5a3;font-weight:700">Pay via UPI</h3>
        <p style="margin:0;font-size:0.8rem;color:#666">Choose your preferred UPI app to pay</p>
      `;
      card.appendChild(header);

      // ── Amount Pill ──
      const amountBox = document.createElement("div");
      Object.assign(amountBox.style, {
        margin: "1.25rem 0", padding: "0.875rem 1rem",
        background: "rgba(201,162,39,0.08)", border: "1px dashed rgba(201,162,39,0.3)",
        borderRadius: "0.875rem",
      });
      amountBox.innerHTML = `
        <div style="font-size:0.7rem;color:#888;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.25rem">Amount to Pay</div>
        <div style="font-size:1.75rem;font-weight:700;color:#c9a227">₹${amount.toFixed(2)}</div>
        <div style="font-size:0.75rem;color:#555;margin-top:0.2rem">${description}</div>
      `;
      card.appendChild(amountBox);

      // ── UPI App Buttons Grid ──
      const appsLabel = document.createElement("p");
      appsLabel.innerText = "Open with:";
      Object.assign(appsLabel.style, { color: "#888", fontSize: "0.78rem", margin: "0 0 0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" });
      card.appendChild(appsLabel);

      const appsGrid = document.createElement("div");
      Object.assign(appsGrid.style, { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem", marginBottom: "1rem" });

      const upiApps: { id: "gpay" | "phonepe" | "paytm" | "generic"; label: string; iconHtml: string; color: string }[] = [
        {
          id: "gpay",
          label: "Google Pay",
          iconHtml: `
            <svg width="55" height="22" viewBox="0 0 41 17" xmlns="http://www.w3.org/2000/svg" style="display:block;margin-bottom:0.8rem;margin-top:0.4rem">
              <g fill="none" fill-rule="evenodd">
                <path d="M19.526 2.635v4.083h2.518c.6 0 1.096-.202 1.488-.605.403-.402.605-.882.605-1.437 0-.544-.202-1.018-.605-1.422-.392-.413-.888-.62-1.488-.62h-2.518zm0 5.52v4.736h-1.504V1.198h3.99c1.013 0 1.873.337 2.582 1.012.72.675 1.08 1.497 1.08 2.466 0 .991-.36 1.819-1.08 2.482-.697.665-1.559.996-2.583.996h-2.485v.001zm7.668 2.287c0 .392.166.718.499.98.332.26.722.391 1.168.391.633 0 1.962-.234 1.692-.701.497-.469.744-1.019.744-1.65-.469-.37-1.123-.555-1.962-.555-.61 0-1.12.148-1.528.442-.409.294-.613.657-.613 1.093m1.946-5.815c1.112 0 1.989.297 2.633.89.642.594.964 1.408.964 2.442v4.932h-1.439v-1.11h-.065c-.622.914-1.45 1.372-2.486 1.372-.882 0-1.621-.262-2.215-.784-.594-.523-.891-1.176-.891-1.96 0-.828.313-1.486.94-1.976s1.463-.735 2.51-.735c.892 0 1.629.163 2.206.49v-.344c0-.522-.207-.966-.621-1.33a2.132 2.132 0 0 0-1.455-.547c-.84 0-1.504.353-1.995 1.062l-1.324-.834c.73-1.045 1.81-1.568 3.238-1.568m11.853.262l-5.02 11.53H34.42l1.864-4.034-3.302-7.496h1.635l2.387 5.749h.032l2.322-5.75z" fill="#FFF"/>
                <path d="M13.448 7.134c0-.473-.04-.93-.116-1.366H6.988v2.588h3.634a3.11 3.11 0 0 1-1.344 2.042v1.68h2.169c1.27-1.17 2.001-2.9 2.001-4.944" fill="#4285F4"/>
                <path d="M6.988 13.7c1.816 0 3.344-.595 4.459-1.621l-2.169-1.681c-.603.406-1.38.643-2.29.643-1.754 0-3.244-1.182-3.776-2.774H.978v1.731a6.728 6.728 0 0 0 6.01 3.703" fill="#34A853"/>
                <path d="M3.212 8.267a4.034 4.034 0 0 1 0-2.572V3.964H.978A6.678 6.678 0 0 0 .261 6.98c0 1.085.26 2.11.717 3.017l2.234-1.731z" fill="#FABB05"/>
                <path d="M6.988 2.921c.992 0 1.88.34 2.58 1.008v.001l1.92-1.918C10.324.928 8.804.262 6.989.262a6.728 6.728 0 0 0-6.01 3.702l2.234 1.731c.532-1.592 2.022-2.774 3.776-2.774" fill="#E94235"/>
              </g>
            </svg>
          `,
          color: "#4285F4"
        },
        {
          id: "phonepe",
          label: "PhonePe",
          iconHtml: `
            <svg viewBox="0 0 24 24" width="30" height="30" xmlns="http://www.w3.org/2000/svg" style="display:block;margin-bottom:0.4rem">
              <circle cx="12" cy="12" r="11" fill="#ffffff"/>
              <path d="M10.206 9.941h2.949v4.692c-.402.201-.938.268-1.34.268-1.072 0-1.609-.536-1.609-1.743V9.941zm13.47 4.816c-1.523 6.449-7.985 10.442-14.433 8.919C2.794 22.154-1.199 15.691.324 9.243 1.847 2.794 8.309-1.199 14.757.324c6.449 1.523 10.442 7.985 8.919 14.433zm-6.231-5.888a.887.887 0 0 0-.871-.871h-1.609l-3.686-4.222c-.335-.402-.871-.536-1.407-.402l-1.274.401c-.201.067-.268.335-.134.469l4.021 3.82H6.386c-.201 0-.335.134-.335.335v.67c0 .469.402.871.871.871h.938v3.217c0 2.413 1.273 3.82 3.418 3.82.67 0 1.206-.067 1.877-.335v2.145c0 .603.469 1.072 1.072 1.072h.938a.432.432 0 0 0 .402-.402V9.874h1.542c.201 0 .335-.134.335-.335v-.67z" fill="#5F259F" fill-rule="evenodd" clip-rule="evenodd"/>
            </svg>
          `,
          color: "#5F259F"
        },
        {
          id: "paytm",
          label: "Paytm",
          iconHtml: `
            <svg viewBox="0 0 100 100" width="30" height="30" xmlns="http://www.w3.org/2000/svg" style="display:block;margin-bottom:0.4rem">
              <path d="M 50 0 A 50 50 0 0 1 100 50 L 0 50 A 50 50 0 0 1 50 0" fill="#00baf2"/>
              <path d="M 100 50 A 50 50 0 0 1 50 100 A 50 50 0 0 1 0 50 L 100 50" fill="#0f265c"/>
              <circle cx="50" cy="50" r="34" fill="#fff"/>
              <text x="50" y="57" font-size="16" font-weight="900" fill="#00baf2" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">pay<tspan fill="#0f265c">tm</tspan></text>
            </svg>
          `,
          color: "#00baf2"
        },
        {
          id: "generic",
          label: "Any UPI App",
          iconHtml: `
            <svg viewBox="0 0 24 24" fill="none" stroke="#c9a227" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28" style="display:block;margin-bottom:0.4rem">
              <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          `,
          color: "#c9a227"
        }
      ];

      upiApps.forEach(({ id, label, iconHtml, color }) => {
        const btn = document.createElement("button");
        btn.innerHTML = `${iconHtml}<span style="font-size:0.82rem;font-weight:600">${label}</span>`;
        Object.assign(btn.style, {
          padding: "0.875rem 0.5rem",
          border: `1px solid ${color}33`,
          borderRadius: "0.875rem",
          background: `${color}11`,
          color: "#e8d5a3",
          cursor: "pointer",
          transition: "all 0.18s",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        });
        btn.onmouseover  = () => { btn.style.background = `${color}22`; btn.style.borderColor = `${color}88`; };
        btn.onmouseleave = () => { btn.style.background = `${color}11`; btn.style.borderColor = `${color}33`; };
        btn.onclick = () => {
          const link = buildUPILink(id, { amount, description });
          window.location.href = link;
        };
        appsGrid.appendChild(btn);
      });
      card.appendChild(appsGrid);

      // Divider
      const divider = document.createElement("div");
      divider.innerHTML = `<div style="display:flex;align-items:center;gap:0.75rem;margin:1rem 0"><div style="flex:1;height:1px;background:rgba(201,162,39,0.15)"></div><span style="color:#555;font-size:0.72rem;white-space:nowrap">After paying, tap below</span><div style="flex:1;height:1px;background:rgba(201,162,39,0.15)"></div></div>`;
      card.appendChild(divider);

      // Confirm button to proceed to Step 2
      const nextBtn = document.createElement("button");
      nextBtn.innerHTML = `✅ I've Completed the Payment`;
      Object.assign(nextBtn.style, {
        width: "100%", padding: "0.9rem", marginBottom: "0.625rem",
        borderRadius: "0.875rem", border: "none",
        background: "linear-gradient(135deg,#c9a227 0%,#a88118 100%)",
        color: "#000", fontWeight: "700", fontSize: "0.9rem", cursor: "pointer",
        transition: "transform 0.18s, box-shadow 0.18s",
        letterSpacing: "0.02em",
      });
      nextBtn.onmouseover  = () => { nextBtn.style.transform = "translateY(-1px)"; nextBtn.style.boxShadow = "0 6px 20px rgba(201,162,39,0.35)"; };
      nextBtn.onmouseleave = () => { nextBtn.style.transform = "none"; nextBtn.style.boxShadow = "none"; };
      nextBtn.onclick = () => renderStep(2);
      card.appendChild(nextBtn);

      // Cancel button
      const cancelBtn = document.createElement("button");
      cancelBtn.innerText = "Cancel";
      Object.assign(cancelBtn.style, {
        width: "100%", padding: "0.75rem",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.875rem",
        background: "transparent", color: "#555", cursor: "pointer",
        fontSize: "0.85rem", transition: "color 0.18s, border-color 0.18s",
      });
      cancelBtn.onmouseover  = () => { cancelBtn.style.color = "#ef4444"; cancelBtn.style.borderColor = "rgba(239,68,68,0.35)"; };
      cancelBtn.onmouseleave = () => { cancelBtn.style.color = "#555"; cancelBtn.style.borderColor = "rgba(255,255,255,0.08)"; };
      cancelBtn.onclick = () => { document.body.removeChild(overlay); onCancel(); };
      card.appendChild(cancelBtn);
    } else {
      // ── Step 2: Proof Submission ──
      const header = document.createElement("div");
      header.innerHTML = `
        <div style="font-size:2.2rem;margin-bottom:0.5rem">📤</div>
        <h3 style="margin:0 0 0.25rem;font-size:1.25rem;color:#e8d5a3;font-weight:700">Payment Verification</h3>
        <p style="margin:0 0 1.25rem;font-size:0.8rem;color:#666">Please provide at least one proof of payment below:</p>
      `;
      card.appendChild(header);

      // ── Transaction ID Input ──
      const inputLabel = document.createElement("label");
      inputLabel.innerText = "UPI Transaction ID / Ref No.";
      Object.assign(inputLabel.style, { display: "block", color: "#c9a227", fontSize: "0.78rem", fontWeight: 700, textAlign: "left", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" });
      card.appendChild(inputLabel);

      const txnInput = document.createElement("input");
      txnInput.type = "text";
      txnInput.placeholder = "e.g. 12-digit transaction ID";
      Object.assign(txnInput.style, {
        background: "#161616", border: "1px solid rgba(201,162,39,0.25)",
        borderRadius: "0.875rem", padding: "0.85rem 1rem", color: "#e8d5a3",
        width: "100%", outline: "none", boxSizing: "border-box",
        fontSize: "0.95rem", marginBottom: "1.25rem", transition: "border-color 0.2s",
      });
      txnInput.onfocus = () => { txnInput.style.borderColor = "#c9a227"; };
      txnInput.onblur = () => { txnInput.style.borderColor = "rgba(201,162,39,0.25)"; };
      card.appendChild(txnInput);

      // ── Screenshot Upload ──
      const uploadLabel = document.createElement("label");
      uploadLabel.innerText = "OR Upload Screenshot";
      Object.assign(uploadLabel.style, { display: "block", color: "#c9a227", fontSize: "0.78rem", fontWeight: 700, textAlign: "left", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" });
      card.appendChild(uploadLabel);

      const fileBox = document.createElement("div");
      Object.assign(fileBox.style, {
        border: "1px dashed rgba(201,162,39,0.3)", borderRadius: "0.875rem",
        padding: "1.25rem", background: "rgba(201,162,39,0.02)", cursor: "pointer",
        position: "relative", marginBottom: "1.25rem", transition: "border-color 0.2s, background 0.2s",
        textAlign: "center",
      });
      fileBox.innerHTML = `
        <div style="font-size:1.5rem;margin-bottom:0.25rem">📸</div>
        <span id="file-label-text" style="font-size:0.8rem;color:#888">Click to choose image screenshot</span>
        <input type="file" id="screenshot-input" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer" />
      `;
      card.appendChild(fileBox);

      const fileInput = fileBox.querySelector("#screenshot-input") as HTMLInputElement;
      const fileLabel = fileBox.querySelector("#file-label-text") as HTMLSpanElement;

      fileInput.onchange = () => {
        if (fileInput.files && fileInput.files[0]) {
          selectedScreenshotFile = fileInput.files[0];
          fileLabel.innerText = `📄 ${selectedScreenshotFile.name}`;
          fileLabel.style.color = "#c9a227";
          fileBox.style.borderColor = "#c9a227";
          fileBox.style.background = "rgba(201,162,39,0.06)";
        }
      };

      // ── Error Message ──
      const errorMsg = document.createElement("div");
      Object.assign(errorMsg.style, {
        color: "#ef4444", fontSize: "0.8rem", marginBottom: "1rem", display: "none",
        fontWeight: "500", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
        padding: "0.6rem", borderRadius: "0.625rem",
      });
      card.appendChild(errorMsg);

      // ── Submit Proof Button ──
      const submitBtn = document.createElement("button");
      submitBtn.innerHTML = `Submit Payment Verification`;
      Object.assign(submitBtn.style, {
        width: "100%", padding: "0.9rem", marginBottom: "0.625rem",
        borderRadius: "0.875rem", border: "none",
        background: "linear-gradient(135deg,#c9a227 0%,#a88118 100%)",
        color: "#000", fontWeight: "700", fontSize: "0.9rem", cursor: "pointer",
        transition: "transform 0.18s, box-shadow 0.18s",
        letterSpacing: "0.02em",
      });
      submitBtn.onmouseover  = () => { submitBtn.style.transform = "translateY(-1px)"; submitBtn.style.boxShadow = "0 6px 20px rgba(201,162,39,0.35)"; };
      submitBtn.onmouseleave = () => { submitBtn.style.transform = "none"; submitBtn.style.boxShadow = "none"; };
      submitBtn.onclick = () => {
        const txnIdVal = txnInput.value.trim();
        if (!txnIdVal && !selectedScreenshotFile) {
          errorMsg.innerText = "⚠️ Please enter a Transaction ID or upload a screenshot.";
          errorMsg.style.display = "block";
          return;
        }

        document.body.removeChild(overlay);
        onConfirm(txnIdVal || null, selectedScreenshotFile);
      };
      card.appendChild(submitBtn);

      // ── Back Button ──
      const backBtn = document.createElement("button");
      backBtn.innerText = "← Back to Apps";
      Object.assign(backBtn.style, {
        width: "100%", padding: "0.75rem",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.875rem",
        background: "transparent", color: "#555", cursor: "pointer",
        fontSize: "0.85rem", transition: "color 0.18s, border-color 0.18s",
      });
      backBtn.onmouseover  = () => { backBtn.style.color = "#c9a227"; backBtn.style.borderColor = "rgba(201,162,39,0.35)"; };
      backBtn.onmouseleave = () => { backBtn.style.color = "#555"; backBtn.style.borderColor = "rgba(255,255,255,0.08)"; };
      backBtn.onclick = () => renderStep(1);
      card.appendChild(backBtn);
    }
  };

  renderStep(1);
  document.body.appendChild(overlay);
};
