const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const Event = require('../models/Event');
const uploadBufferToCloudinary = require('../utils/uploadToCloudinary');

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const fields = ['name', 'phone', 'city', 'company', 'bio'];
  const updates = {};
  fields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, message: 'Profile updated', data: user.toSafeObject() });
});

// @desc    Upload/update avatar
// @route   PUT /api/users/avatar
// @access  Private
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image file provided');
  const result = await uploadBufferToCloudinary(req.file.buffer, 'eventforge/avatars');
  const user = await User.findByIdAndUpdate(req.user._id, { avatar: result.secure_url }, { new: true });
  res.json({ success: true, message: 'Avatar updated', data: user.toSafeObject() });
});

// @desc    Save / unsave an event (wishlist)
// @route   PUT /api/users/saved-events/:eventId
// @access  Private
const toggleSavedEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');

  const user = await User.findById(req.user._id);
  const idx = user.savedEvents.findIndex((id) => id.toString() === eventId);
  let saved;
  if (idx > -1) {
    user.savedEvents.splice(idx, 1);
    saved = false;
  } else {
    user.savedEvents.push(eventId);
    saved = true;
  }
  await user.save();
  res.json({ success: true, message: saved ? 'Event saved' : 'Event removed from saved', data: { saved } });
});

// @desc    Get own saved events
// @route   GET /api/users/saved-events
// @access  Private
const getSavedEvents = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'savedEvents',
    match: { isPublished: true },
  });
  res.json({ success: true, data: user.savedEvents });
});

// ---------- Admin ----------

// @desc    List all users (search, filter by role, paginate)
// @route   GET /api/users
// @access  Private/Admin
const listUsers = asyncHandler(async (req, res) => {
  const { search = '', role, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: users.map((u) => u.toSafeObject()),
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, data: user.toSafeObject() });
});

// @desc    Suspend / unsuspend a user
// @route   PUT /api/users/:id/suspend
// @access  Private/Admin
const toggleSuspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.isSuspended = !user.isSuspended;
  await user.save();
  res.json({ success: true, message: user.isSuspended ? 'User suspended' : 'User reinstated', data: user.toSafeObject() });
});

// @desc    Change a user's role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, message: 'Role updated', data: user.toSafeObject() });
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, message: 'User deleted' });
});

module.exports = {
  updateProfile,
  updateAvatar,
  toggleSavedEvent,
  getSavedEvents,
  listUsers,
  getUser,
  toggleSuspendUser,
  changeUserRole,
  deleteUser,
};
