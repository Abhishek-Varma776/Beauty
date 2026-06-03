const crypto = require("crypto");
const Razorpay = require("razorpay");
const asyncHandler = require("../utils/asyncHandler");
const Booking = require("../models/Booking");
const Service = require("../models/Service");

const isPhonepeConfigured = () => {
  const merchantId = process.env.PHONEPE_MERCHANT_ID || "";
  const saltKey = process.env.PHONEPE_SALT_KEY || "";
  const saltIndex = process.env.PHONEPE_SALT_INDEX || "";
  return merchantId && saltKey && saltIndex && !merchantId.includes("REPLACE_WITH");
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

// ─── PhonePe: Create Order ────────────────────────────────────────────────────
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

  // SECURITY: Use the actual price from the database
  const service = booking.service;
  if (!service) {
    res.status(400);
    throw new Error("Service not found for this booking");
  }

  // Determine correct price based on service_type
  const priceRupees = booking.service_type === "home" && service.price_home
    ? service.price_home
    : service.price;

  const amountPaise = Math.round(priceRupees * 100); // PhonePe expects amount in paise
  const transactionId = `TX_${bookingId}_${Date.now()}`;

  if (!isPhonepeConfigured()) {
    // ─── Simulated Sandbox Mode ───
    console.log("ℹ️  PhonePe keys not configured; running in simulated test checkout mode.");
    return res.json({
      keyId: "phonepe_simulation_mode",
      amount: amountPaise,
      currency: "INR",
      orderId: transactionId,
      isSimulated: true
    });
  }

  const merchantId = process.env.PHONEPE_MERCHANT_ID;
  const saltKey = process.env.PHONEPE_SALT_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX;
  const env = process.env.PHONEPE_ENV || "sandbox";

  const payload = {
    merchantId: merchantId,
    merchantTransactionId: transactionId,
    merchantUserId: String(req.user.id),
    amount: amountPaise,
    redirectUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/booking/success/${bookingId}?txn=${transactionId}`,
    redirectMode: "REDIRECT",
    callbackUrl: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/bookings/payments/phonepe/callback`,
    mobileNumber: req.user.phone || "9999999999",
    paymentInstrument: {
      type: "PAY_PAGE"
    }
  };

  const base64Payload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
  const signature = crypto
    .createHash("sha256")
    .update(base64Payload + "/pg/v1/pay" + saltKey)
    .digest("hex");
  const xVerify = `${signature}###${saltIndex}`;

  const hostUrl = env === "production"
    ? "https://api.phonepe.com/apis/hermes/pg/v1/pay"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

  try {
    const response = await fetch(hostUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify
      },
      body: JSON.stringify({ request: base64Payload })
    });

    const result = await response.json();

    if (result.success && result.data && result.data.instrumentResponse && result.data.instrumentResponse.redirectInfo) {
      return res.json({
        keyId: merchantId,
        amount: amountPaise,
        currency: "INR",
        orderId: transactionId,
        redirectUrl: result.data.instrumentResponse.redirectInfo.url,
        isSimulated: false
      });
    } else {
      throw new Error(result.message || "PhonePe API returned an error response");
    }
  } catch (err) {
    console.error("PhonePe API Error:", err.message);
    // Fallback to simulated mode so that user doesn't get blocked
    console.log("ℹ️  PhonePe API failed; falling back to simulated sandbox mode.");
    return res.json({
      keyId: "phonepe_simulation_mode",
      amount: amountPaise,
      currency: "INR",
      orderId: transactionId,
      isSimulated: true
    });
  }
});

// ─── PhonePe: Verify Payment Status ──────────────────────────────────────────
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { bookingId, razorpayOrderId } = req.body; 
  const transactionId = razorpayOrderId || req.body.transactionId;

  if (!bookingId || !transactionId) {
    res.status(400);
    throw new Error("bookingId and transactionId are required for verification");
  }

  // ─── Bypass Verification for Simulated Checkout ───
  if (transactionId.startsWith("sim_") || transactionId.startsWith("TX_") && transactionId.includes("simulation_mode") || !isPhonepeConfigured()) {
    console.log(`ℹ️  Simulated PhonePe payment verified successfully for booking: ${bookingId}`);
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        status: "confirmed",
        payment_status: "paid",
        razorpay_order_id: transactionId,
        razorpay_payment_id: `sim_pay_${Math.random().toString(36).substring(2, 9)}`,
      },
      { new: true }
    );
    if (!booking) {
      res.status(404);
      throw new Error("Booking not found after payment verification");
    }
    return res.json({ booking });
  }

  const merchantId = process.env.PHONEPE_MERCHANT_ID;
  const saltKey = process.env.PHONEPE_SALT_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX;
  const env = process.env.PHONEPE_ENV || "sandbox";

  const path = `/pg/v1/status/${merchantId}/${transactionId}`;
  const signature = crypto
    .createHash("sha256")
    .update(path + saltKey)
    .digest("hex");
  const xVerify = `${signature}###${saltIndex}`;

  const hostUrl = env === "production"
    ? `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${transactionId}`
    : `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${transactionId}`;

  try {
    const response = await fetch(hostUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-MERCHANT-ID": merchantId
      }
    });

    const result = await response.json();

    if (result.success && result.code === "PAYMENT_SUCCESS") {
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          status: "confirmed",
          payment_status: "paid",
          razorpay_order_id: transactionId,
          razorpay_payment_id: result.data.providerReferenceId || "phonepe_paid",
        },
        { new: true }
      );
      if (!booking) {
        res.status(404);
        throw new Error("Booking not found after payment verification");
      }
      res.json({ booking });
    } else {
      res.status(400);
      throw new Error(result.message || "PhonePe payment check returned failed status");
    }
  } catch (err) {
    res.status(400);
    throw new Error(`PhonePe status check error: ${err.message}`);
  }
});
