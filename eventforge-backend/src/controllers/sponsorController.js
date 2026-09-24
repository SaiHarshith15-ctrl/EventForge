const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const Sponsor = require('../models/Sponsor');

const getSponsors = asyncHandler(async (req, res) => {
  const { tier, page = 1, limit = 20 } = req.query;
  const query = {};
  if (tier) query.tier = tier;
  const skip = (Number(page) - 1) * Number(limit);
  const [sponsors, total] = await Promise.all([
    Sponsor.find(query).sort('-createdAt').skip(skip).limit(Number(limit)),
    Sponsor.countDocuments(query),
  ]);
  res.json({ success: true, data: sponsors, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
});

const getSponsor = asyncHandler(async (req, res) => {
  const sponsor = await Sponsor.findById(req.params.id);
  if (!sponsor) throw new ApiError(404, 'Sponsor not found');
  res.json({ success: true, data: sponsor });
});

const createSponsor = asyncHandler(async (req, res) => {
  const existing = await Sponsor.findOne({ user: req.user._id });
  if (existing) throw new ApiError(409, 'Sponsor profile already exists');
  const { name, tier, budget, benefits, contactEmail } = req.body;
  const sponsor = await Sponsor.create({
    user: req.user._id,
    name: name || req.user.company || req.user.name,
    tier, budget, contactEmail: contactEmail || req.user.email,
    benefits: Array.isArray(benefits) ? benefits : String(benefits || '').split(',').map((s) => s.trim()).filter(Boolean),
  });
  res.status(201).json({ success: true, message: 'Sponsor profile created', data: sponsor });
});

const updateMySponsorProfile = asyncHandler(async (req, res) => {
  const sponsor = await Sponsor.findOne({ user: req.user._id });
  if (!sponsor) throw new ApiError(404, 'Sponsor profile not found. Create one first.');
  const allowed = ['name', 'tier', 'budget', 'contactEmail', 'logo'];
  allowed.forEach((f) => { if (req.body[f] !== undefined) sponsor[f] = req.body[f]; });
  if (req.body.benefits !== undefined) {
    sponsor.benefits = Array.isArray(req.body.benefits)
      ? req.body.benefits
      : String(req.body.benefits).split(',').map((s) => s.trim()).filter(Boolean);
  }
  await sponsor.save();
  res.json({ success: true, message: 'Sponsor profile updated', data: sponsor });
});

const deleteSponsor = asyncHandler(async (req, res) => {
  const sponsor = await Sponsor.findById(req.params.id);
  if (!sponsor) throw new ApiError(404, 'Sponsor not found');
  if (sponsor.user?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  await sponsor.deleteOne();
  res.json({ success: true, message: 'Sponsor profile deleted' });
});

module.exports = { getSponsors, getSponsor, createSponsor, updateMySponsorProfile, deleteSponsor };
