import { format } from "date-fns";
import { CreditCard, Banknote, Calendar, Clock, IndianRupee } from "lucide-react";
import type { PaymentType, Service, SlotOption } from "../../types/domain";

interface BookingFormProps {
  service: Service;
  selectedDate: string;
  onDateChange: (next: string) => void;
  slots: SlotOption[];
  selectedSlotIso: string;
  onSelectSlot: (slotIso: string) => void;
  paymentType: PaymentType;
  onPaymentTypeChange: (type: PaymentType) => void;
  onSubmit: () => Promise<void>;
  submitting: boolean;
  loadingSlots: boolean;
  errorMessage: string | null;
  serviceType: "home" | "salon";
}

export const BookingForm = ({
  service,
  selectedDate,
  onDateChange,
  slots,
  selectedSlotIso,
  onSelectSlot,
  paymentType,
  onPaymentTypeChange,
  onSubmit,
  submitting,
  loadingSlots,
  errorMessage,
  serviceType,
}: BookingFormProps) => {
  const currentPrice = serviceType === "home" ? (service.price_home || service.price) : service.price;

  return (
    <section
      style={{
        borderRadius: "1.5rem",
        overflow: "hidden",
        border: "1px solid rgba(201,162,39,0.25)",
        background: "linear-gradient(145deg, #111111 0%, #0f0e00 100%)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      {/* Service image hero */}
      {service.image_url && (
        <div style={{ width: "100%", height: "220px", overflow: "hidden", position: "relative" }}>
          <img
            src={service.image_url}
            alt={service.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, #111111 0%, rgba(15,14,0,0.2) 60%, transparent 100%)",
          }} />
        </div>
      )}

      <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.75rem" }}>

        {/* Header */}
        <div>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "0.2rem 0.65rem",
            borderRadius: "9999px",
            background: "rgba(201,162,39,0.1)",
            border: "1px solid rgba(201,162,39,0.3)",
            color: "#c9a227",
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}>
            ✦ Book Appointment
          </span>
          <h2 style={{
            fontFamily: "'Cinzel', 'Playfair Display', serif",
            color: "#e8d5a3",
            fontSize: "clamp(1.4rem, 3vw, 1.75rem)",
            fontWeight: 700,
            margin: "0 0 0.5rem",
          }}>
            {service.name}
          </h2>
          <p style={{ color: "#666", fontSize: "0.875rem", lineHeight: 1.6, margin: "0 0 0.75rem" }}>
            {service.description}
          </p>

          {/* Summary chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "0.3rem 0.75rem", borderRadius: "9999px", background: "#1a1500", border: "1px solid rgba(201,162,39,0.2)" }}>
              <Clock size={12} style={{ color: "#c9a227" }} />
              <span style={{ color: "#c9a227", fontSize: "0.75rem", fontWeight: 600 }}>{service.duration_min} min</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "0.3rem 0.75rem", borderRadius: "9999px", background: "#1a1500", border: "1px solid rgba(201,162,39,0.2)" }}>
              <IndianRupee size={12} style={{ color: "#c9a227" }} />
              <span style={{ color: "#c9a227", fontSize: "0.75rem", fontWeight: 600 }}>₹{currentPrice}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "0.3rem 0.75rem", borderRadius: "9999px", background: "#1a1500", border: "1px solid rgba(201,162,39,0.2)" }}>
              <span style={{ color: "#888", fontSize: "0.75rem", textTransform: "capitalize" }}>
                {serviceType === "home" ? "🏠 Home Visit" : "🏪 Salon Visit"}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, rgba(201,162,39,0.3), transparent)" }} />

        {/* Date Picker */}
        <div>
          <label
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#c9a227", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}
            htmlFor="booking-date"
          >
            <Calendar size={13} /> Choose Date
          </label>
          <input
            id="booking-date"
            type="date"
            value={selectedDate}
            min={format(new Date(), "yyyy-MM-dd")}
            onChange={(e) => onDateChange(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              background: "#0f0f0f",
              border: "1px solid #2a2a2a",
              borderRadius: "0.875rem",
              color: "#e8d5a3",
              fontSize: "0.9rem",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
              colorScheme: "dark",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#c9a227")}
            onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
          />
        </div>

        {/* Time Slots */}
        <div>
          <p style={{ color: "#c9a227", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Clock size={13} /> Available Time Slots
          </p>

          {loadingSlots ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#555", fontSize: "0.875rem" }}>
              <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid #c9a227", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
              Checking availability…
            </div>
          ) : slots.length === 0 ? (
            <div style={{
              padding: "1rem",
              borderRadius: "0.875rem",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#ef4444",
              fontSize: "0.875rem",
            }}>
              ⚠️ No slots available on this date. Please choose another date.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "0.625rem" }}>
              {slots.map((slot) => (
                <button
                  key={slot.startsAtIso}
                  type="button"
                  onClick={() => onSelectSlot(slot.startsAtIso)}
                  style={{
                    padding: "0.625rem 0.5rem",
                    borderRadius: "0.875rem",
                    border: selectedSlotIso === slot.startsAtIso
                      ? "2px solid #c9a227"
                      : "1px solid #2a2a2a",
                    background: selectedSlotIso === slot.startsAtIso
                      ? "rgba(201,162,39,0.12)"
                      : "#111",
                    color: selectedSlotIso === slot.startsAtIso ? "#c9a227" : "#666",
                    fontSize: "0.825rem",
                    fontWeight: selectedSlotIso === slot.startsAtIso ? 700 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedSlotIso !== slot.startsAtIso) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,162,39,0.4)";
                      (e.currentTarget as HTMLButtonElement).style.color = "#a88a3a";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedSlotIso !== slot.startsAtIso) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a2a";
                      (e.currentTarget as HTMLButtonElement).style.color = "#666";
                    }
                  }}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, rgba(201,162,39,0.3), transparent)" }} />

        {/* Payment Method */}
        <div>
          <p style={{ color: "#c9a227", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.875rem" }}>
            Payment Method
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {/* Online Payment */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.875rem",
                padding: "1rem 1.25rem",
                borderRadius: "1rem",
                border: paymentType === "online" ? "2px solid #c9a227" : "1px solid #2a2a2a",
                background: paymentType === "online" ? "rgba(201,162,39,0.08)" : "#0f0f0f",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <input
                type="radio"
                name="paymentType"
                checked={paymentType === "online"}
                onChange={() => onPaymentTypeChange("online")}
                style={{ accentColor: "#c9a227", width: "16px", height: "16px" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                <CreditCard size={18} style={{ color: paymentType === "online" ? "#c9a227" : "#555" }} />
                <div>
                  <p style={{ color: paymentType === "online" ? "#e8d5a3" : "#888", fontWeight: 600, margin: 0, fontSize: "0.9rem" }}>
                    Pay Online
                  </p>
                  <p style={{ color: "#555", margin: 0, fontSize: "0.72rem" }}>Secure payment via Razorpay</p>
                </div>
              </div>
              {paymentType === "online" && (
                <span style={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#0a0a0a",
                  background: "linear-gradient(135deg, #c9a227, #f0c94e)",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "9999px",
                  textTransform: "uppercase",
                }}>
                  Selected
                </span>
              )}
            </label>

            {/* Cash Payment */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.875rem",
                padding: "1rem 1.25rem",
                borderRadius: "1rem",
                border: paymentType === "cash" ? "2px solid #c9a227" : "1px solid #2a2a2a",
                background: paymentType === "cash" ? "rgba(201,162,39,0.08)" : "#0f0f0f",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <input
                type="radio"
                name="paymentType"
                checked={paymentType === "cash"}
                onChange={() => onPaymentTypeChange("cash")}
                style={{ accentColor: "#c9a227", width: "16px", height: "16px" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                <Banknote size={18} style={{ color: paymentType === "cash" ? "#c9a227" : "#555" }} />
                <div>
                  <p style={{ color: paymentType === "cash" ? "#e8d5a3" : "#888", fontWeight: 600, margin: 0, fontSize: "0.9rem" }}>
                    Cash After Service
                  </p>
                  <p style={{ color: "#555", margin: 0, fontSize: "0.72rem" }}>Pay directly to the professional</p>
                </div>
              </div>
              {paymentType === "cash" && (
                <span style={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#0a0a0a",
                  background: "linear-gradient(135deg, #c9a227, #f0c94e)",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "9999px",
                  textTransform: "uppercase",
                }}>
                  Selected
                </span>
              )}
            </label>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div style={{
            padding: "0.875rem 1rem",
            borderRadius: "0.875rem",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#ef4444",
            fontSize: "0.875rem",
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Price Summary */}
        {selectedSlotIso && (
          <div style={{
            padding: "1rem 1.25rem",
            borderRadius: "1rem",
            background: "rgba(201,162,39,0.05)",
            border: "1px solid rgba(201,162,39,0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{ color: "#888", fontSize: "0.875rem" }}>Total Amount</span>
            <span style={{ color: "#c9a227", fontSize: "1.25rem", fontWeight: 700, fontFamily: "'Cinzel', serif" }}>
              ₹{currentPrice}
            </span>
          </div>
        )}

        {/* Submit Button */}
        <button
          className="btn-primary"
          type="button"
          disabled={submitting || !selectedSlotIso}
          onClick={() => void onSubmit()}
          style={{
            width: "100%",
            fontSize: "1rem",
            padding: "0.875rem",
            opacity: submitting || !selectedSlotIso ? 0.5 : 1,
          }}
        >
          {submitting
            ? "Processing…"
            : paymentType === "online"
            ? "🔒 Proceed to Payment"
            : "✓ Confirm Cash Booking"}
        </button>

        {/* Security note */}
        {paymentType === "online" && (
          <p style={{ color: "#444", fontSize: "0.72rem", textAlign: "center", margin: 0 }}>
            🔐 Secured by Razorpay — 256-bit SSL encryption
          </p>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
};
