import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, Store, User, Calendar, Settings, Star, Phone, Edit2, Save, X } from "lucide-react";
import { motion } from "framer-motion";

import { ServiceCard } from "../components/services/ServiceCard";
import { useAuth } from "../context/AuthContext";
import { canCancelBooking, formatBookingDateTime } from "../lib/booking";
import { cancelBooking, fetchCustomerBookings, fetchActiveServices, seedDefaultServicesIfEmpty } from "../lib/queries";
import { seededServices } from "../lib/seed";
import type { Booking, Service } from "../types/domain";

type Tab = "services" | "bookings" | "profile" | "settings";

const statusClass: Record<string, string> = {
  pending: "status-pending",
  confirmed: "status-confirmed",
  completed: "status-completed",
  cancelled: "status-cancelled",
};

export const CustomerDashboardPage = () => {
  const { user, profile, upsertProfile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("services");
  const [dashboardServiceType, setDashboardServiceType] = useState<"home" | "salon">("home");

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editBeautyUse, setEditBeautyUse] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Feedback / Rating state ──────────────────────────────────
  const [feedbackRatings, setFeedbackRatings] = useState<Record<string, number>>({});
  const [feedbackTexts,   setFeedbackTexts]   = useState<Record<string, string>>({});
  const [feedbackHover,   setFeedbackHover]   = useState<Record<string, number>>({});
  const [feedbackDone,    setFeedbackDone]    = useState<Record<string, { rating: number; text: string }>>(() => {
    try { return JSON.parse(localStorage.getItem("manis_feedback") ?? "{}") as Record<string, { rating: number; text: string }>; }
    catch { return {}; }
  });

  const submitFeedback = (bookingId: string) => {
    const rating = feedbackRatings[bookingId] ?? 0;
    if (!rating) return;
    const text = feedbackTexts[bookingId] ?? "";
    const updated = { ...feedbackDone, [bookingId]: { rating, text } };
    setFeedbackDone(updated);
    localStorage.setItem("manis_feedback", JSON.stringify(updated));
  };

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await seedDefaultServicesIfEmpty(seededServices);
      const [serviceRows, bookingRows] = await Promise.all([fetchActiveServices(), fetchCustomerBookings(user.id)]);
      setServices(serviceRows);
      setBookings(bookingRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const startEdit = () => {
    setEditName(profile?.name ?? "");
    setEditPhone(profile?.phone ?? "");
    setEditDob((profile as any)?.dob ? new Date((profile as any).dob).toISOString().split("T")[0] : "");
    setEditGender((profile as any)?.gender ?? "");
    setEditBeautyUse((profile as any)?.beautyUse ?? "");
    setEditMode(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await upsertProfile({ name: editName, phone: editPhone, dob: editDob, gender: editGender, beautyUse: editBeautyUse });
      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save profile");
    } finally {
      setSaving(false);
    }
  };

  const onCancel = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to cancel booking");
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "services", label: "Services & Prices", icon: <Star size={16} /> },
    { id: "bookings", label: "My Bookings", icon: <Calendar size={16} /> },
    { id: "profile", label: "Profile", icon: <User size={16} /> },
    { id: "settings", label: "Settings", icon: <Settings size={16} /> },
  ];

  return (
    <div style={{ background: "#0a0a0a", minHeight: "calc(100vh - 120px)", padding: "clamp(1rem, 3vw, 2rem) 0" }}>
      <div className="section-shell">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: "linear-gradient(135deg, #111111, #0f0d00)",
            border: "1px solid rgba(201,162,39,0.25)",
            borderRadius: "1.25rem",
            padding: "1.75rem 2rem",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <span className="badge" style={{ marginBottom: "0.5rem", display: "inline-block" }}>Customer Dashboard</span>
            <h1 style={{ fontFamily: "'Cinzel', serif", color: "#e8d5a3", fontSize: "1.75rem", margin: "0.25rem 0 0.25rem" }}>
              Welcome, <span className="text-gold-gradient">{profile?.name?.split(" ")[0] ?? "Guest"}</span> 👑
            </h1>
            <p style={{ color: "#555", fontSize: "0.875rem", margin: 0 }}>
              Book appointments, track history, and manage your profile.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#c9a227", fontSize: "0.8rem" }}>
              <Phone size={14} />
              <span>{profile?.phone ?? "—"}</span>
            </div>
          </div>
        </motion.div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.75rem", padding: "0.875rem 1rem", color: "#ef4444", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "clamp(0.45rem, 1.5vw, 0.625rem) clamp(0.75rem, 2.5vw, 1.25rem)",
                borderRadius: "2rem",
                border: activeTab === tab.id ? "1px solid #c9a227" : "1px solid #2a2a2a",
                background: activeTab === tab.id ? "rgba(201,162,39,0.15)" : "transparent",
                color: activeTab === tab.id ? "#c9a227" : "#666",
                fontSize: "clamp(0.78rem, 2vw, 0.875rem)",
                fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                minHeight: "40px",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              {tab.icon}
              <span className="tab-label-text">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Services & Prices Tab ── */}
        {activeTab === "services" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", color: "#e8d5a3", fontSize: "1.4rem", margin: "0 0 1rem" }}>
                Our Services & Prices
              </h2>
              
              {/* ── Selector Cards ── */}
              <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginBottom: "2rem" }}>
                {/* Card 1: Home Service */}
                <div
                  onClick={() => setDashboardServiceType("home")}
                  style={{
                    background: dashboardServiceType === "home" ? "rgba(201,162,39,0.06)" : "#111",
                    border: dashboardServiceType === "home" ? "2px solid #c9a227" : "1px solid #1a1a1a",
                    borderRadius: "1.25rem",
                    padding: "1.5rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#c9a227" }}>
                      <Home size={18} />
                      <span style={{ fontWeight: 700, fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "0.05em" }}>🏠 HOME VISIT SERVICE</span>
                    </div>
                    <div style={{
                      width: "18px", height: "18px", borderRadius: "50%",
                      border: "2px solid #c9a227", display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {dashboardServiceType === "home" && <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#c9a227" }} />}
                    </div>
                  </div>
                  <p style={{ color: "#888", fontSize: "0.8rem", margin: 0, lineHeight: 1.5 }}>
                    Professional beauty services delivered directly to your doorstep. Save travel time, 100% safe & hygienic.
                  </p>
                </div>

                {/* Card 2: Salon Visit */}
                <div
                  onClick={() => setDashboardServiceType("salon")}
                  style={{
                    background: dashboardServiceType === "salon" ? "rgba(201,162,39,0.06)" : "#111",
                    border: dashboardServiceType === "salon" ? "2px solid #c9a227" : "1px solid #1a1a1a",
                    borderRadius: "1.25rem",
                    padding: "1.5rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#c9a227" }}>
                      <Store size={18} />
                      <span style={{ fontWeight: 700, fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "0.05em" }}>🏪 SALON VISIT</span>
                    </div>
                    <div style={{
                      width: "18px", height: "18px", borderRadius: "50%",
                      border: "2px solid #c9a227", display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {dashboardServiceType === "salon" && <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#c9a227" }} />}
                    </div>
                  </div>
                  <p style={{ color: "#888", fontSize: "0.8rem", margin: 0, lineHeight: 1.5 }}>
                    Indulge in our premium luxury makeover studio environment. Walk-ins and prior appointments welcome.
                  </p>
                </div>
              </div>
            </div>
            {loading ? (
              <p style={{ color: "#555", fontSize: "0.9rem" }}>Loading services...</p>
            ) : (
              <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 310px), 1fr))" }}>
                {services.map((service) => {
                  let activeImage = service.image_url;
                  const nameNorm = service.name.trim().toLowerCase();
                  
                  if (nameNorm === "hair color") {
                    activeImage = "http://localhost:5000/uploads/hair-color.png";
                  } else if (nameNorm === "full face threading") {
                    activeImage = "http://localhost:5000/uploads/full-face-threading.png";
                  } else if (nameNorm === "cleanup") {
                    activeImage = "http://localhost:5000/uploads/cleanup.png";
                  } else if (nameNorm === "pedicure") {
                    activeImage = "http://localhost:5000/uploads/pedicure.png";
                  } else if (nameNorm === "upper lip") {
                    activeImage = "http://localhost:5000/uploads/upper-lip.png";
                  } else if (nameNorm === "eyebrows") {
                    activeImage = "http://localhost:5000/uploads/eyebrows.png";
                  }

                  const displayService = {
                    ...service,
                    image_url: activeImage,
                    price: dashboardServiceType === "home" ? (service.price_home || service.price) : service.price
                  };
                  return (
                    <ServiceCard
                      key={service.id}
                      service={displayService}
                      action={
                        <Link
                          className="btn-primary"
                          style={{ width: "100%", textDecoration: "none", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
                          to={`/book/${service.id}?type=${dashboardServiceType}`}
                        >
                          Book Now
                        </Link>
                      }
                    />
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── My Bookings / History Tab ── */}
        {activeTab === "bookings" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h2 style={{ fontFamily: "'Cinzel', serif", color: "#e8d5a3", fontSize: "1.4rem", margin: "0 0 1.5rem" }}>
              Booking History
            </h2>
            {bookings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", border: "1px solid #1a1a1a", borderRadius: "1rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📅</div>
                <p style={{ color: "#555", fontSize: "0.9rem" }}>No bookings yet. Book your first appointment!</p>
                <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={() => setActiveTab("services")}>
                  Browse Services
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {bookings.map((booking) => {
                  const done        = feedbackDone[booking.id];
                  const rating      = feedbackRatings[booking.id] ?? 0;
                  const hover       = feedbackHover[booking.id]   ?? 0;
                  const text        = feedbackTexts[booking.id]   ?? "";
                  const isCompleted = booking.status === "completed";

                  return (
                    <article
                      key={booking.id}
                      style={{
                        background: "linear-gradient(145deg, #111111, #0f0e00)",
                        border: `1px solid ${isCompleted ? "rgba(201,162,39,0.25)" : "#1e1e1e"}`,
                        borderRadius: "1.25rem",
                        overflow: "hidden",
                        transition: "border-color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,162,39,0.4)")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = isCompleted ? "rgba(201,162,39,0.25)" : "#1e1e1e")}
                    >
                      {/* Booking info */}
                      <div style={{ padding: "1.25rem 1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                          <p style={{ color: "#e8d5a3", fontWeight: 700, margin: 0, fontFamily: "'Cinzel', serif", fontSize: "1rem" }}>
                            {booking.service?.name ?? "Service"}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span className={statusClass[booking.status] ?? "status-pending"}>
                              {booking.status}
                            </span>
                            {isCompleted && done && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "0.65rem", color: "#c9a227", fontWeight: 700, background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.3)", borderRadius: "9999px", padding: "0.15rem 0.5rem" }}>
                                ✓ Reviewed
                              </span>
                            )}
                          </div>
                        </div>
                        <p style={{ color: "#666", fontSize: "0.85rem", margin: "0 0 0.2rem" }}>
                          📅 {formatBookingDateTime(booking.starts_at, booking.ends_at)}
                        </p>
                        <p style={{ color: "#555", fontSize: "0.8rem", margin: 0 }}>
                          💳 Payment: {booking.payment_type} ({booking.payment_status})
                        </p>
                        {booking.status !== "cancelled" && canCancelBooking(booking.starts_at) && (
                          <button
                            className="btn-secondary"
                            style={{ marginTop: "1rem", fontSize: "0.8rem", padding: "0.45rem 1rem" }}
                            type="button"
                            onClick={() => void onCancel(booking.id)}
                          >
                            Cancel Booking
                          </button>
                        )}
                      </div>

                      {/* ── Feedback panel — completed bookings only ── */}
                      {isCompleted && (
                        <div style={{ borderTop: "1px solid rgba(201,162,39,0.15)", background: "rgba(201,162,39,0.025)" }}>
                          {done ? (
                            /* Already submitted — show saved review */
                            <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                              <p style={{ color: "#c9a227", fontWeight: 700, fontSize: "0.75rem", margin: 0, letterSpacing: "0.06em" }}>YOUR REVIEW</p>
                              <div style={{ display: "flex", gap: "3px" }}>
                                {[1,2,3,4,5].map((s) => (
                                  <Star key={s} size={18} style={{ color: s <= done.rating ? "#c9a227" : "#333", fill: s <= done.rating ? "#c9a227" : "none", filter: s <= done.rating ? "drop-shadow(0 0 3px rgba(201,162,39,0.5))" : "none" }} />
                                ))}
                              </div>
                              {done.text && (
                                <p style={{ color: "#888", fontStyle: "italic", fontSize: "0.875rem", margin: 0 }}>"{done.text}"</p>
                              )}
                            </div>
                          ) : (
                            /* Not yet rated — show rating form */
                            <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ fontSize: "1.1rem" }}>⭐</span>
                                <p style={{ color: "#c9a227", fontWeight: 700, fontSize: "0.75rem", margin: 0, letterSpacing: "0.06em" }}>RATE YOUR EXPERIENCE</p>
                              </div>

                              {/* Interactive star picker */}
                              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                {[1,2,3,4,5].map((s) => (
                                  <Star
                                    key={s}
                                    size={28}
                                    style={{
                                      cursor: "pointer",
                                      color: s <= (hover || rating) ? "#c9a227" : "#333",
                                      fill:  s <= (hover || rating) ? "#c9a227" : "none",
                                      filter: s <= (hover || rating) ? "drop-shadow(0 0 4px rgba(201,162,39,0.6))" : "none",
                                      transition: "all 0.15s ease",
                                    }}
                                    onClick={() => setFeedbackRatings((prev) => ({ ...prev, [booking.id]: s }))}
                                    onMouseEnter={() => setFeedbackHover((prev) => ({ ...prev, [booking.id]: s }))}
                                    onMouseLeave={() => setFeedbackHover((prev) => ({ ...prev, [booking.id]: 0 }))}
                                  />
                                ))}
                                {rating > 0 && (
                                  <span style={{ color: "#c9a227", fontSize: "0.8rem", fontWeight: 600, marginLeft: "0.25rem" }}>
                                    {["Poor", "Fair", "Good", "Great", "Excellent!"][rating - 1]}
                                  </span>
                                )}
                              </div>

                              {/* Comment textarea */}
                              <textarea
                                rows={2}
                                placeholder="Share your experience (optional)…"
                                value={text}
                                onChange={(e) => setFeedbackTexts((prev) => ({ ...prev, [booking.id]: e.target.value }))}
                                style={{
                                  width: "100%", padding: "0.75rem", background: "#0f0f0f",
                                  border: "1px solid #2a2a2a", borderRadius: "0.75rem",
                                  color: "#e8d5a3", fontSize: "0.875rem", resize: "vertical",
                                  fontFamily: "'Poppins', sans-serif", outline: "none",
                                  boxSizing: "border-box", transition: "border-color 0.2s",
                                }}
                                onFocus={(e) => (e.target.style.borderColor = "#c9a227")}
                                onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
                              />

                              <button
                                className="btn-primary"
                                style={{ alignSelf: "flex-start", fontSize: "0.825rem", padding: "0.55rem 1.25rem", opacity: rating === 0 ? 0.45 : 1 }}
                                disabled={rating === 0}
                                onClick={() => submitFeedback(booking.id)}
                              >
                                Submit Review
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}


        {/* ── Profile Tab ── */}
        {activeTab === "profile" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", color: "#e8d5a3", fontSize: "1.4rem", margin: 0 }}>
                My Profile
              </h2>
              {!editMode ? (
                <button
                  className="btn-secondary"
                  style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1.25rem" }}
                  onClick={startEdit}
                >
                  <Edit2 size={14} /> Edit Profile
                </button>
              ) : (
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    className="btn-primary"
                    style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1.25rem" }}
                    onClick={saveProfile}
                    disabled={saving}
                  >
                    <Save size={14} /> {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem" }}
                    onClick={() => setEditMode(false)}
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              )}
            </div>

            <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: "1.25rem", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                <div style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #c9a227, #8a6e1a)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#0a0a0a", fontWeight: 700, fontSize: "1.5rem",
                  border: "2px solid rgba(201,162,39,0.4)",
                }}>
                  {(profile?.name ?? "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ color: "#e8d5a3", fontWeight: 600, margin: "0 0 2px", fontSize: "1.1rem" }}>{profile?.name ?? "—"}</p>
                  <span className="badge" style={{ fontSize: "0.6rem" }}>Customer</span>
                </div>
              </div>

              {/* Fields */}
              <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                {/* Name */}
                <div>
                  <label style={{ color: "#888", fontSize: "0.75rem", display: "block", marginBottom: "0.4rem", letterSpacing: "0.05em" }}>Full Name</label>
                  {editMode ? (
                    <input className="input" value={editName} onChange={(e) => setEditName(e.target.value)} />
                  ) : (
                    <p style={{ color: "#e8d5a3", margin: 0, fontWeight: 500 }}>{profile?.name ?? "—"}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label style={{ color: "#888", fontSize: "0.75rem", display: "block", marginBottom: "0.4rem", letterSpacing: "0.05em" }}>Mobile Number</label>
                  {editMode ? (
                    <input className="input" type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                  ) : (
                    <p style={{ color: "#e8d5a3", margin: 0, fontWeight: 500 }}>{profile?.phone ?? "—"}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label style={{ color: "#888", fontSize: "0.75rem", display: "block", marginBottom: "0.4rem", letterSpacing: "0.05em" }}>Date of Birth</label>
                  {editMode ? (
                    <input className="input" type="date" value={editDob} onChange={(e) => setEditDob(e.target.value)} />
                  ) : (
                    <p style={{ color: "#e8d5a3", margin: 0, fontWeight: 500 }}>
                      {(profile as any)?.dob ? new Date((profile as any).dob).toLocaleDateString("en-IN") : "—"}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label style={{ color: "#888", fontSize: "0.75rem", display: "block", marginBottom: "0.4rem", letterSpacing: "0.05em" }}>Gender</label>
                  {editMode ? (
                    <select className="input" value={editGender} onChange={(e) => setEditGender(e.target.value)}>
                      <option value="">Prefer not to say</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="prefer_not_to_say">Other / Prefer not to say</option>
                    </select>
                  ) : (
                    <p style={{ color: "#e8d5a3", margin: 0, fontWeight: 500, textTransform: "capitalize" }}>
                      {(profile as any)?.gender || "—"}
                    </p>
                  )}
                </div>

                {/* Beauty Use */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ color: "#888", fontSize: "0.75rem", display: "block", marginBottom: "0.4rem", letterSpacing: "0.05em" }}>What do you use beauty services for?</label>
                  {editMode ? (
                    <input className="input" placeholder="e.g. Bridal, Daily care, Special events..." value={editBeautyUse} onChange={(e) => setEditBeautyUse(e.target.value)} />
                  ) : (
                    <p style={{ color: "#e8d5a3", margin: 0, fontWeight: 500 }}>{(profile as any)?.beautyUse || "—"}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Settings Tab ── */}
        {activeTab === "settings" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h2 style={{ fontFamily: "'Cinzel', serif", color: "#e8d5a3", fontSize: "1.4rem", margin: "0 0 1.5rem" }}>
              Settings
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { title: "Booking Reminders", desc: "Get notified before your appointment", key: "reminders" },
                { title: "Promotional Offers", desc: "Receive special offers and discounts", key: "offers" },
                { title: "SMS Notifications", desc: "Booking confirmations via SMS", key: "sms" },
              ].map((setting) => (
                <div
                  key={setting.key}
                  style={{
                    background: "#111",
                    border: "1px solid #1e1e1e",
                    borderRadius: "1rem",
                    padding: "1.25rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <p style={{ color: "#e8d5a3", fontWeight: 500, margin: "0 0 2px" }}>{setting.title}</p>
                    <p style={{ color: "#555", fontSize: "0.8rem", margin: 0 }}>{setting.desc}</p>
                  </div>
                  <div
                    style={{
                      width: "44px", height: "24px", borderRadius: "9999px",
                      background: "rgba(201,162,39,0.2)", border: "1px solid rgba(201,162,39,0.4)",
                      cursor: "pointer", position: "relative",
                    }}
                  >
                    <div style={{
                      width: "18px", height: "18px", borderRadius: "50%",
                      background: "#c9a227",
                      position: "absolute", top: "2px", right: "3px",
                      transition: "left 0.2s",
                    }} />
                  </div>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "1rem", marginTop: "0.5rem" }}>
                <p style={{ color: "#555", fontSize: "0.85rem" }}>
                  Account created:{" "}
                  <span style={{ color: "#888" }}>
                    {(profile as any)?.created_at ? new Date((profile as any).created_at).toLocaleDateString("en-IN") : "—"}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
