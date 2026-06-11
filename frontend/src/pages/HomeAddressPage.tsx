import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Navigation, User, Home, AlertCircle, CheckCircle2 } from "lucide-react";

interface AddressState {
  customerName: string;
  address: string;
  addressLat?: number;
  addressLng?: number;
}

export const HomeAddressPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [addressLat, setAddressLat] = useState<number | undefined>(undefined);
  const [addressLng, setAddressLng] = useState<number | undefined>(undefined);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    setLocationSuccess(false);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setAddressLat(latitude);
        setAddressLng(longitude);
        // Reverse geocode using OpenStreetMap Nominatim (free, no key needed)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json() as { display_name?: string };
          if (data.display_name) {
            setAddress(data.display_name);
          }
        } catch {
          // If reverse geocode fails, still set coordinates
        }
        setLocationSuccess(true);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          setLocationError("Location access denied. Please enable location in your browser settings or type your address manually.");
        } else {
          setLocationError("Unable to get your location. Please type your address manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !address.trim()) return;

    const state: AddressState = {
      customerName: customerName.trim(),
      address: address.trim(),
      addressLat,
      addressLng,
    };
    navigate(`/book/${serviceId}?type=home`, { state });
  };

  const mapSrc = addressLat && addressLng
    ? `https://maps.google.com/maps?q=${addressLat},${addressLng}&z=16&output=embed`
    : address.trim()
    ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
    : null;

  return (
    <div
      style={{
        background: "#0a0a0a",
        minHeight: "calc(100vh - 120px)",
        padding: "2rem 1rem",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: "580px" }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(201,162,39,0.12)",
              border: "1px solid rgba(201,162,39,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              boxShadow: "0 0 25px rgba(201,162,39,0.15)",
            }}
          >
            <Home size={26} style={{ color: "#c9a227" }} />
          </div>
          <span
            style={{
              display: "inline-block",
              padding: "0.2rem 0.75rem",
              borderRadius: "9999px",
              background: "rgba(201,162,39,0.1)",
              border: "1px solid rgba(201,162,39,0.3)",
              color: "#c9a227",
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            🏠 Home Visit
          </span>
          <h1
            style={{
              fontFamily: "'Cinzel', 'Playfair Display', serif",
              color: "#e8d5a3",
              fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
              fontWeight: 700,
              margin: "0 0 0.5rem",
            }}
          >
            Your Details & Address
          </h1>
          <p style={{ color: "#666", fontSize: "0.875rem", margin: 0 }}>
            We need your name and location to send our professional to you.
          </p>
        </div>

        {/* Form Card */}
        <div
          style={{
            background: "linear-gradient(145deg, #111 0%, #0f0e00 100%)",
            border: "1px solid rgba(201,162,39,0.25)",
            borderRadius: "1.5rem",
            padding: "2rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Customer Name */}
            <div>
              <label
                style={{ color: "#888", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}
              >
                Full Name *
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#c9a227", pointerEvents: "none" }}>
                  <User size={16} />
                </div>
                <input
                  type="text"
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  style={{
                    width: "100%",
                    padding: "0.875rem 0.875rem 0.875rem 2.75rem",
                    background: "#0a0a0a",
                    border: "1px solid rgba(201,162,39,0.2)",
                    borderRadius: "0.875rem",
                    color: "#e8d5a3",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(201,162,39,0.6)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(201,162,39,0.2)")}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label
                style={{ color: "#888", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}
              >
                Full Address *
              </label>

              {/* Use My Location Button */}
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={locating}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1rem",
                  marginBottom: "0.75rem",
                  border: "1px solid rgba(201,162,39,0.3)",
                  borderRadius: "0.75rem",
                  background: "rgba(201,162,39,0.08)",
                  color: locating ? "#666" : "#c9a227",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: locating ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { if (!locating) { e.currentTarget.style.background = "rgba(201,162,39,0.15)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(201,162,39,0.08)"; }}
              >
                <Navigation size={15} style={{ animation: locating ? "spin 1s linear infinite" : "none" }} />
                {locating ? "Getting your location..." : "📍 Use My Current Location"}
              </button>

              {/* Location Success */}
              {locationSuccess && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.875rem", borderRadius: "0.75rem", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", marginBottom: "0.75rem" }}>
                  <CheckCircle2 size={15} style={{ color: "#22c55e", flexShrink: 0 }} />
                  <span style={{ color: "#22c55e", fontSize: "0.8rem", fontWeight: 600 }}>Location detected! You can edit the address below.</span>
                </div>
              )}

              {/* Location Error */}
              {locationError && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.625rem 0.875rem", borderRadius: "0.75rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", marginBottom: "0.75rem" }}>
                  <AlertCircle size={15} style={{ color: "#ef4444", flexShrink: 0, marginTop: "2px" }} />
                  <span style={{ color: "#ef4444", fontSize: "0.8rem" }}>{locationError}</span>
                </div>
              )}

              {/* Address Textarea */}
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "0.875rem", top: "1rem", color: "#c9a227", pointerEvents: "none" }}>
                  <MapPin size={16} />
                </div>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House/Flat no., Street, Area, City, Pincode"
                  required
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.875rem 0.875rem 0.875rem 2.75rem",
                    background: "#0a0a0a",
                    border: "1px solid rgba(201,162,39,0.2)",
                    borderRadius: "0.875rem",
                    color: "#e8d5a3",
                    fontSize: "0.9rem",
                    outline: "none",
                    resize: "vertical",
                    lineHeight: 1.6,
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(201,162,39,0.6)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(201,162,39,0.2)")}
                />
              </div>
            </div>

            {/* Google Map Preview */}
            {mapSrc && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "220px" }}
                transition={{ duration: 0.4 }}
                style={{
                  borderRadius: "0.875rem",
                  overflow: "hidden",
                  border: "1px solid rgba(201,162,39,0.2)",
                  height: "220px",
                }}
              >
                <iframe
                  title="Your Location Preview"
                  src={mapSrc}
                  width="100%"
                  height="220"
                  style={{ border: "none", display: "block" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </motion.div>
            )}

            {/* Note */}
            <div
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                background: "rgba(201,162,39,0.05)",
                border: "1px solid rgba(201,162,39,0.15)",
              }}
            >
              <p style={{ color: "#888", fontSize: "0.78rem", lineHeight: 1.55, margin: 0 }}>
                📋 Our professional will call you 30 minutes before arrival to confirm the address.
                Home visits available within <strong style={{ color: "#c9a227" }}>25 km radius</strong> of Hyderabad.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!customerName.trim() || !address.trim()}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "0.875rem",
                border: "none",
                background: (!customerName.trim() || !address.trim())
                  ? "#1a1a1a"
                  : "linear-gradient(135deg, #c9a227 0%, #a88118 100%)",
                color: (!customerName.trim() || !address.trim()) ? "#444" : "#0a0a0a",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: (!customerName.trim() || !address.trim()) ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                letterSpacing: "0.03em",
              }}
              onMouseEnter={(e) => {
                if (customerName.trim() && address.trim()) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(201,162,39,0.35)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Continue to Book Slot →
            </button>
          </form>
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
