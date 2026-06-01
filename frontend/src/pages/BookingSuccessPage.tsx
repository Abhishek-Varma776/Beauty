import { format, parseISO } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { fetchBookingById } from "../lib/queries";
import type { Booking } from "../types/domain";

export const BookingSuccessPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        setBooking(await fetchBookingById(bookingId));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [bookingId]);

  return (
    <section className="section-shell py-10">
      <div className="mx-auto max-w-2xl panel space-y-4 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
        <h1 className="font-display text-3xl text-brand-900">Booking Confirmed</h1>
        <p className="text-sm text-slate-600">Your appointment has been created successfully.</p>

        {loading ? (
          <p className="text-sm text-slate-500">Loading booking summary...</p>
        ) : booking ? (
          <div className="rounded-xl border border-brand-100 bg-white p-4 text-left text-sm text-slate-700">
            <p>
              <strong>Service:</strong> {booking.service?.name}
            </p>
            <p>
              <strong>Date:</strong> {format(parseISO(booking.starts_at), "dd MMM yyyy")}
            </p>
            <p>
              <strong>Time:</strong> {format(parseISO(booking.starts_at), "hh:mm a")} - {format(parseISO(booking.ends_at), "hh:mm a")}
            </p>
            <p>
              <strong>Payment:</strong> {booking.payment_type} ({booking.payment_status})
            </p>
            <p>
              <strong>Status:</strong> {booking.status}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-600">Booking details unavailable.</p>
        )}

        <div className="flex justify-center gap-3">
          <Link to="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
          <Link to="/" className="btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
};
