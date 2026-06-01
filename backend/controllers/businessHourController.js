const asyncHandler = require("../utils/asyncHandler");
const BusinessHour = require("../models/BusinessHour");

exports.listBusinessHours = asyncHandler(async (req, res) => {
  let hours = await BusinessHour.find().sort({ weekday: 1 });
  if (hours.length === 0) {
    hours = await BusinessHour.insertMany(
      Array.from({ length: 7 }, (_, weekday) => ({
        weekday,
        open_time: "10:00",
        close_time: "20:00",
        is_open: true,
      })),
    );
  }
  res.json({ hours });
});

exports.upsertBusinessHour = asyncHandler(async (req, res) => {
  const hour = await BusinessHour.findOneAndUpdate({ weekday: req.body.weekday }, req.body, {
    new: true,
    upsert: true,
    runValidators: true,
  });
  res.json({ hour });
});
