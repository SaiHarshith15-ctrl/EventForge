const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const Speaker = require('../models/Speaker');
const uploadBufferToCloudinary = require('../utils/uploadToCloudinary');

const getSpeakers = asyncHandler(async (req, res) => {
  const { search = '', expertise, availability, page = 1, limit = 20 } = req.query;
  const query = {};
  if (expertise) query.expertise = expertise;
  if (availability) query.availability = availability;
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [speakers, total] = await Promise.all([
    Speaker.find(query).sort('-createdAt').skip(skip).limit(Number(limit)),
    Speaker.countDocuments(query),
  ]);
  res.json({ success: true, data: speakers, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
});

const getSpeaker = asyncHandler(async (req, res) => {
  const speaker = await Speaker.findById(req.params.id);
  if (!speaker) throw new ApiError(404, 'Speaker not found');
  res.json({ success: true, data: speaker });
});

// @desc    Create own speaker profile (self-serve) or admin creates one
// @route   POST /api/speakers
// @access  Private/Speaker,Admin
const createSpeaker = asyncHandler(async (req, res) => {
  const existing = await Speaker.findOne({ user: req.user._id });
  if (existing) throw new ApiError(409, 'Speaker profile already exists');

  const { name, role, company, expertise, bio, socialLinks } = req.body;
  const speaker = await Speaker.create({
    user: req.user._id,
    name: name || req.user.name,
    role, company, bio, socialLinks,
    expertise: Array.isArray(expertise) ? expertise : String(expertise || '').split(',').map((s) => s.trim()).filter(Boolean),
  });
  res.status(201).json({ success: true, message: 'Speaker profile created', data: speaker });
});

const updateMySpeakerProfile = asyncHandler(async (req, res) => {
  const speaker = await Speaker.findOne({ user: req.user._id });
  if (!speaker) throw new ApiError(404, 'Speaker profile not found. Create one first.');

  const allowed = ['name', 'role', 'company', 'bio', 'socialLinks', 'availability'];
  allowed.forEach((f) => { if (req.body[f] !== undefined) speaker[f] = req.body[f]; });
  if (req.body.expertise !== undefined) {
    speaker.expertise = Array.isArray(req.body.expertise)
      ? req.body.expertise
      : String(req.body.expertise).split(',').map((s) => s.trim()).filter(Boolean);
  }
  await speaker.save();
  res.json({ success: true, message: 'Speaker profile updated', data: speaker });
});

const updateAvailability = asyncHandler(async (req, res) => {
  const speaker = await Speaker.findOne({ user: req.user._id });
  if (!speaker) throw new ApiError(404, 'Speaker profile not found');
  speaker.availability = req.body.availability === 'Busy' ? 'Busy' : 'Available';
  await speaker.save();
  res.json({ success: true, message: 'Availability updated', data: speaker });
});

const uploadSpeakerAvatar = asyncHandler(async (req, res) => {
  const speaker = await Speaker.findOne({ user: req.user._id });
  if (!speaker) throw new ApiError(404, 'Speaker profile not found');
  if (!req.file) throw new ApiError(400, 'No image provided');
  const result = await uploadBufferToCloudinary(req.file.buffer, 'eventforge/speakers');
  speaker.avatar = result.secure_url;
  await speaker.save();
  res.json({ success: true, message: 'Avatar updated', data: speaker });
});

const deleteSpeaker = asyncHandler(async (req, res) => {
  const speaker = await Speaker.findById(req.params.id);
  if (!speaker) throw new ApiError(404, 'Speaker not found');
  if (speaker.user?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  await speaker.deleteOne();
  res.json({ success: true, message: 'Speaker profile deleted' });
});

module.exports = {
  getSpeakers, getSpeaker, createSpeaker, updateMySpeakerProfile,
  updateAvailability, uploadSpeakerAvatar, deleteSpeaker,
};
