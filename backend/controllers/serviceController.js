const asyncHandler = require("../utils/asyncHandler");
const Service = require("../models/Service");

exports.listServices = asyncHandler(async (req, res) => {
  const filter = req.query.all === "true" ? {} : { is_active: true };
  const services = await Service.find(filter).sort({ createdAt: -1 });
  res.json({ services });
});

exports.getService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }
  res.json({ service });
});

exports.createService = asyncHandler(async (req, res) => {
  const imageUrl = req.file ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}` : req.body.image_url;
  const service = await Service.create({ ...req.body, image_url: imageUrl });
  res.status(201).json({ service });
});

exports.updateService = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (req.file) {
    updateData.image_url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  }
  const service = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }
  res.json({ service });
});

exports.deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }
  res.status(204).send();
});
