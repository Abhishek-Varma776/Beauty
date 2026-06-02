import { motion } from "framer-motion";
import { ArrowRight, Home, Store, Phone, Clock, CheckCircle, Star, MapPin, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ServiceCard } from "../components/services/ServiceCard";
import { useAuth } from "../context/AuthContext";
import { fetchActiveServices } from "../lib/queries";
import type { Service } from "../types/domain";

export const LandingPage = () => {
  const { profile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);

  // Scroll to top when landing page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const serviceRows = await fetchActiveServices();
        // Curate 8 featured services to fill the grid beautifully
        const featuredNames = [
          "eyebrows",
          "cleanup",
          "pedicure",
          "manicure",
          "facial",
          "hair cut",
          "hair color",
          "bridal makeup"
        ];
        const featured = serviceRows.filter(s => featuredNames.includes(s.name.trim().toLowerCase()));
        
        // Sort to match the curated order
        featured.sort((a, b) => {
          return featuredNames.indexOf(a.name.trim().toLowerCase()) - featuredNames.indexOf(b.name.trim().toLowerCase());
        });

        if (featured.length === 0) {
          setServices(serviceRows.slice(0, 8));
        } else {
          setServices(featured);
        }
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
          paddingTop: "clamp(2.5rem, 6vw, 6rem)",
          paddingBottom: "clamp(3rem, 7vw, 7rem)",
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
            <div className="cta-group" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", marginBottom: "2.5rem" }}>
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

      {/* ── How It Works ── */}
      <section style={{ padding: "clamp(2.5rem, 6vw, 5rem) 0", background: "#0d0d0d" }}>
        <div className="section-shell">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: "clamp(1.5rem, 4vw, 3rem)" }}
          >
            <span className="badge" style={{ marginBottom: "1rem", display: "inline-block" }}>Simple Process</span>
            <h2
              className="text-gold-gradient"
              style={{ fontFamily: "'Cinzel', 'Playfair Display', serif", fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)", fontWeight: 700, margin: "0 0 0.5rem" }}
            >
              How It Works
            </h2>
            <p style={{ color: "#555", fontSize: "clamp(0.85rem, 2vw, 0.95rem)" }}>
              Book in 3 easy steps — beauty delivered your way
            </p>
          </motion.div>

          <div style={{ display: "grid", gap: "clamp(1rem, 3vw, 1.5rem)", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", position: "relative" }}>
            {/* Connecting line — desktop only */}
            <div style={{ position: "absolute", top: "2.5rem", left: "calc(16.66% + 0.75rem)", right: "calc(16.66% + 0.75rem)", height: "1px", background: "linear-gradient(90deg, #c9a227, rgba(201,162,39,0.3), #c9a227)", zIndex: 0 }} aria-hidden="true" />

            {[
              { step: "01", emoji: "📱", title: "Create Account",   desc: "Sign up free with your mobile number in under 30 seconds." },
              { step: "02", emoji: "📅", title: "Choose & Book",    desc: "Pick your service, date & time. Home visit or salon visit." },
              { step: "03", emoji: "✨", title: "Get Beautified",   desc: "Our expert arrives on time. Relax and enjoy a premium experience." },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                style={{ textAlign: "center", position: "relative", zIndex: 1 }}
              >
                {/* Step circle */}
                <div style={{
                  width: "clamp(52px, 8vw, 68px)",
                  height: "clamp(52px, 8vw, 68px)",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #1a1500, #0f0d00)",
                  border: "2px solid #c9a227",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 1rem",
                  boxShadow: "0 0 20px rgba(201,162,39,0.2), inset 0 1px 0 rgba(201,162,39,0.1)",
                  position: "relative",
                }}>
                  <span style={{ fontSize: "clamp(1.3rem, 3vw, 1.8rem)" }}>{item.emoji}</span>
                  {/* Step number badge */}
                  <span style={{
                    position: "absolute", top: "-8px", right: "-8px",
                    width: "22px", height: "22px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #c9a227, #f0c94e)",
                    color: "#0a0a0a", fontWeight: 800, fontSize: "0.62rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{item.step}</span>
                </div>

                <h3 style={{
                  fontFamily: "'Cinzel', serif", color: "#e8d5a3",
                  fontSize: "clamp(0.95rem, 2.2vw, 1.1rem)", fontWeight: 700,
                  margin: "0 0 0.5rem",
                }}>
                  {item.title}
                </h3>
                <p style={{ color: "#555", fontSize: "clamp(0.78rem, 1.8vw, 0.875rem)", lineHeight: 1.65, margin: 0, maxWidth: "200px", marginInline: "auto" }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gold Divider ── */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,162,39,0.4), transparent)" }} />

      {/* ── Services / Products Section ── */}
      <section id="services" style={{ padding: "clamp(2.5rem, 6vw, 6rem) 0", background: "#0a0a0a" }}>
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

          {profile ? (
            <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 310px), 1fr))" }}>
              {services.map((service, index) => {
                let activeImage = service.image_url;
                const nameNorm = service.name.trim().toLowerCase();

                if (nameNorm === "hair color") {
                  activeImage = "/images/services/hair-color.png";
                } else if (nameNorm === "full face threading") {
                  activeImage = "/images/services/full-face-threading.png";
                } else if (nameNorm === "cleanup") {
                  activeImage = "/images/services/cleanup.png";
                } else if (nameNorm === "pedicure") {
                  activeImage = "/images/services/pedicure.png";
                } else if (nameNorm === "upper lip") {
                  activeImage = "/images/services/upper-lip.png";
                } else if (nameNorm === "eyebrows") {
                  activeImage = "/images/services/eyebrows.png";
                } else if (nameNorm === "manicure") {
                  activeImage = "/images/services/manicure.png";
                } else if (nameNorm === "saree draping") {
                  activeImage = "/images/services/saree-draping.png";
                } else if (nameNorm === "bridal makeup") {
                  activeImage = "/images/services/bridal-makeup.png";
                } else if (nameNorm === "facial") {
                  activeImage = "/images/services/facial.png";
                } else if (nameNorm === "hair cut") {
                  activeImage = "/images/services/hair-cut.png";
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
          ) : null}

          {!profile && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                marginTop: "3rem",
                textAlign: "center",
                padding: "2.5rem 2rem",
                border: "1px solid rgba(201,162,39,0.25)",
                borderRadius: "1.5rem",
                background: "rgba(201,162,39,0.02)",
              }}
            >
              <h3 style={{ color: "#c9a227", fontFamily: "'Cinzel', serif", fontSize: "1.35rem", marginBottom: "0.5rem" }}>
                Ready to Experience Premium Salon Care?
              </h3>
              <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                Create a free account to book your appointments instantly, save history, and receive special offers.
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link className="btn-primary" to="/auth/signup" style={{ fontSize: "0.875rem", padding: "0.55rem 1.5rem" }}>Create Account</Link>
                <Link className="btn-secondary" to="/auth/signin" style={{ fontSize: "0.875rem", padding: "0.55rem 1.5rem" }}>Sign In</Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Gold Divider ── */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,162,39,0.4), transparent)" }} />

      {/* ── Why Choose Us ── */}
      <section style={{ padding: "clamp(2.5rem, 6vw, 6rem) 0", background: "#0d0d0d" }}>
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

      {/* ── Client Stories ── */}
      <section style={{ padding: "clamp(2.5rem, 6vw, 6rem) 0", background: "linear-gradient(180deg, #0a0a0a 0%, #0d0b00 60%, #0a0a0a 100%)" }}>
        <div className="section-shell">

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "clamp(2rem, 4vw, 3.5rem)" }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="badge" style={{ marginBottom: "1rem", display: "inline-block" }}>⭐ Real Reviews</span>
              <h2
                className="text-gold-gradient"
                style={{ fontFamily: "'Cinzel', 'Playfair Display', serif", fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)", fontWeight: 700, margin: "0 0 0.75rem" }}
              >
                Client Stories
              </h2>
              <p style={{ color: "#666", fontSize: "clamp(0.85rem, 2vw, 1rem)", maxWidth: "400px", margin: "0 auto" }}>
                Real experiences from our valued customers
              </p>
            </motion.div>
          </div>

          {/* Review Cards */}
          <div style={{ display: "grid", gap: "clamp(1.5rem, 3.5vw, 2.5rem)", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))" }}>
            {[
              { author: "Priya S.",   text: "The facial was calm, hygienic, and my skin looked fresh for days. Absolutely loved the home service!",         service: "Glow Facial",    initial: "P", accent: "#c9a227" },
              { author: "Ananya R.",  text: "Bridal makeup at home saved so much time. The finish was beautiful and lasted the entire event!",              service: "Bridal Makeup",  initial: "A", accent: "#d4ab35" },
              { author: "Meera K.",   text: "Easy booking and so punctual. I will definitely book the hair spa again — totally relaxing experience!",       service: "Hair Spa",       initial: "M", accent: "#b8922a" },
            ].map((review, index) => (
              <motion.article
                key={review.author}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: index * 0.12 }}
                style={{
                  position: "relative",
                  padding: "clamp(1.25rem, 3vw, 1.875rem)",
                  border: "1px solid rgba(201,162,39,0.18)",
                  borderRadius: "1.5rem",
                  background: "linear-gradient(145deg, #141410 0%, #100f00 100%)",
                  boxShadow: "0 4px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(201,162,39,0.07)",
                  transition: "box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease",
                  overflow: "hidden",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 16px 48px rgba(201,162,39,0.15), 0 4px 28px rgba(0,0,0,0.5)";
                  el.style.borderColor = "rgba(201,162,39,0.5)";
                  el.style.transform = "translateY(-5px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 4px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(201,162,39,0.07)";
                  el.style.borderColor = "rgba(201,162,39,0.18)";
                  el.style.transform = "translateY(0)";
                }}
              >
                {/* Huge decorative quote */}
                <div aria-hidden="true" style={{
                  position: "absolute", top: "-0.5rem", right: "1rem",
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: "7rem", lineHeight: 1, color: "rgba(201,162,39,0.07)",
                  pointerEvents: "none", userSelect: "none", fontWeight: 700,
                }}>"
                </div>

                {/* Service pill */}
                <div style={{ marginBottom: "1rem" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "4px",
                    padding: "0.22rem 0.7rem", borderRadius: "9999px",
                    background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.28)",
                    color: "#c9a227", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.09em",
                    textTransform: "uppercase",
                  }}>✦ {review.service}</span>
                </div>

                {/* Star rating */}
                <div style={{ display: "flex", gap: "4px", marginBottom: "1rem" }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} style={{ color: "#c9a227", fill: "#c9a227", filter: "drop-shadow(0 0 3px rgba(201,162,39,0.6))" }} />
                  ))}
                </div>

                {/* Review text */}
                <p style={{
                  color: "#a89060", fontStyle: "italic", lineHeight: 1.8,
                  margin: "0 0 1.5rem", fontSize: "clamp(0.875rem, 2vw, 0.95rem)",
                  position: "relative", zIndex: 1,
                }}>
                  "{review.text}"
                </p>

                {/* Gold separator */}
                <div style={{ height: "1px", background: "linear-gradient(90deg, rgba(201,162,39,0.3), transparent)", marginBottom: "1.25rem" }} />

                {/* Author */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                  <div style={{
                    width: "50px", height: "50px", borderRadius: "50%", flexShrink: 0,
                    background: `linear-gradient(135deg, ${review.accent}, #4a3008)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#0a0a0a", fontWeight: 800, fontSize: "1.15rem",
                    border: "2px solid rgba(201,162,39,0.4)",
                    boxShadow: "0 0 14px rgba(201,162,39,0.18)",
                  }}>
                    {review.initial}
                  </div>
                  <div>
                    <p style={{ color: "#e8d5a3", fontWeight: 700, margin: "0 0 3px", fontSize: "0.925rem" }}>
                      {review.author}
                    </p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "0.65rem", color: "#3ec46d", fontWeight: 600 }}>
                      ✓ Verified Customer
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              marginTop: "clamp(2rem, 4vw, 3rem)",
              padding: "clamp(1rem, 3vw, 1.5rem) clamp(1.25rem, 4vw, 2.5rem)",
              border: "1px solid rgba(201,162,39,0.14)",
              borderRadius: "1.25rem",
              background: "rgba(201,162,39,0.025)",
              display: "flex", flexWrap: "wrap",
              justifyContent: "center",
              gap: "clamp(1.5rem, 5vw, 4rem)",
              textAlign: "center",
            }}
          >
            {[
              { value: "500+",  label: "Happy Clients" },
              { value: "4.9 ★", label: "Average Rating" },
              { value: "10+",   label: "Years of Service" },
              { value: "100%",  label: "Satisfaction Rate" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-gold-gradient" style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.3rem, 3.5vw, 1.9rem)", fontWeight: 700, margin: "0 0 0.25rem" }}>
                  {stat.value}
                </p>
                <p style={{ color: "#555", fontSize: "clamp(0.7rem, 1.8vw, 0.78rem)", margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ── Gold Divider ── */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #c9a227, transparent)" }} />

      {/* ── Google Maps ── */}
      <section id="location" style={{ padding: "clamp(2.5rem, 6vw, 6rem) 0", background: "#0d0d0d" }}>
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
              href="https://maps.app.goo.gl/9EW1eoq4dqvFZ9ym7?g_st=ipc"
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
              className="map-iframe"
              title="Mani's Elite Makeover Location"
              src="https://maps.google.com/maps?q=Mani's+Elite+Makeover,+Hyderabad&ftid=0x3bcba11fc48402b7:0xde42a5e89b712429&t=&z=17&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="380"
              style={{ border: 0, display: "block", width: "100%" }}
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
          padding: "clamp(2rem, 5vw, 5rem) 0",
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
              to={profile ? (profile.role === "admin" ? "/admin" : "/dashboard") : "/auth/signup"}
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
