import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Home, Store, MapPin } from "lucide-react";

import { BookingForm } from "../components/booking/BookingForm";
import { useAuth } from "../context/AuthContext";
import {
  createBooking,
  createOnlineOrder,
  verifyPaymentAndConfirm,
  fetchAvailableSlots,
  fetchServiceById,
  cancelBooking,
} from "../lib/queries";
import {
  getDistanceKm,
  getDeliveryCharge,
  getDeliveryLabel,
  SALON_LAT,
  SALON_LNG,
} from "../lib/payment";
import type { PaymentType, Service, SlotOption } from "../types/domain";

// Dynamically load the Razorpay checkout script once
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-checkout-js")) { resolve(true); return; }
    const script = document.createElement("script");
    script.id  = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const BookingPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();

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

  // ── Distance & Delivery Charge ──────────────────────────────────────────────
  const distanceKm = useMemo(() => {
    if (
      serviceType === "home" &&
      addressState?.addressLat != null &&
      addressState?.addressLng != null
    ) {
      return getDistanceKm(SALON_LAT, SALON_LNG, addressState.addressLat, addressState.addressLng);
    }
    return null;
  }, [serviceType, addressState]);

  const deliveryCharge = distanceKm != null ? getDeliveryCharge(distanceKm) : 0;

  // ── Load Service ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!serviceId) return;
    const loadService = async () => {
      setLoadingService(true);
      setErrorMessage(null);
      try {
        const found = await fetchServiceById(serviceId);
        let activeImage = found.image_url;
        const nameNorm = found.name.trim().toLowerCase();
        if (nameNorm === "hair color")            activeImage = "/images/services/hair-color.png";
        else if (nameNorm === "full face threading") activeImage = "/images/services/full-face-threading.png";
        else if (nameNorm === "cleanup")          activeImage = "/images/services/cleanup.png";
        else if (nameNorm === "pedicure")         activeImage = "/images/services/pedicure.png";
        else if (nameNorm === "upper lip")        activeImage = "/images/services/upper-lip.png";
        else if (nameNorm === "eyebrows")         activeImage = "/images/services/eyebrows.png";
        else if (nameNorm === "manicure")         activeImage = "/images/services/manicure.png";
        else if (nameNorm === "saree draping")    activeImage = "/images/services/saree-draping.png";
        else if (nameNorm === "bridal makeup")    activeImage = "/images/services/bridal-makeup.png";
        else if (nameNorm === "facial")           activeImage = "/images/services/facial.png";
        else if (nameNorm === "hair cut")         activeImage = "/images/services/hair-cut.png";
        setService({ ...found, image_url: activeImage });
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Unable to load service");
      } finally {
        setLoadingService(false);
      }
    };
    void loadService();
  }, [serviceId]);

  // ── Load Slots ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!service) return;
    const loadSlots = async () => {
      setLoadingSlots(true);
      setErrorMessage(null);
      try {
        const available = await fetchAvailableSlots({ targetDate: selectedDate, service });
        setSlots(available);
        setSelectedSlotIso(""); // no auto-select — user must consciously pick
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Unable to load slots");
      } finally {
        setLoadingSlots(false);
      }
    };
    void loadSlots();
  }, [service, selectedDate]);

  const selectedSlot = useMemo(
    () => slots.find((s) => s.startsAtIso === selectedSlotIso),
    [selectedSlotIso, slots]
  );

  // ── Submit / Pay ────────────────────────────────────────────────────────────
  const submit = async () => {
    if (!service || !selectedSlot || !user) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Create a pending booking record in DB
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

      // 2. Cash bookings are immediately confirmed — go straight to success
      if (paymentType === "cash") {
        navigate(`/booking/success/${booking.id}`, { replace: true });
        return;
      }

      // 3. Load Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        await cancelBooking(booking.id);
        throw new Error("Failed to load payment gateway. Please refresh and try again.");
      }

      // 4. Ask backend to create a Razorpay order (server computes price securely)
      const order = await createOnlineOrder({ bookingId: booking.id, amount: 0, accessToken: "" });

      // 5. Open Razorpay modal
      await new Promise<void>((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp = new (window as any).Razorpay({
          key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount:      order.amount,
          currency:    order.currency,
          name:        "Mani's Elite Makeover Studio",
          description: service.name,
          order_id:    order.order_id,
          prefill: {
            name:    profile?.name ?? addressState?.customerName ?? "",
            contact: user.phone,
          },
          theme: { color: "#c9a227" },
          modal: {
            // Slot is freed immediately when user closes without paying
            ondismiss: () => {
              cancelBooking(booking.id).catch(console.error);
              reject(new Error("Payment cancelled. Your slot has been released."));
            },
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              // 6. Verify signature on backend → confirms booking
              await verifyPaymentAndConfirm({
                bookingId:           booking.id,
                razorpayOrderId:     response.razorpay_order_id,
                razorpayPaymentId:   response.razorpay_payment_id,
                razorpaySignature:   response.razorpay_signature,
              });
              resolve();
            } catch (verifyErr) {
              reject(verifyErr);
            }
          },
        });

        rzp.on("payment.failed", (resp: { error: { description: string } }) => {
          cancelBooking(booking.id).catch(console.error);
          reject(new Error(resp.error?.description ?? "Payment failed. Please try again."));
        });

        rzp.open();
      });

      navigate(`/booking/success/${booking.id}`, { replace: true });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to complete booking");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading / Error states ──────────────────────────────────────────────────
  if (loadingService) {
    return <section className="section-shell" style={{ color: "#888", padding: "4rem 0" }}>Loading service details...</section>;
  }
  if (!service) {
    return <section className="section-shell" style={{ color: "#ef4444", padding: "4rem 0" }}>Service not found.</section>;
  }

  const basePrice = serviceType === "home" ? (service.price_home ?? service.price) : service.price;
  const totalAmount = basePrice + deliveryCharge;

  return (
    <div style={{ background: "#0a0a0a", minHeight: "calc(100vh - 120px)", padding: "2rem 0" }}>
      <div className="section-shell">
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>

          {/* ── Address Banner (Home Visit with address) ── */}
          {serviceType === "home" && addressState?.address && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.875rem 1rem", marginBottom: "1rem", borderRadius: "0.875rem", background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.2)" }}>
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>📍</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "#c9a227", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", margin: "0 0 0.2rem", textTransform: "uppercase" }}>Home Visit Address</p>
                <p style={{ color: "#e8d5a3", fontSize: "0.85rem", margin: "0 0 0.15rem", fontWeight: 600 }}>{addressState.customerName}</p>
                <p style={{ color: "#888", fontSize: "0.8rem", margin: 0, lineHeight: 1.5 }}>{addressState.address}</p>
              </div>
              <button type="button" onClick={() => navigate(`/book/${serviceId}/address`)} style={{ background: "none", border: "none", color: "#c9a227", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, flexShrink: 0, padding: "0.25rem 0.5rem" }}>Change</button>
            </div>
          )}

          {/* ── Distance & Delivery Charge Card ── */}
          {serviceType === "home" && distanceKm != null && (
            <div style={{ padding: "0.875rem 1rem", marginBottom: "1rem", borderRadius: "0.875rem", background: deliveryCharge === 0 ? "rgba(34,197,94,0.05)" : "rgba(201,162,39,0.06)", border: `1px solid ${deliveryCharge === 0 ? "rgba(34,197,94,0.2)" : "rgba(201,162,39,0.2)"}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <MapPin size={14} style={{ color: deliveryCharge === 0 ? "#22c55e" : "#c9a227", flexShrink: 0 }} />
                  <span style={{ color: "#888", fontSize: "0.8rem" }}>
                    Distance from salon: <strong style={{ color: "#e8d5a3" }}>{distanceKm.toFixed(1)} km</strong>
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ color: "#888", fontSize: "0.75rem" }}>Home visit charge:</span>
                  <span style={{ fontWeight: 700, fontSize: "0.9rem", color: deliveryCharge === 0 ? "#22c55e" : "#c9a227" }}>
                    {getDeliveryLabel(distanceKm)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Prompt to add address ── */}
          {serviceType === "home" && !addressState?.address && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "1rem 1.25rem", marginBottom: "1rem", borderRadius: "0.875rem", background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.3rem" }}>🏠</span>
                <div>
                  <p style={{ color: "#e8d5a3", fontSize: "0.85rem", fontWeight: 600, margin: "0 0 0.15rem" }}>Add Your Home Address</p>
                  <p style={{ color: "#666", fontSize: "0.78rem", margin: 0 }}>Required for home visit — tell us where to come</p>
                </div>
              </div>
              <button type="button" onClick={() => navigate(`/book/${serviceId}/address`)} style={{ padding: "0.5rem 1rem", borderRadius: "0.625rem", border: "1px solid rgba(201,162,39,0.4)", background: "rgba(201,162,39,0.1)", color: "#c9a227", cursor: "pointer", fontWeight: 600, fontSize: "0.8rem", flexShrink: 0, whiteSpace: "nowrap" }}>
                Add Address →
              </button>
            </div>
          )}

          {/* ── Price Summary Card ── */}
          {serviceType === "home" && distanceKm != null && (
            <div style={{ padding: "0.875rem 1rem", marginBottom: "1.25rem", borderRadius: "0.875rem", background: "#111", border: "1px solid rgba(201,162,39,0.15)" }}>
              <p style={{ color: "#888", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 0.75rem" }}>Price Breakdown</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#888", fontSize: "0.85rem" }}>{service.name}</span>
                  <span style={{ color: "#e8d5a3", fontSize: "0.85rem" }}>₹{basePrice}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#888", fontSize: "0.85rem" }}>Home visit ({distanceKm.toFixed(1)} km)</span>
                  <span style={{ color: deliveryCharge === 0 ? "#22c55e" : "#c9a227", fontSize: "0.85rem", fontWeight: 600 }}>
                    {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div style={{ height: "1px", background: "rgba(201,162,39,0.15)", margin: "0.25rem 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#e8d5a3", fontSize: "0.9rem", fontWeight: 700 }}>Total</span>
                  <span style={{ color: "#c9a227", fontSize: "1rem", fontWeight: 700 }}>₹{totalAmount}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Service Type Selector ── */}
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: "0.75rem", letterSpacing: "0.05em" }}>SELECT SERVICE TYPE</p>
            <div style={{ display: "flex", gap: "1rem" }}>
              {(["home", "salon"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setServiceType(type)}
                  style={{
                    flex: 1, padding: "1rem",
                    border: serviceType === type ? "2px solid #c9a227" : "1px solid #2a2a2a",
                    borderRadius: "1rem",
                    background: serviceType === type ? "rgba(201,162,39,0.1)" : "#111",
                    color: serviceType === type ? "#c9a227" : "#555",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    gap: "0.6rem", fontWeight: serviceType === type ? 600 : 400,
                    transition: "all 0.2s", fontSize: "0.9rem",
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
            deliveryCharge={deliveryCharge}
            totalAmount={totalAmount}
          />
        </div>
      </div>
    </div>
  );
};
