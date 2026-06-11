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
  onConfirm: () => void;
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

  // ── Header ──
  const header = document.createElement("div");
  header.innerHTML = `
    <div style="font-size:2.2rem;margin-bottom:0.5rem">💳</div>
    <h3 style="margin:0 0 0.25rem;font-size:1.25rem;color:#e8d5a3;font-weight:700">Pay via UPI</h3>
    <p style="margin:0;font-size:0.8rem;color:#666">Choose your preferred UPI app to pay</p>
  `;

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

  // ── UPI Buttons ──
  const appsLabel = document.createElement("p");
  appsLabel.innerText = "Open with:";
  Object.assign(appsLabel.style, { color: "#888", fontSize: "0.78rem", margin: "0 0 0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" });

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

  // ── Divider ──
  const divider = document.createElement("div");
  divider.innerHTML = `<div style="display:flex;align-items:center;gap:0.75rem;margin:1rem 0"><div style="flex:1;height:1px;background:rgba(201,162,39,0.15)"></div><span style="color:#555;font-size:0.72rem;white-space:nowrap">After paying, tap below</span><div style="flex:1;height:1px;background:rgba(201,162,39,0.15)"></div></div>`;

  // ── Confirm Button ──
  const confirmBtn = document.createElement("button");
  confirmBtn.innerHTML = `✅ I've Completed the Payment`;
  Object.assign(confirmBtn.style, {
    width: "100%", padding: "0.9rem", marginBottom: "0.625rem",
    borderRadius: "0.875rem", border: "none",
    background: "linear-gradient(135deg,#c9a227 0%,#a88118 100%)",
    color: "#000", fontWeight: "700", fontSize: "0.9rem", cursor: "pointer",
    transition: "transform 0.18s, box-shadow 0.18s",
    letterSpacing: "0.02em",
  });
  confirmBtn.onmouseover  = () => { confirmBtn.style.transform = "translateY(-1px)"; confirmBtn.style.boxShadow = "0 6px 20px rgba(201,162,39,0.35)"; };
  confirmBtn.onmouseleave = () => { confirmBtn.style.transform = "none"; confirmBtn.style.boxShadow = "none"; };
  confirmBtn.onclick = () => { document.body.removeChild(overlay); onConfirm(); };

  // ── Cancel Button ──
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

  // ── Assemble ──
  card.appendChild(header);
  card.appendChild(amountBox);
  card.appendChild(appsLabel);
  card.appendChild(appsGrid);
  card.appendChild(divider);
  card.appendChild(confirmBtn);
  card.appendChild(cancelBtn);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
};
