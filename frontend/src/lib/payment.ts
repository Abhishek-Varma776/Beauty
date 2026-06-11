// ─── Salon Location (update these to your actual salon coordinates) ───────────
export const SALON_LAT = 17.3616;
export const SALON_LNG = 78.4747;
export const SALON_NAME = "Mani's Elite Makeover Studio";
export const SALON_UPI_ID = import.meta.env.VITE_UPI_ID || "manisEliteMakeover@ybl";

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
  const base = encodeURIComponent(SALON_UPI_ID);
  const name = encodeURIComponent(SALON_NAME);
  const amt = params.amount.toFixed(2);
  const note = encodeURIComponent(params.description);

  const query = `pa=${base}&pn=${name}&am=${amt}&cu=INR&tn=${note}`;

  switch (app) {
    case "gpay":    return `tez://upi/pay?${query}`;
    case "phonepe": return `phonepe://pay?${query}`;
    case "paytm":   return `paytmmp://pay?${query}`;
    default:        return `upi://pay?${query}`;
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

      const upiApps: { id: "gpay" | "phonepe" | "paytm" | "generic"; label: string; emoji: string; color: string }[] = [
        { id: "gpay",    label: "Google Pay",  emoji: "🟢", color: "#34a853" },
        { id: "phonepe", label: "PhonePe",     emoji: "🟣", color: "#5f259f" },
        { id: "paytm",   label: "Paytm",       emoji: "🔵", color: "#00baf2" },
        { id: "generic", label: "Any UPI App", emoji: "🏦", color: "#c9a227" },
      ];

      upiApps.forEach(({ id, label, emoji, color }) => {
        const btn = document.createElement("button");
        btn.innerHTML = `<span style="font-size:1.3rem;display:block;margin-bottom:0.3rem">${emoji}</span><span style="font-size:0.82rem;font-weight:600">${label}</span>`;
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
