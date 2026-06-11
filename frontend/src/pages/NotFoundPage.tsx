import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";

export const NotFoundPage = () => (
  <div
    style={{
      background: "#0a0a0a",
      minHeight: "calc(100vh - 120px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Ambient glow */}
    <div
      style={{
        position: "fixed",
        top: "40%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "500px",
        height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,162,39,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }}
    />

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        textAlign: "center",
        maxWidth: "480px",
        width: "100%",
      }}
    >
      {/* 404 Number */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        style={{
          fontFamily: "'Cinzel', 'Playfair Display', serif",
          fontSize: "clamp(6rem, 20vw, 10rem)",
          fontWeight: 700,
          lineHeight: 1,
          background: "linear-gradient(135deg, rgba(201,162,39,0.15) 0%, rgba(240,201,78,0.08) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          border: "1px solid rgba(201,162,39,0.15)",
          borderRadius: "1.5rem",
          padding: "1rem 2rem",
          marginBottom: "1.5rem",
          display: "inline-block",
          color: "rgba(201,162,39,0.3)",
          textShadow: "none",
        }}
      >
        404
      </motion.div>

      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "rgba(201,162,39,0.1)",
          border: "1px solid rgba(201,162,39,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem",
        }}
      >
        <Search size={28} style={{ color: "#c9a227" }} />
      </motion.div>

      {/* Title */}
      <h1
        style={{
          fontFamily: "'Cinzel', 'Playfair Display', serif",
          color: "#e8d5a3",
          fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
          fontWeight: 700,
          margin: "0 0 0.75rem",
          letterSpacing: "0.02em",
        }}
      >
        Page Not Found
      </h1>

      <p
        style={{
          color: "#666",
          fontSize: "0.95rem",
          lineHeight: 1.65,
          margin: "0 0 2rem",
          maxWidth: "360px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        The page you're looking for doesn't exist or has been moved.
        Head back to our homepage to browse our beauty services.
      </p>

      {/* CTA */}
      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.875rem 2rem",
          borderRadius: "0.875rem",
          background: "linear-gradient(135deg, #c9a227 0%, #a88118 100%)",
          color: "#0a0a0a",
          fontWeight: 700,
          fontSize: "0.9rem",
          textDecoration: "none",
          transition: "transform 0.2s, box-shadow 0.2s",
          boxShadow: "0 4px 20px rgba(201,162,39,0.3)",
          letterSpacing: "0.03em",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 30px rgba(201,162,39,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(201,162,39,0.3)";
        }}
      >
        <Home size={18} />
        Back to Home
      </Link>
    </motion.div>
  </div>
);
