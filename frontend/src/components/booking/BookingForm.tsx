import { format } from "date-fns";

import type { PaymentType, Service, SlotOption } from "../../types/domain";

interface BookingFormProps {
  service: Service;
  selectedDate: string;
  onDateChange: (next: string) => void;
  slots: SlotOption[];
  selectedSlotIso: string;
  onSelectSlot: (slotIso: string) => void;
  paymentType: PaymentType;
  onPaymentTypeChange: (type: PaymentType) => void;
  onSubmit: () => Promise<void>;
  submitting: boolean;
  loadingSlots: boolean;
  errorMessage: string | null;
  serviceType: "home" | "salon";
}

export const BookingForm = ({
  service,
  selectedDate,
  onDateChange,
  slots,
  selectedSlotIso,
  onSelectSlot,
  paymentType,
  onPaymentTypeChange,
  onSubmit,
  submitting,
  loadingSlots,
  errorMessage,
  serviceType,
}: BookingFormProps) => {
  const currentPrice = serviceType === "home" ? (service.price_home || service.price) : service.price;

  return (
    <section className="panel" style={{ overflow: "hidden", padding: 0 }}>
      {service.image_url && (
        <div style={{ width: "100%", height: "240px", overflow: "hidden", position: "relative" }}>
          <img
            src={service.image_url}
            alt={service.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, #111 0%, transparent 100%)"
          }} />
        </div>
      )}

      <div style={{ padding: "2rem" }} className="space-y-5">
        <header className="space-y-1">
          <p className="badge">Book Appointment</p>
          <h1 className="font-display text-3xl text-brand-900">{service.name}</h1>
          <p className="text-sm text-slate-600">{service.description}</p>
          <p className="text-sm text-slate-700">
            Duration: <strong>{service.duration_min} min</strong> | Service: <strong style={{ textTransform: "capitalize" }}>{serviceType === "home" ? "Home Visit" : "Salon Visit"}</strong> | Price: <strong>INR {currentPrice}</strong>
          </p>
        </header>

    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700" htmlFor="booking-date">
        Choose Date
      </label>
      <input
        id="booking-date"
        className="input"
        type="date"
        value={selectedDate}
        min={format(new Date(), "yyyy-MM-dd")}
        onChange={(event) => onDateChange(event.target.value)}
      />
    </div>

    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">Available Time Slots</p>
      {loadingSlots ? (
        <p className="text-sm text-slate-500">Checking availability...</p>
      ) : slots.length === 0 ? (
        <p className="text-sm text-amber-700">No slots are available on this date. Please try another date.</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => (
            <button
              key={slot.startsAtIso}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                selectedSlotIso === slot.startsAtIso
                  ? "border-brand-500 bg-brand-100 text-brand-900"
                  : "border-brand-200 bg-white text-slate-700 hover:border-brand-400"
              }`}
              type="button"
              onClick={() => onSelectSlot(slot.startsAtIso)}
            >
              {slot.label}
            </button>
          ))}
        </div>
      )}
    </div>

    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">Payment Method</p>
      <label className="flex items-center gap-2 rounded-xl border border-brand-200 bg-white p-3 text-sm text-slate-700">
        <input
          type="radio"
          name="paymentType"
          checked={paymentType === "online"}
          onChange={() => onPaymentTypeChange("online")}
        />
        Pay Online (Razorpay)
      </label>
      <label className="flex items-center gap-2 rounded-xl border border-brand-200 bg-white p-3 text-sm text-slate-700">
        <input type="radio" name="paymentType" checked={paymentType === "cash"} onChange={() => onPaymentTypeChange("cash")} />
        Cash After Service
      </label>
    </div>

    {errorMessage && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}

    <button className="btn-primary w-full" type="button" disabled={submitting || !selectedSlotIso} onClick={() => void onSubmit()}>
      {submitting ? "Processing..." : paymentType === "online" ? "Proceed to Payment" : "Confirm Cash Booking"}
    </button>
  </div>
</section>
  );
};
