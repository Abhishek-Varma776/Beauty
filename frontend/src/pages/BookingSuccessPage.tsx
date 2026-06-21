import { CheckCircle2, Calendar, Clock, CreditCard, Home, Store, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import { fetchBookingById, verifyPaymentAndConfirm } from "../lib/queries";
import type { Booking } from "../types/domain";

export const BookingSuccessPage = () => {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;

    const txn = searchParams.get("txn");

    const load = async () => {
      setLoading(true);

      // If the user was redirected back from PhonePe with a txn param, verify payment first
      if (txn) {
        setVerifying(true);
        try {
          const confirmed = await verifyPaymentAndConfirm({
            bookingId,
            razorpayOrderId: txn,
          });
          setBooking(confirmed);
        } catch (err) {
          setVerifyError(err instanceof Error ? err.message : "Payment verification failed.");
          // Still load booking details even if verify fails
          try {
            setBooking(await fetchBookingById(bookingId));
          } catch {
            // ignore secondary error
          }
        } finally {
          setVerifying(false);
        }
      } else {
        // Normal success page load (cash or simulated PhonePe)
        try {
          setBooking(await fetchBookingById(bookingId));
        } catch {
          // ignore
        }
      }

      setLoading(false);
    };

    void load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  return (
    <div style={{ background: "#0a0a0a", minHeight: "calc(100vh - 120px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      {/* Glow background */}
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
          {/* Verifying spinner */}
          {verifying && (
            <div style={{ textAlign: "center", padding: "1.5rem", color: "#c9a227", fontSize: "0.875rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
              <Loader2 size={28} style={{ animation: "spin 0.8s linear infinite", color: "#c9a227" }} />
              <span>Verifying your Razorpay payment…</span>
            </div>
          )}

          {/* Verify error */}
          {verifyError && !verifying && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.875rem 1rem", borderRadius: "0.75rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", marginBottom: "1rem" }}>
              <AlertCircle size={18} style={{ color: "#ef4444", flexShrink: 0, marginTop: "1px" }} />
              <div>
                <p style={{ color: "#ef4444", fontWeight: 600, margin: "0 0 2px", fontSize: "0.85rem" }}>Payment Verification Issue</p>
                <p style={{ color: "#aaa", margin: 0, fontSize: "0.78rem" }}>{verifyError}</p>
              </div>
            </div>
          )}

          {loading && !verifying ? (
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
                  value: (() => {
                    const d = new Date(booking.starts_at);
                    const day = d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit" });
                    const month = d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", month: "long" });
                    const year = d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", year: "numeric" });
                    return `${day} ${month} ${year}`;
                  })(),
                },
                {
                  icon: <Clock size={15} style={{ color: "#c9a227" }} />,
                  label: "Time",
                  value: (() => {
                    const d = new Date(booking.starts_at);
                    const start = d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true });
                    const endD  = new Date(booking.ends_at);
                    const end   = endD.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true });
                    return `${start} – ${end}`;
                  })(),
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
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginTop: "1.75rem" }}>

            {/* Admin auto-notified info chip */}
            {booking && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                padding: "0.625rem 1rem", borderRadius: "0.875rem",
                background: "rgba(37,211,102,0.07)", border: "1px solid rgba(37,211,102,0.25)",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25d366" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.123 1.528 5.855L.057 23.882l6.204-1.448A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.804 9.804 0 0 1-5.003-1.373l-.359-.213-3.681.859.898-3.583-.234-.372A9.79 9.79 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182 17.43 2.182 21.818 6.57 21.818 12c0 5.43-4.388 9.818-9.818 9.818z"/>
                </svg>
                <span style={{ color: "#22c55e", fontSize: "0.78rem", fontWeight: 600 }}>
                  Admin has been notified automatically via WhatsApp
                </span>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap" }}>
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
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
