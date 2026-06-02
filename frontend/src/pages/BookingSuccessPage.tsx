import { format, parseISO } from "date-fns";
import { CheckCircle2, Calendar, Clock, CreditCard, Home, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import { fetchBookingById } from "../lib/queries";
import type { Booking } from "../types/domain";

export const BookingSuccessPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    const load = async () => {
      setLoading(true);
      try {
        setBooking(await fetchBookingById(bookingId));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [bookingId]);

  return (
    <div style={{ background: "#0a0a0a", minHeight: "calc(100vh - 120px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      {/* Gold glow background */}
      <div style={{ position: "fixed", top: "30%", left: "50%", transform: "translateX(-50%)", width: "400px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "linear-gradient(145deg, #111111 0%, #0f0e00 100%)",
          border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: "1.5rem",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(34,197,94,0.06)",
        }}
      >
        {/* Success Header */}
        <div style={{
          background: "linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(201,162,39,0.05) 100%)",
          borderBottom: "1px solid rgba(34,197,94,0.2)",
          padding: "2.5rem 2rem",
          textAlign: "center",
        }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "rgba(34,197,94,0.15)",
              border: "2px solid rgba(34,197,94,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.25rem",
              boxShadow: "0 0 30px rgba(34,197,94,0.2)",
            }}
          >
            <CheckCircle2 size={36} style={{ color: "#22c55e" }} />
          </motion.div>

          <span style={{
            display: "inline-block",
            padding: "0.2rem 0.75rem",
            borderRadius: "9999px",
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.3)",
            color: "#22c55e",
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}>
            ✓ Booking Confirmed
          </span>

          <h1 style={{
            fontFamily: "'Cinzel', 'Playfair Display', serif",
            color: "#e8d5a3",
            fontSize: "clamp(1.5rem, 4vw, 2rem)",
            fontWeight: 700,
            margin: "0 0 0.5rem",
          }}>
            You're All Set! 🎉
          </h1>
          <p style={{ color: "#666", fontSize: "0.875rem", margin: 0 }}>
            Your appointment has been booked successfully.
          </p>
        </div>

        {/* Booking Details */}
        <div style={{ padding: "1.75rem 2rem" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#555", fontSize: "0.875rem" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid #c9a227", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 0.75rem" }} />
              Loading booking summary…
            </div>
          ) : booking ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {/* Service name */}
              <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                <p style={{ fontFamily: "'Cinzel', serif", color: "#c9a227", fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
                  {booking.service?.name ?? "Service"}
                </p>
              </div>

              {/* Detail rows */}
              {[
                {
                  icon: <Calendar size={15} style={{ color: "#c9a227" }} />,
                  label: "Date",
                  value: format(parseISO(booking.starts_at), "dd MMMM yyyy"),
                },
                {
                  icon: <Clock size={15} style={{ color: "#c9a227" }} />,
                  label: "Time",
                  value: `${format(parseISO(booking.starts_at), "hh:mm a")} – ${format(parseISO(booking.ends_at), "hh:mm a")}`,
                },
                {
                  icon: booking.service_type === "salon"
                    ? <Store size={15} style={{ color: "#c9a227" }} />
                    : <Home size={15} style={{ color: "#c9a227" }} />,
                  label: "Type",
                  value: booking.service_type === "salon" ? "Salon Visit" : "Home Visit",
                },
                {
                  icon: <CreditCard size={15} style={{ color: "#c9a227" }} />,
                  label: "Payment",
                  value: `${booking.payment_type === "online" ? "Online (Razorpay)" : "Cash After Service"} — ${booking.payment_status}`,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.875rem",
                    padding: "0.875rem 1rem",
                    borderRadius: "0.875rem",
                    background: "#0f0f0f",
                    border: "1px solid #1e1e1e",
                  }}
                >
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: "rgba(201,162,39,0.1)",
                    border: "1px solid rgba(201,162,39,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {row.icon}
                  </div>
                  <div>
                    <p style={{ color: "#555", fontSize: "0.7rem", margin: "0 0 2px", letterSpacing: "0.06em", textTransform: "uppercase" }}>{row.label}</p>
                    <p style={{ color: "#e8d5a3", fontWeight: 600, margin: 0, fontSize: "0.875rem" }}>{row.value}</p>
                  </div>
                </div>
              ))}

              {/* Status chip */}
              <div style={{ textAlign: "center", marginTop: "0.25rem" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  padding: "0.3rem 0.875rem", borderRadius: "9999px",
                  background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                  color: "#22c55e", fontSize: "0.75rem", fontWeight: 600,
                }}>
                  ✓ Status: {booking.status}
                </span>
              </div>
            </div>
          ) : (
            <p style={{ color: "#666", textAlign: "center", fontSize: "0.875rem" }}>Booking details unavailable.</p>
          )}

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: "0.875rem", marginTop: "1.75rem", flexWrap: "wrap" }}>
            <Link
              to="/dashboard"
              className="btn-primary"
              style={{ flex: 1, textDecoration: "none", textAlign: "center", justifyContent: "center" }}
            >
              My Bookings
            </Link>
            <Link
              to="/"
              className="btn-secondary"
              style={{ flex: 1, textDecoration: "none", textAlign: "center", justifyContent: "center" }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
