const crypto = require("crypto");
const Razorpay = require("razorpay");
const asyncHandler = require("../utils/asyncHandler");
const Booking = require("../models/Booking");
const Service = require("../models/Service");

// ─── Salon Coordinates ────────────────────────────────────────────────────────
const SALON_LAT = 17.3244416;
const SALON_LNG = 78.5809408;

// ─── Haversine Distance (km) ──────────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getDeliveryCharge(distanceKm) {
  if (distanceKm < 4)   return 0;
  if (distanceKm <= 10) return 49;
  return 99;
}

// ─── WhatsApp Notification Logger ────────────────────────────────────────────
function sendBookingWhatsAppNotifications(booking) {
  const ADMIN_WA = process.env.ADMIN_WHATSAPP || "917780294746";

  let serviceDate = "N/A";
  let serviceTime = "N/A";
  try {
    const d = new Date(booking.starts_at);
    serviceDate = d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    serviceTime = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch (_) { /* ignore */ }

  const serviceName   = booking.service?.name ?? "Service";
  const customerName  = booking.customer?.name  ?? booking.customer_name ?? "Customer";
  const customerPhone = booking.customer?.phone  ?? "N/A";
  const serviceType   = booking.service_type === "salon" ? "Salon Visit" : "Home Visit";
  const paymentType   = booking.payment_type  === "online" ? "Online (Razorpay)" : "Cash After Service";
  const addressLine   = booking.address ? `\nAddress: ${booking.address}` : "";

  const adminMsg = [
    `🔔 *New Booking Alert — Mani's Elite Makeover Studio*`,
    ``,
    `📋 *Booking ID:* ${booking._id || booking.id}`,
    `💅 *Service:* ${serviceName}`,
    `👤 *Customer:* ${customerName}`,
    `📞 *Phone:* ${customerPhone}`,
    `📅 *Date:* ${serviceDate}`,
    `⏰ *Time:* ${serviceTime}`,
    `🏷️ *Type:* ${serviceType}`,
    `💳 *Payment:* ${paymentType}`,
    addressLine,
    ``,
    `✅ *Status:* ${booking.status}`,
  ].join("\n");

  const customerMsg = [
    `✨ *Booking Confirmed — Mani's Elite Makeover Studio*`,
    ``,
    `Hi ${customerName}! Your appointment is confirmed.`,
    ``,
    `💅 *Service:* ${serviceName}`,
    `📅 *Date:* ${serviceDate}`,
    `⏰ *Time:* ${serviceTime}`,
    `🏷️ *Type:* ${serviceType}`,
    `💳 *Payment:* ${paymentType}`,
    ``,
    `For any queries, call/WhatsApp us: +91 77802 94746`,
    ``,
    `Thank you for choosing us! 💄`,
  ].join("\n");

  console.log("\n─────────────────────────────────────────────────────");
  console.log("📲 WhatsApp Notification — ADMIN");
  console.log(`   To: +${ADMIN_WA}`);
  console.log("   Message:\n" + adminMsg);
  console.log("\n📲 WhatsApp Notification — CUSTOMER");
  console.log(`   To: +91${customerPhone}`);
  console.log("   Message:\n" + customerMsg);
  console.log("─────────────────────────────────────────────────────\n");
}

const populateBooking = (query) => query.populate("service").populate("customer", "name phone");

// ─── Available Slots ──────────────────────────────────────────────────────────
exports.availableSlots = asyncHandler(async (req, res) => {
  const { targetDate, serviceId } = req.query;
  const service = await Service.findById(serviceId);

  if (!targetDate || !service) {
    res.status(400);
    throw new Error("targetDate and serviceId are required");
  }

  const dayStart = new Date(`${targetDate}T00:00:00.000Z`);
  const dayEnd   = new Date(`${targetDate}T23:59:59.999Z`);

  // Confirmed/completed bookings OR pending created within last 10 min hold a slot
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const existingBookings = await Booking.find({
    starts_at: { $gte: dayStart, $lte: dayEnd },
    $or: [
      { status: { $in: ["confirmed", "completed"] } },
      { status: "pending", createdAt: { $gt: tenMinutesAgo } }
    ]
  }).select("starts_at ends_at");

  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  const slots = hours.map((hour) => {
    const start = new Date(`${targetDate}T${String(hour).padStart(2, "0")}:00:00`);
    const end   = new Date(start.getTime() + service.duration_min * 60 * 1000);

    const isBooked = existingBookings.some((b) => {
      const bStart = new Date(b.starts_at);
      const bEnd   = new Date(b.ends_at);
      return start < bEnd && end > bStart;
    });

    return {
      startsAtIso: start.toISOString(),
      endsAtIso:   end.toISOString(),
      label:       start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
      isBooked,
    };
  });

  res.json({ slots });
});

// ─── Create Booking ───────────────────────────────────────────────────────────
exports.createBooking = asyncHandler(async (req, res) => {
  const {
    service_id, starts_at, ends_at, payment_type,
    service_type, notes, customer_name, address, address_lat, address_lng
  } = req.body;

  // Race-condition guard: ensure slot is still free
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const overlap = await Booking.findOne({
    starts_at: { $lt: new Date(ends_at) },
    ends_at:   { $gt: new Date(starts_at) },
    $or: [
      { status: { $in: ["confirmed", "completed"] } },
      { status: "pending", createdAt: { $gt: tenMinutesAgo } }
    ]
  });
  if (overlap) {
    res.status(409);
    throw new Error("This time slot was just booked by someone else. Please choose another slot.");
  }

  const booking = await Booking.create({
    user_id:        req.user.id,
    service_id,
    starts_at,
    ends_at,
    payment_type,
    service_type:   service_type || "home",
    notes:          notes || "",
    payment_status: payment_type === "cash" ? "not_required" : "created",
    status:         payment_type === "cash" ? "confirmed"    : "pending",
    customer_name:  customer_name || "",
    address:        address       || "",
    address_lat:    address_lat   || null,
    address_lng:    address_lng   || null,
  });

  // Immediately notify for cash bookings (already confirmed on creation)
  if (payment_type === "cash") {
    try {
      const pop = await populateBooking(Booking.findById(booking.id));
      sendBookingWhatsAppNotifications(pop);
    } catch (e) {
      console.error("WhatsApp notification error (cash):", e.message);
    }
  }

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
  if (!booking) { res.status(404); throw new Error("Booking not found"); }
  if (req.user.role !== "admin" && String(booking.user_id) !== req.user.id) {
    res.status(403); throw new Error("You cannot view this booking");
  }
  res.json({ booking });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id, { status: req.body.status }, { new: true, runValidators: true }
  );
  if (!booking) { res.status(404); throw new Error("Booking not found"); }
  res.json({ booking });
});

exports.cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) { res.status(404); throw new Error("Booking not found"); }
  if (req.user.role !== "admin" && String(booking.user_id) !== req.user.id) {
    res.status(403); throw new Error("You cannot cancel this booking");
  }
  booking.status = "cancelled";
  await booking.save();
  res.json({ booking });
});

// ─── Razorpay: Create Order ───────────────────────────────────────────────────
exports.createOnlineOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) { res.status(400); throw new Error("bookingId is required"); }

  const booking = await Booking.findById(bookingId).populate("service");
  if (!booking) { res.status(404); throw new Error("Booking not found"); }
  if (req.user.role !== "admin" && String(booking.user_id) !== req.user.id) {
    res.status(403); throw new Error("Access denied");
  }

  const service = booking.service;
  if (!service) { res.status(400); throw new Error("Service not found for this booking"); }

  // SECURITY: compute price server-side — never trust client
  const basePrice = booking.service_type === "home" && service.price_home
    ? service.price_home
    : service.price;

  // Server-side distance surcharge
  let deliveryCharge = 0;
  if (booking.service_type === "home" && booking.address_lat != null && booking.address_lng != null) {
    const distKm = haversineKm(SALON_LAT, SALON_LNG, booking.address_lat, booking.address_lng);
    deliveryCharge = getDeliveryCharge(distKm);
  }

  const totalRupees = basePrice + deliveryCharge;
  const amountPaise = Math.round(totalRupees * 100);

  if (amountPaise < 100) {
    res.status(400);
    throw new Error("Order amount is below the minimum (Rs. 1).");
  }

  const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  let order;
  try {
    order = await razorpay.orders.create({
      amount:   amountPaise,
      currency: "INR",
      receipt:  `rcpt_${bookingId.slice(-8)}_${Date.now()}`,
    });
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    res.status(500);
    throw new Error("Failed to create payment order. Please try again.");
  }

  // Persist Razorpay order ID
  await Booking.findByIdAndUpdate(bookingId, { razorpay_order_id: order.id });

  res.json({
    order_id: order.id,
    amount:   order.amount,
    currency: order.currency,
    key_id:   process.env.RAZORPAY_KEY_ID,
  });
});

// ─── Razorpay: Verify Signature & Confirm Booking ────────────────────────────
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error(
      "bookingId, razorpay_order_id, razorpay_payment_id, and razorpay_signature are all required."
    );
  }

  // HMAC-SHA256 verification
  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSig !== razorpay_signature) {
    res.status(400);
    throw new Error("Payment signature verification failed. This payment cannot be confirmed.");
  }

  // Signature valid — mark booking as paid & confirmed
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      status:              "confirmed",
      payment_status:      "paid",
      razorpay_order_id:   razorpay_order_id,
      razorpay_payment_id: razorpay_payment_id,
    },
    { new: true }
  ).populate("service").populate("customer", "name phone");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found after payment verification.");
  }

  // Non-blocking WhatsApp notifications
  try {
    sendBookingWhatsAppNotifications(booking);
  } catch (e) {
    console.error("WhatsApp notification error (online):", e.message);
  }

  res.json({ booking });
});

// ─── Legacy UPI Self-Confirm (kept for backward compatibility) ────────────────
exports.confirmUpiPayment = asyncHandler(async (req, res) => {
  const { bookingId, upiTransactionId } = req.body;
  if (!bookingId) { res.status(400); throw new Error("bookingId is required"); }

  const booking = await Booking.findById(bookingId);
  if (!booking) { res.status(404); throw new Error("Booking not found"); }
  if (req.user.role !== "admin" && String(booking.user_id) !== req.user.id) {
    res.status(403); throw new Error("Access denied");
  }

  booking.status         = "confirmed";
  booking.payment_status = "paid";
  if (upiTransactionId)  booking.upi_transaction_id = upiTransactionId;
  if (req.file)          booking.payment_screenshot  = `/uploads/${req.file.filename}`;
  booking.razorpay_payment_id = upiTransactionId || `upi_${Date.now()}`;
  await booking.save();

  const populated = await populateBooking(Booking.findById(booking.id));
  res.json({ booking: populated });
});
