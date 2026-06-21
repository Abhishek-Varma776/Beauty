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
// ─── CallMeBot: Auto-send WhatsApp to admin ─────────────────────────────────
async function sendWhatsAppToAdmin(message) {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  const phone  = process.env.ADMIN_WHATSAPP || "917780294746";

  if (!apiKey) {
    // API key not yet configured — log clearly so admin can set it up
    console.log("\n⚠️  CALLMEBOT_API_KEY not set. To enable auto WhatsApp:\n"
      + "   1. Send 'I allow callmebot to send me messages' to +34 644 38 53 73 on WhatsApp\n"
      + "   2. You will receive an API key reply\n"
      + "   3. Add  CALLMEBOT_API_KEY=<key>  to backend .env and Render env vars\n");
    console.log("📲 WhatsApp (would-send) to +" + phone + ":\n" + message + "\n");
    return;
  }

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;
    const res  = await fetch(url);
    const body = await res.text();
    console.log(`📲 CallMeBot WhatsApp → Admin +${phone}: ${body.trim()}`);
  } catch (err) {
    console.error("CallMeBot WhatsApp error:", err.message);
  }
}

// ─── CallMeBot: Auto-send WhatsApp to customer ───────────────────────────────
async function sendWhatsAppToCustomer(phone, message) {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!apiKey) {
    console.log("📲 WhatsApp (would-send to customer) to +" + phone + ":\n" + message + "\n");
    return;
  }

  // Remove any spaces/plus signs from phone number
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;
    const res  = await fetch(url);
    const body = await res.text();
    console.log(`📲 CallMeBot WhatsApp → Customer +${cleanPhone}: ${body.trim()}`);
  } catch (err) {
    console.error("CallMeBot WhatsApp Customer error:", err.message);
  }
}

function sendBookingWhatsAppNotifications(booking) {
  let serviceDate = "N/A";
  let serviceTime = "N/A";
  try {
    // Convert UTC time from DB to IST for display
    const d = new Date(booking.starts_at);
    serviceDate = d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "long", year: "numeric" });
    serviceTime = d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true });
  } catch (_) { /* ignore */ }

  const serviceName   = booking.service?.name ?? "Service";
  const customerName  = booking.customer?.name  ?? booking.customer_name ?? "Customer";
  const customerPhone = booking.customer?.phone  ?? "N/A";
  const serviceType   = booking.service_type === "salon" ? "Salon Visit" : "Home Visit";
  const paymentType   = booking.payment_type  === "online" ? "Online (Razorpay)" : "Cash After Service";
  const addressLine   = booking.address ? `\nAddress: ${booking.address}` : "";

  const adminMsg = [
    `🔔 *New Booking — Mani's Elite Makeover Studio*`,
    ``,
    `💅 *Service:* ${serviceName}`,
    `👤 *Customer:* ${customerName}`,
    `📞 *Phone:* ${customerPhone}`,
    `📅 *Date:* ${serviceDate}`,
    `⏰ *Time:* ${serviceTime}`,
    `🏷️ *Type:* ${serviceType}`,
    `💳 *Payment:* ${paymentType}`,
    addressLine,
    `✅ *Status:* Confirmed`,
  ].filter(Boolean).join("\n");

  // Auto-send to admin via CallMeBot (non-blocking)
  sendWhatsAppToAdmin(adminMsg).catch((e) => console.error("WhatsApp admin error:", e.message));

  // Auto-send to customer via CallMeBot (non-blocking)
  const customerMsg = [
    `🌸 *Booking Confirmed! Mani's Elite Makeover Studio*`,
    ``,
    `Hi ${customerName}, your appointment has been confirmed!`,
    ``,
    `💅 *Service:* ${serviceName}`,
    `📅 *Date:* ${serviceDate}`,
    `⏰ *Time:* ${serviceTime}`,
    `🏷️ *Type:* ${serviceType}`,
    `💳 *Payment:* ${paymentType}`,
    addressLine,
    ``,
    `Thank you for choosing us! See you soon. ✨`,
  ].filter(Boolean).join("\n");

  if (customerPhone && customerPhone !== "N/A") {
    sendWhatsAppToCustomer(customerPhone, customerMsg).catch((e) => console.error("WhatsApp customer error:", e.message));
  }

  console.log("\n─────────────────────────────────────────────────────");
  console.log("📲 WhatsApp notifications dispatched for booking:", booking._id || booking.id);
  console.log("   Customer:", customerName, "|", customerPhone);
  console.log("   Service: ", serviceName, "@", serviceTime, serviceDate);
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

  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const nowUtc = new Date(); // current moment (UTC on server)

  const slots = hours.map((hour) => {
    // Create the slot time as IST (UTC+5:30) to match what customers see
    const start = new Date(`${targetDate}T${String(hour).padStart(2, "0")}:00:00+05:30`);
    const end   = new Date(start.getTime() + service.duration_min * 60 * 1000);

    // Block if already booked by another user
    const isBookedByOther = existingBookings.some((b) => {
      const bStart = new Date(b.starts_at);
      const bEnd   = new Date(b.ends_at);
      return start < bEnd && end > bStart;
    });

    // Block if the slot time has already passed (can't book in the past)
    const isPast = start <= nowUtc;

    return {
      startsAtIso: start.toISOString(),
      endsAtIso:   end.toISOString(),
      // Label shown to user — always in IST regardless of server timezone
      label:       start.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true }),
      isBooked:    isBookedByOther || isPast,
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
  try {
    sendBookingWhatsAppNotifications(populated);
  } catch (e) {
    console.error("WhatsApp notification error (upi):", e.message);
  }
  res.json({ booking: populated });
});
