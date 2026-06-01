import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Home, Store } from "lucide-react";

import { BookingForm } from "../components/booking/BookingForm";
import { useAuth } from "../context/AuthContext";
import { env } from "../lib/env";
import {
  createBooking,
  createOnlineOrder,
  fetchAvailableSlots,
  fetchServiceById,
  verifyPaymentAndConfirm,
} from "../lib/queries";
import { openRazorpayCheckout, loadRazorpayScript } from "../lib/payment";
import type { PaymentType, Service, SlotOption } from "../types/domain";

export const BookingPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user, session, profile } = useAuth();

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
        setSelectedSlotIso(available[0]?.startsAtIso ?? "");
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
      });

      if (paymentType === "cash") {
        navigate(`/booking/success/${booking.id}`, { replace: true });
        return;
      }

      if (!session) {
        throw new Error("Session expired. Please log in again.");
      }

      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        throw new Error("Unable to load Razorpay SDK.");
      }

      const currentPrice = serviceType === "home" ? (service.price_home || service.price) : service.price;

      const order = await createOnlineOrder({
        bookingId: booking.id,
        amount: currentPrice * 100,
        accessToken: session.access_token,
      });

      const paymentResult = await openRazorpayCheckout({
        key: order.keyId || env.razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        orderId: order.orderId,
        name: "Mani's Elite Makeover",
        description: `${service.name} appointment booking`,
        customerName: profile?.name,
        customerContact: profile?.phone,
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
  }

  return (
    <div style={{ background: "#0a0a0a", minHeight: "calc(100vh - 120px)", padding: "2rem 0" }}>
      <div className="section-shell">
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
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

