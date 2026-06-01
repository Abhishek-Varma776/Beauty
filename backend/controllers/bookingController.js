const asyncHandler = require("../utils/asyncHandler");
const Booking = require("../models/Booking");
const Service = require("../models/Service");

const populateBooking = (query) => query.populate("service").populate("customer", "name phone");

exports.availableSlots = asyncHandler(async (req, res) => {
  const { targetDate, serviceId } = req.query;
  const service = await Service.findById(serviceId);

  if (!targetDate || !service) {
    res.status(400);
    throw new Error("targetDate and serviceId are required");
  }

  const hours = [10, 12, 14, 16, 18];
  const slots = hours.map((hour) => {
    const start = new Date(`${targetDate}T${String(hour).padStart(2, "0")}:00:00`);
    const end = new Date(start.getTime() + service.duration_min * 60 * 1000);
    return {
      startsAtIso: start.toISOString(),
      endsAtIso: end.toISOString(),
      label: start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
  });

  res.json({ slots });
});

exports.createBooking = asyncHandler(async (req, res) => {
  const { service_id, starts_at, ends_at, payment_type, service_type, notes } = req.body;
  const booking = await Booking.create({
    user_id: req.user.id,
    service_id,
    starts_at,
    ends_at,
    payment_type,
    service_type: service_type || "home",
    notes: notes || "",
    payment_status: payment_type === "cash" ? "not_required" : "created",
    status: payment_type === "cash" ? "confirmed" : "pending",
  });

  const populated = await populateBooking(Booking.findById(booking.id));
  res.status(201).json({ booking: populated });
});

exports.myBookings = asyncHandler(async (req, res) => {
  const bookings = await populateBooking(Booking.find({ user_id: req.user.id }).sort({ starts_at: -1 }));
  res.json({ bookings });
});

exports.adminBookings = asyncHandler(async (req, res) => {
  const bookings = await populateBooking(Booking.find().sort({ starts_at: -1 }));
  res.json({ bookings });
});

exports.todayBookings = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const bookings = await populateBooking(
    Booking.find({ starts_at: { $gte: startOfDay, $lte: endOfDay } }).sort({ starts_at: 1 }),
  );
  res.json({ bookings, count: bookings.length });
});

exports.getBooking = asyncHandler(async (req, res) => {
  const booking = await populateBooking(Booking.findById(req.params.id));
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (req.user.role !== "admin" && String(booking.user_id) !== req.user.id) {
    res.status(403);
    throw new Error("You cannot view this booking");
  }

  res.json({ booking });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }
  res.json({ booking });
});

exports.cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (req.user.role !== "admin" && String(booking.user_id) !== req.user.id) {
    res.status(403);
    throw new Error("You cannot cancel this booking");
  }

  booking.status = "cancelled";
  await booking.save();
  res.json({ booking });
});

exports.createOnlineOrder = asyncHandler(async (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID || "", amount: req.body.amount, currency: "INR", orderId: `order_${req.body.bookingId}` });
});

exports.verifyPayment = asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(
    req.body.bookingId,
    { status: "confirmed", payment_status: "paid" },
    { new: true },
  );
  res.json({ booking });
});
