import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Home, Store } from "lucide-react";

import { BookingForm } from "../components/booking/BookingForm";
import { useAuth } from "../context/AuthContext";
import {
  createBooking,
  createOnlineOrder,
  fetchAvailableSlots,
  fetchServiceById,
  verifyPaymentAndConfirm,
} from "../lib/queries";
import { openPhonepeCheckout } from "../lib/payment";
import type { PaymentType, Service, SlotOption } from "../types/domain";

export const BookingPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session } = useAuth();

  // Address passed from HomeAddressPage via router state
  const addressState = location.state as {
    customerName?: string;
    address?: string;
    addressLat?: number;
    addressLng?: number;
  } | null;

  const [service, setService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [selectedSlotIso, setSelectedSlotIso] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("online");
  const [serviceType, setServiceType] = useState<"home" | "salon">(() => {
    const param = new URLSearchParams(window.location.search).get("type");
    return param === "salon" ? "salon" : "home";
  });
  const [loadingService, setLoadingService] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) {
      return;
    }

    const loadService = async () => {
      setLoadingService(true);
      setErrorMessage(null);
      try {
        const found = await fetchServiceById(serviceId);
        
        let activeImage = found.image_url;
        const nameNorm = found.name.trim().toLowerCase();
        
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

        setService({ ...found, image_url: activeImage });
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Unable to load service");
      } finally {
        setLoadingService(false);
      }
    };

    void loadService();
  }, [serviceId]);

  useEffect(() => {
    if (!service) {
      return;
    }

    const loadSlots = async () => {
      setLoadingSlots(true);
      setErrorMessage(null);
      try {
        const available = await fetchAvailableSlots({
          targetDate: selectedDate,
          service,
        });
        setSlots(available);
        // Don't auto-select — user must consciously pick an available slot
        setSelectedSlotIso("");
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Unable to load slots");
      } finally {
        setLoadingSlots(false);
      }
    };

    void loadSlots();
  }, [service, selectedDate]);

  const selectedSlot = useMemo(() => slots.find((slot) => slot.startsAtIso === selectedSlotIso), [selectedSlotIso, slots]);

  const submit = async () => {
    if (!service || !selectedSlot || !user) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const booking = await createBooking({
        userId: user.id,
        service,
        slot: selectedSlot,
        paymentType,
        serviceType,
        customerName: addressState?.customerName,
        address: addressState?.address,
        addressLat: addressState?.addressLat,
        addressLng: addressState?.addressLng,
      });

      if (paymentType === "cash") {
        navigate(`/booking/success/${booking.id}`, { replace: true });
        return;
      }

      if (!session) {
        throw new Error("Session expired. Please log in again.");
      }

      const currentPrice = serviceType === "home" ? (service.price_home || service.price) : service.price;

      const order = await createOnlineOrder({
        bookingId: booking.id,
        amount: currentPrice * 100,
        accessToken: session.access_token,
      });

      // PhonePe redirect flow: if backend returns a real redirectUrl, navigate away.
      // The user will come back to /booking/success/:bookingId?txn=TX_... and verification happens there.
      if (!order.isSimulated && order.redirectUrl) {
        window.location.href = order.redirectUrl;
        return;
      }

      // Simulated/sandbox overlay flow
      const paymentResult = await openPhonepeCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        orderId: order.orderId,
        name: "Mani's Elite Makeover Studio",
        description: `${service.name} appointment booking`,
        redirectUrl: order.redirectUrl,
        isSimulated: order.isSimulated,
      });

      await verifyPaymentAndConfirm({
        bookingId: booking.id,
        razorpayOrderId: paymentResult.razorpay_order_id,
        razorpayPaymentId: paymentResult.razorpay_payment_id,
        razorpaySignature: paymentResult.razorpay_signature,
        accessToken: session.access_token,
      });

      navigate(`/booking/success/${booking.id}`, { replace: true });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to complete booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingService) {
    return <section className="section-shell py-10" style={{ color: "#888" }}>Loading service details...</section>;
  }

  if (!service) {
    return <section className="section-shell py-10" style={{ color: "#ef4444" }}>Service not found.</section>;
  }  return (
    <div style={{ background: "#0a0a0a", minHeight: "calc(100vh - 120px)", padding: "2rem 0" }}>
      <div className="section-shell">
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>

          {/* Address Banner for Home Visit */}
          {serviceType === "home" && addressState?.address && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                padding: "0.875rem 1rem",
                marginBottom: "1.25rem",
                borderRadius: "0.875rem",
                background: "rgba(201,162,39,0.06)",
                border: "1px solid rgba(201,162,39,0.2)",
              }}
            >
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>📍</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "#c9a227", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", margin: "0 0 0.2rem", textTransform: "uppercase" }}>
                  Home Visit Address
                </p>
                <p style={{ color: "#e8d5a3", fontSize: "0.85rem", margin: "0 0 0.15rem", fontWeight: 600 }}>
                  {addressState.customerName}
                </p>
                <p style={{ color: "#888", fontSize: "0.82rem", margin: 0, lineHeight: 1.5 }}>
                  {addressState.address}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/book/${serviceId}/address`)}
                style={{ background: "none", border: "none", color: "#c9a227", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, flexShrink: 0, padding: "0.25rem 0.5rem" }}
              >
                Change
              </button>
            </div>
          )}

          {/* Prompt to collect address for Home Visit */}
          {serviceType === "home" && !addressState?.address && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                padding: "1rem 1.25rem",
                marginBottom: "1.25rem",
                borderRadius: "0.875rem",
                background: "rgba(201,162,39,0.06)",
                border: "1px solid rgba(201,162,39,0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.3rem" }}>🏠</span>
                <div>
                  <p style={{ color: "#e8d5a3", fontSize: "0.85rem", fontWeight: 600, margin: "0 0 0.15rem" }}>Add Your Home Address</p>
                  <p style={{ color: "#666", fontSize: "0.78rem", margin: 0 }}>Required for home visit — tell us where to come</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/book/${serviceId}/address`)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.625rem",
                  border: "1px solid rgba(201,162,39,0.4)",
                  background: "rgba(201,162,39,0.1)",
                  color: "#c9a227",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                Add Address →
              </button>
            </div>
          )}

          {/* Service Type Selector */}
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: "0.75rem", letterSpacing: "0.05em" }}>
              SELECT SERVICE TYPE
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              {(["home", "salon"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setServiceType(type)}
                  style={{
                    flex: 1,
                    padding: "1rem",
                    border: serviceType === type ? "2px solid #c9a227" : "1px solid #2a2a2a",
                    borderRadius: "1rem",
                    background: serviceType === type ? "rgba(201,162,39,0.1)" : "#111",
                    color: serviceType === type ? "#c9a227" : "#555",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.6rem",
                    fontWeight: serviceType === type ? 600 : 400,
                    transition: "all 0.2s",
                    fontSize: "0.9rem",
                  }}
                >
                  {type === "home" ? <Home size={18} /> : <Store size={18} />}
                  {type === "home" ? "Home Visit" : "Salon Visit"}
                </button>
              ))}
            </div>
          </div>

          <BookingForm
            service={service}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            slots={slots}
            selectedSlotIso={selectedSlotIso}
            onSelectSlot={setSelectedSlotIso}
            paymentType={paymentType}
            onPaymentTypeChange={setPaymentType}
            onSubmit={submit}
            submitting={submitting}
            loadingSlots={loadingSlots}
            errorMessage={errorMessage}
            serviceType={serviceType}
          />
        </div>
      </div>
    </div>
  );
};
