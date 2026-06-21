import { useEffect, useState } from "react";
import { formatDateISTShort, formatTimeIST } from "../../lib/booking";

import { fetchAdminBookings, updateBookingStatus } from "../../lib/queries";
import type { Booking, BookingStatus } from "../../types/domain";
import { BACKEND_URL } from "../../api/axios";

const statusOptions: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled"];

type AdminBooking = Booking & {
  customer?: {
    id: string;
    name: string;
    phone: string;
  };
};

export const BookingManager = ({ canEdit }: { canEdit: boolean }) => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminBookings();
      setBookings(data as AdminBooking[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onStatusChange = async (bookingId: string, status: BookingStatus) => {
    if (!canEdit) {
      return;
    }

    try {
      await updateBookingStatus(bookingId, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update booking");
    }
  };

  return (
    <section className="panel">
      <h2 className="font-display text-2xl text-brand-900">Manage Bookings</h2>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="mt-3 text-sm text-slate-600">Loading bookings...</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-left text-slate-600">
                <th className="p-2">Customer</th>
                <th className="p-2">Service</th>
                <th className="p-2">Slot</th>
                <th className="p-2">Payment</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const customer = booking.customer;
                const service = booking.service;

                return (
                  <tr key={booking.id} className="border-b border-brand-50">
                    <td className="p-2">
                      <p className="font-medium">{customer?.name ?? "Unknown"}</p>
                      <p className="text-xs text-slate-500">{customer?.phone}</p>
                    </td>
                    <td className="p-2">{service?.name}</td>
                    <td className="p-2">{`${formatDateISTShort(booking.starts_at)}, ${formatTimeIST(booking.starts_at)}`}</td>
                    <td className="p-2">
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontWeight: 600 }}>{booking.payment_type.toUpperCase()}</span>
                        <span style={{ fontSize: "0.75rem", color: booking.payment_status === "paid" ? "#22c55e" : "#e2a829" }}>
                          {booking.payment_status.toUpperCase()}
                        </span>
                        {booking.upi_transaction_id && (
                          <span style={{ fontSize: "0.75rem", color: "#888", fontFamily: "monospace" }}>
                            ID: {booking.upi_transaction_id}
                          </span>
                        )}
                        {booking.payment_screenshot && (
                          <a
                            href={`${BACKEND_URL}${booking.payment_screenshot}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "0.75rem",
                              color: "#c9a227",
                              textDecoration: "underline",
                              marginTop: "2px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            🖼️ View Proof
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <select
                        className="input py-1"
                        value={booking.status}
                        disabled={!canEdit}
                        onChange={(event) => void onStatusChange(booking.id, event.target.value as BookingStatus)}
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
