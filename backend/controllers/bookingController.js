const crypto = require("crypto");
const Razorpay = require("razorpay");
const asyncHandler = require("../utils/asyncHandler");
const Booking = require("../models/Booking");
const Service = require("../models/Service");

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured on the server.");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

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

// ─── Razorpay: Create Order ────────────────────────────────────────────────────
exports.createOnlineOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    res.status(400);
    throw new Error("bookingId is required");
  }

  // Fetch the booking and verify it belongs to this user
  const booking = await Booking.findById(bookingId).populate("service");
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }
  if (req.user.role !== "admin" && String(booking.user_id) !== req.user.id) {
    res.status(403);
    throw new Error("Access denied");
  }

  // ✅ SECURITY: Use the actual price from the database — never trust client-sent amount
  const service = booking.service;
  if (!service) {
    res.status(400);
    throw new Error("Service not found for this booking");
  }

  // Determine correct price based on service_type
  const priceRupees = booking.service_type === "home" && service.price_home
    ? service.price_home
    : service.price;

  const amountPaise = Math.round(priceRupees * 100); // Razorpay expects paise

  const razorpay = getRazorpay();

  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: `booking_${bookingId}`,
    notes: {
      bookingId: String(bookingId),
      userId: String(req.user.id),
      serviceId: String(service._id),
    },
  });

  res.json({
    keyId: process.env.RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    orderId: order.id,
  });
});

// ─── Razorpay: Verify Payment Signature ───────────────────────────────────────
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!bookingId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    res.status(400);
    throw new Error("All payment fields are required for verification");
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  if (!keySecret) {
    res.status(500);
    throw new Error("Payment verification is not configured on the server");
  }

  // HMAC-SHA256 signature verification
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    res.status(400);
    throw new Error("Payment signature verification failed. Payment may be fraudulent.");
  }

  // Signature valid — confirm booking as paid
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      status: "confirmed",
      payment_status: "paid",
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
    },
    { new: true },
  );

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found after payment verification");
  }

  res.json({ booking });
});
