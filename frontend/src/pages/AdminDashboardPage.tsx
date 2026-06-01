import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, CheckCircle, AlertCircle, Home, Store } from "lucide-react";

import { BookingManager } from "../components/admin/BookingManager";
import { ServiceManager } from "../components/admin/ServiceManager";
import { SlotManager } from "../components/admin/SlotManager";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

type AdminTab = "today" | "services" | "bookings" | "slots";

interface TodayBooking {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  service_type?: string;
  payment_type?: string;
  service?: { name: string; price: number };
  customer?: { name: string; phone: string };
}

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#22c55e",
  completed: "#c9a227",
  cancelled: "#ef4444",
};

export const AdminDashboardPage = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("today");
  const [todayBookings, setTodayBookings] = useState<TodayBooking[]>([]);
  const [loadingToday, setLoadingToday] = useState(true);

  useEffect(() => {
    const fetchToday = async () => {
      setLoadingToday(true);
      try {
        const res = await API.get("/bookings/today");
        setTodayBookings((res.data as { bookings: TodayBooking[] }).bookings ?? []);
      } catch {
        setTodayBookings([]);
      } finally {
        setLoadingToday(false);
      }
    };
    void fetchToday();
  }, []);

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "today", label: "Today's Bookings", icon: <Calendar size={16} /> },
    { id: "services", label: "Services", icon: <CheckCircle size={16} /> },
    { id: "bookings", label: "All Bookings", icon: <Users size={16} /> },
    { id: "slots", label: "Time Slots", icon: <Clock size={16} /> },
  ];

  const confirmed = todayBookings.filter((b) => b.status === "confirmed").length;
  const pending = todayBookings.filter((b) => b.status === "pending").length;
  const completed = todayBookings.filter((b) => b.status === "completed").length;

  return (
    <div style={{ background: "#0a0a0a", minHeight: "calc(100vh - 120px)", padding: "2rem 0" }}>
      <div className="section-shell">
        {/* Admin Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "linear-gradient(135deg, #111111, #0f0d00)",
            border: "1px solid rgba(201,162,39,0.3)",
            borderRadius: "1.25rem",
            padding: "1.75rem 2rem",
            marginBottom: "2rem",
          }}
        >
          <span className="badge" style={{ marginBottom: "0.5rem", display: "inline-block", fontSize: "0.6rem" }}>
            ✦ ADMIN PANEL
          </span>
          <h1 style={{ fontFamily: "'Cinzel', serif", color: "#e8d5a3", fontSize: "1.75rem", margin: "0.25rem 0 0.25rem" }}>
            Welcome, <span className="text-gold-gradient">{profile?.name}</span>
          </h1>
          <p style={{ color: "#555", fontSize: "0.875rem", margin: 0 }}>
            Mani's Elite Makeover — Admin Control Panel
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginBottom: "2rem" }}>
          {[
            { label: "Today's Total", value: todayBookings.length, icon: <Calendar size={20} />, color: "#c9a227" },
            { label: "Confirmed", value: confirmed, icon: <CheckCircle size={20} />, color: "#22c55e" },
            { label: "Pending", value: pending, icon: <AlertCircle size={20} />, color: "#f59e0b" },
            { label: "Completed", value: completed, icon: <CheckCircle size={20} />, color: "#888" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "#111",
                border: `1px solid ${stat.color}30`,
                borderRadius: "1rem",
                padding: "1.25rem",
                textAlign: "center",
              }}
            >
              <div style={{ color: stat.color, display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
                {stat.icon}
              </div>
              <p style={{ color: stat.color, fontSize: "2rem", fontWeight: 700, margin: "0 0 0.25rem", fontFamily: "'Cinzel', serif" }}>
                {loadingToday ? "—" : stat.value}
              </p>
              <p style={{ color: "#555", fontSize: "0.75rem", margin: 0, letterSpacing: "0.05em" }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 1.25rem",
                borderRadius: "2rem",
                border: activeTab === tab.id ? "1px solid #c9a227" : "1px solid #2a2a2a",
                background: activeTab === tab.id ? "rgba(201,162,39,0.15)" : "transparent",
                color: activeTab === tab.id ? "#c9a227" : "#666",
                fontSize: "0.85rem",
                fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Today's Bookings */}
        {activeTab === "today" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h2 style={{ fontFamily: "'Cinzel', serif", color: "#e8d5a3", fontSize: "1.4rem", margin: "0 0 1.5rem" }}>
              Today's Schedule — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </h2>

            {loadingToday ? (
              <p style={{ color: "#555" }}>Loading today's bookings...</p>
            ) : todayBookings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", border: "1px solid #1a1a1a", borderRadius: "1rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📅</div>
                <p style={{ color: "#555" }}>No bookings scheduled for today.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {todayBookings.map((booking, index) => (
                  <motion.article
                    key={booking.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06 }}
                    style={{
                      background: "#111",
                      border: "1px solid #1e1e1e",
                      borderRadius: "1rem",
                      padding: "1.25rem",
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto",
                      gap: "1.25rem",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,162,39,0.3)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e1e1e")}
                  >
                    {/* Time */}
                    <div style={{ textAlign: "center", minWidth: "70px" }}>
                      <p style={{ color: "#c9a227", fontWeight: 700, fontSize: "1.1rem", margin: "0 0 2px", fontFamily: "'Cinzel', serif" }}>
                        {new Date(booking.starts_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <p style={{ color: "#444", fontSize: "0.7rem", margin: 0 }}>
                        {new Date(booking.ends_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    {/* Details */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                        <p style={{ color: "#e8d5a3", fontWeight: 600, margin: 0 }}>
                          {booking.service?.name ?? "—"}
                        </p>
                        {booking.service?.price && (
                          <span style={{ color: "#c9a227", fontSize: "0.8rem" }}>₹{booking.service.price}</span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                        <p style={{ color: "#888", fontSize: "0.85rem", margin: 0 }}>
                          👤 {booking.customer?.name ?? "—"} · 📞 {booking.customer?.phone ?? "—"}
                        </p>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#666", fontSize: "0.75rem" }}>
                          {booking.service_type === "salon" ? <Store size={12} /> : <Home size={12} />}
                          {booking.service_type === "salon" ? "Salon Visit" : "Home Visit"}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div style={{
                      padding: "0.3rem 0.875rem",
                      borderRadius: "9999px",
                      background: `${statusColors[booking.status] ?? "#888"}20`,
                      border: `1px solid ${statusColors[booking.status] ?? "#888"}40`,
                      color: statusColors[booking.status] ?? "#888",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}>
                      {booking.status}
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Other tabs use existing components */}
        {activeTab === "services" && <ServiceManager canEdit />}
        {activeTab === "bookings" && <BookingManager canEdit />}
        {activeTab === "slots" && <SlotManager canEdit />}
      </div>
    </div>
  );
};
