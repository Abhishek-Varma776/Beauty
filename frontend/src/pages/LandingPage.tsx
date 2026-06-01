import { motion } from "framer-motion";
import { ArrowRight, Home, Store, Phone, Clock, CheckCircle, Star, MapPin, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ServiceCard } from "../components/services/ServiceCard";
import { useAuth } from "../context/AuthContext";
import { fetchActiveServices } from "../lib/queries";
import { customerReviews } from "../lib/seed";
import type { Service } from "../types/domain";

export const LandingPage = () => {
  const { profile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const serviceRows = await fetchActiveServices();
        setServices(serviceRows.slice(0, 6));
      } catch {
        // silent
      }
    };
    void load();
  }, []);

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>

      {/* ── Hero Section ── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          paddingTop: "4rem",
          paddingBottom: "5rem",
          background: "linear-gradient(135deg, #0a0a0a 0%, #0f0d00 40%, #0a0a0a 100%)",
        }}
      >
        {/* Gold orbs background */}
        <div style={{ position: "absolute", top: "-80px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,162,39,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", right: "-60px", width: "250px", height: "250px", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,162,39,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: "400px", height: "200px", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(201,162,39,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className="section-shell" style={{ display: "grid", gap: "3rem", alignItems: "center", gridTemplateColumns: "1fr" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto" }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}
            >
              <span className="badge" style={{ fontSize: "0.65rem", letterSpacing: "0.15em" }}>
                ✦ PREMIUM BEAUTY STUDIO ✦
              </span>
            </motion.div>

            <h1
              style={{
                fontFamily: "'Cinzel', 'Playfair Display', serif",
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                fontWeight: 700,
                lineHeight: 1.15,
                margin: "0 0 0.5rem",
                color: "#e8d5a3",
              }}
            >
              Mani's Elite
            </h1>
            <h1
              className="text-gold-gradient"
              style={{
                fontFamily: "'Cinzel', 'Playfair Display', serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 700,
                lineHeight: 1.2,
                margin: "0 0 1.5rem",
              }}
            >
              Makeover
            </h1>

            <p style={{ color: "#888", fontSize: "1.1rem", maxWidth: "540px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
              Experience world-class beauty services — at your home or visit our luxury studio.
              Professional experts, premium products, flawless results.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", marginBottom: "2.5rem" }}>
              <Link
                className="btn-primary"
                to={profile ? (profile.role === "admin" ? "/admin" : "/dashboard") : "/auth"}
                style={{ fontSize: "0.95rem", gap: "0.5rem", display: "flex", alignItems: "center" }}
              >
                <Home size={18} /> Book Home Service <ArrowRight size={16} />
              </Link>
              <Link
                className="btn-secondary"
                to={profile ? (profile.role === "admin" ? "/admin" : "/dashboard") : "/auth"}
                style={{ fontSize: "0.95rem", gap: "0.5rem", display: "flex", alignItems: "center" }}
              >
                <Store size={18} /> Visit Our Studio
              </Link>
            </div>

            {/* Trust badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "center" }}>
              {[
                { icon: <CheckCircle size={16} />, text: "Verified Professionals" },
                { icon: <CheckCircle size={16} />, text: "100% Hygienic" },
                { icon: <CheckCircle size={16} />, text: "Premium Products" },
              ].map((item) => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "6px", color: "#c9a227", fontSize: "0.85rem" }}>
                  {item.icon} {item.text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Gold Divider ── */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #c9a227, transparent)" }} />

      {/* ── Services / Products Section ── */}
      <section id="services" style={{ padding: "5rem 0", background: "#0a0a0a" }}>
        <div className="section-shell" style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          <div style={{ textAlign: "center" }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="badge" style={{ marginBottom: "1rem", display: "inline-block" }}>Our Products & Services</span>
              <h2
                className="text-gold-gradient"
                style={{
                  fontFamily: "'Cinzel', 'Playfair Display', serif",
                  fontSize: "clamp(1.8rem, 4vw, 3rem)",
                  fontWeight: 700,
                  margin: "0 0 0.75rem",
                }}
              >
                Premium Beauty Services
              </h2>
              <p style={{ color: "#666", fontSize: "1rem", maxWidth: "500px", margin: "0 auto" }}>
                Luxury care delivered to you or enjoy at our studio
              </p>
            </motion.div>
          </div>

          {!profile ? (
            /* Teaser for non-logged-in users */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                textAlign: "center",
                padding: "3rem 2rem",
                border: "1px solid rgba(201,162,39,0.25)",
                borderRadius: "1.5rem",
                background: "rgba(201,162,39,0.03)",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👑</div>
              <h3 style={{ color: "#c9a227", fontFamily: "'Cinzel', serif", fontSize: "1.5rem", marginBottom: "0.75rem" }}>
                Sign In to View Prices & Book
              </h3>
              <p style={{ color: "#666", marginBottom: "2rem" }}>
                Create a free account to explore all our services, prices, and book your appointment instantly.
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link className="btn-primary" to="/auth/signup">Create Account</Link>
                <Link className="btn-secondary" to="/auth/signin">Sign In</Link>
              </div>
            </motion.div>
          ) : (
            <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {services.map((service, index) => {
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

                const displayService = { ...service, image_url: activeImage };

                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                  >
                    <ServiceCard
                      service={displayService}
                      action={
                        <Link
                          className="btn-primary"
                          style={{ width: "100%", textDecoration: "none" }}
                          to={`/book/${service.id}`}
                        >
                          Book Now
                        </Link>
                      }
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Gold Divider ── */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,162,39,0.4), transparent)" }} />

      {/* ── Why Choose Us ── */}
      <section style={{ padding: "5rem 0", background: "#0d0d0d" }}>
        <div className="section-shell">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 className="text-gold-gradient" style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)", fontWeight: 700 }}>
              Why Mani's Elite?
            </h2>
          </div>
          <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
            {[
              {
                icon: <Home size={28} style={{ color: "#c9a227" }} />,
                tag: "CONVENIENT",
                title: "Home Service",
                desc: "Our professionals come to you with all equipment and premium products — zero travel stress.",
              },
              {
                icon: <Store size={28} style={{ color: "#c9a227" }} />,
                tag: "LUXURY",
                title: "Salon Visit",
                desc: "Visit our premium studio and enjoy a full luxury salon experience in a relaxing environment.",
              },
              {
                icon: <Star size={28} style={{ color: "#c9a227" }} />,
                tag: "PREMIUM",
                title: "Elite Experience",
                desc: "Bridal makeup, advanced skincare, and professional hair styling with top-tier techniques.",
              },
            ].map((card) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="panel"
                style={{ cursor: "default" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  {card.icon}
                  <span className="badge" style={{ fontSize: "0.6rem" }}>{card.tag}</span>
                </div>
                <h3 style={{ fontFamily: "'Cinzel', serif", color: "#e8d5a3", fontSize: "1.25rem", margin: "0 0 0.5rem" }}>
                  {card.title}
                </h3>
                <p style={{ color: "#666", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
                  {card.desc}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section style={{ padding: "5rem 0", background: "#0a0a0a" }}>
        <div className="section-shell">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 className="text-gold-gradient" style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)", fontWeight: 700, margin: "0 0 0.5rem" }}>
              Client Stories
            </h2>
            <p style={{ color: "#666" }}>Real experiences from our valued customers</p>
          </div>
          <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {customerReviews.map((review: { author: string; text: string }, index: number) => (
              <motion.article
                key={review.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="panel"
              >
                <div style={{ display: "flex", gap: "2px", marginBottom: "1rem" }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} style={{ color: "#c9a227", fill: "#c9a227" }} />
                  ))}
                </div>
                <p style={{ color: "#aaa", fontStyle: "italic", lineHeight: 1.6, margin: "0 0 1rem" }}>
                  "{review.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    width: "40px", height: "40px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #c9a227, #8a6e1a)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#0a0a0a", fontWeight: 700,
                  }}>
                    {review.author.charAt(0)}
                  </div>
                  <p style={{ color: "#e8d5a3", fontWeight: 600, margin: 0 }}>{review.author}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gold Divider ── */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #c9a227, transparent)" }} />

      {/* ── Google Maps ── */}
      <section id="location" style={{ padding: "5rem 0", background: "#0d0d0d" }}>
        <div className="section-shell">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span className="badge" style={{ marginBottom: "1rem", display: "inline-block" }}>Find Us</span>
            <h2 className="text-gold-gradient" style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)", fontWeight: 700, margin: "0 0 0.5rem" }}>
              Visit Our Studio
            </h2>
            <p style={{ color: "#666" }}>
              <MapPin size={14} style={{ display: "inline", marginRight: "6px", color: "#c9a227" }} />
              Home visits available across the city • Salon open daily 10 AM – 8 PM
            </p>
            <a
              href="https://www.google.com/maps/search/mani's+elite+makeover+hyderabad+telangana/@17.3151943,78.5773701,20z?entry=ttu&g_ep=EgoyMDI2MDUyNy4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                color: "#c9a227",
                fontSize: "0.85rem",
                fontWeight: 600,
                textDecoration: "none",
                marginTop: "0.75rem",
                transition: "color 0.2s"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffe57a")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#c9a227")}
            >
              Get Directions on Google Maps ↗
            </a>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              borderRadius: "1.25rem",
              overflow: "hidden",
              border: "1px solid rgba(201,162,39,0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <iframe
              title="Mani's Elite Makeover Location"
              src="https://maps.google.com/maps?q=17.3151943,78.5773701&t=&z=20&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="380"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section
        style={{
          padding: "4rem 0",
          background: "linear-gradient(135deg, #0f0d00 0%, #1a1400 50%, #0f0d00 100%)",
          borderTop: "1px solid rgba(201,162,39,0.2)",
          borderBottom: "1px solid rgba(201,162,39,0.2)",
        }}
      >
        <div className="section-shell" style={{ textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", color: "#e8d5a3", fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)", marginBottom: "0.75rem" }}>
            Ready to Look <span className="text-gold-gradient">Stunning?</span>
          </h2>
          <p style={{ color: "#888", fontSize: "1rem", maxWidth: "480px", margin: "0 auto 2rem" }}>
            Join hundreds of satisfied clients experiencing premium beauty services at home or in our studio.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
            <Link
              className="btn-primary"
              to={profile ? (profile.role === "admin" ? "/admin" : "/dashboard") : "/auth"}
              style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              Get Started Now <Sparkles size={16} />
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", color: "#555" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.85rem" }}>
                <Phone size={14} /> 24/7 Support
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.85rem" }}>
                <Clock size={14} /> Quick Booking
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
