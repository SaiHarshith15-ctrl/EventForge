const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const Venue = require('../models/Venue');
const uploadBufferToCloudinary = require('../utils/uploadToCloudinary');

// @desc    List / search venues
// @route   GET /api/venues
// @access  Public
const getVenues = asyncHandler(async (req, res) => {
  const { search = '', location, minCapacity, maxPrice, owner, page = 1, limit = 20 } = req.query;
  const query = { isActive: true };
  if (owner) query.owner = owner;
  if (location) query.location = new RegExp(location, 'i');
  if (minCapacity) query.capacity = { $gte: Number(minCapacity) };
  if (maxPrice) query.pricePerDay = { ...(query.pricePerDay || {}), $lte: Number(maxPrice) };
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [venues, total] = await Promise.all([
    Venue.find(query).populate('owner', 'name email').sort('-createdAt').skip(skip).limit(Number(limit)),
    Venue.countDocuments(query),
  ]);

  res.json({ success: true, data: venues, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
});

const getVenue = asyncHandler(async (req, res) => {
  const venue = await Venue.findById(req.params.id).populate('owner', 'name email');
  if (!venue) throw new ApiError(404, 'Venue not found');
  res.json({ success: true, data: venue });
});

// @desc    Create a venue listing
// @route   POST /api/venues
// @access  Private/VenueOwner,Admin
const createVenue = asyncHandler(async (req, res) => {
  const { name, location, address, capacity, pricePerDay, amenities, description } = req.body;
  if (!name || !location || !capacity || !pricePerDay) {
    throw new ApiError(400, 'name, location, capacity and pricePerDay are required');
  }
  const venue = await Venue.create({
    name, location, address, capacity, pricePerDay, description,
    amenities: Array.isArray(amenities) ? amenities : String(amenities || '').split(',').map((s) => s.trim()).filter(Boolean),
    owner: req.user._id,
  });
  res.status(201).json({ success: true, message: 'Venue added', data: venue });
});

const updateVenue = asyncHandler(async (req, res) => {
  const venue = await Venue.findById(req.params.id);
  if (!venue) throw new ApiError(404, 'Venue not found');
  if (venue.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  const allowed = ['name', 'location', 'address', 'capacity', 'pricePerDay', 'amenities', 'description', 'isActive'];
  allowed.forEach((f) => { if (req.body[f] !== undefined) venue[f] = req.body[f]; });
  await venue.save();
  res.json({ success: true, message: 'Venue updated', data: venue });
});

const uploadVenueImage = asyncHandler(async (req, res) => {
  const venue = await Venue.findById(req.params.id);
  if (!venue) throw new ApiError(404, 'Venue not found');
  if (venue.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  if (!req.file) throw new ApiError(400, 'No image provided');
  const result = await uploadBufferToCloudinary(req.file.buffer, 'eventforge/venues');
  venue.images.push(result.secure_url);
  if (!venue.coverImage) venue.coverImage = result.secure_url;
  await venue.save();
  res.json({ success: true, message: 'Image uploaded', data: venue });
});

const deleteVenue = asyncHandler(async (req, res) => {
  const venue = await Venue.findById(req.params.id);
  if (!venue) throw new ApiError(404, 'Venue not found');
  if (venue.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  await venue.deleteOne();
  res.json({ success: true, message: 'Venue deleted' });
});

module.exports = { getVenues, getVenue, createVenue, updateVenue, uploadVenueImage, deleteVenue };
