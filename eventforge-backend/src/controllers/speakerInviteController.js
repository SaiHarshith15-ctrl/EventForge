const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const SpeakerInvite = require('../models/SpeakerInvite');
const Speaker = require('../models/Speaker');
const Event = require('../models/Event');
const notify = require('../utils/notify');

// @desc    Organizer invites a speaker to an event
// @route   POST /api/speaker-invites
// @access  Private/Organizer
const createInvite = asyncHandler(async (req, res) => {
  const { speakerId, eventId, session } = req.body;
  const speaker = await Speaker.findById(speakerId);
  const event = await Event.findById(eventId);
  if (!speaker) throw new ApiError(404, 'Speaker not found');
  if (!event) throw new ApiError(404, 'Event not found');
  if (event.organizer.toString() !== req.user._id.toString()) throw new ApiError(403, 'Not your event');

  const invite = await SpeakerInvite.create({
    speaker: speakerId, event: eventId, organizer: req.user._id, session: session || 'Keynote',
  });

  if (speaker.user) {
    await notify(req.app.get('io'), speaker.user, `New speaking invitation for "${event.name}".`, {
      type: 'speaker', relatedEvent: event._id,
    });
  }

  res.status(201).json({ success: true, message: 'Invitation sent', data: invite });
});

// @desc    List invites (organizer sees sent, speaker sees received)
// @route   GET /api/speaker-invites
// @access  Private
const getInvites = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role === 'organizer') query.organizer = req.user._id;
  if (req.user.role === 'speaker') {
    const mySpeaker = await Speaker.findOne({ user: req.user._id });
    query.speaker = mySpeaker ? mySpeaker._id : null;
  }
  const invites = await SpeakerInvite.find(query)
    .populate('speaker', 'name role company avatar')
    .populate('event', 'name date location')
    .populate('organizer', 'name email')
    .sort('-createdAt');
  res.json({ success: true, data: invites });
});

// @desc    Speaker accepts / rejects an invitation
// @route   PUT /api/speaker-invites/:id/respond
// @access  Private/Speaker
const respondToInvite = asyncHandler(async (req, res) => {
  const { status } = req.body; // accepted | rejected
  const invite = await SpeakerInvite.findById(req.params.id).populate('event').populate('speaker');
  if (!invite) throw new ApiError(404, 'Invite not found');

  const mySpeaker = await Speaker.findOne({ user: req.user._id });
  if (!mySpeaker || invite.speaker._id.toString() !== mySpeaker._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  invite.status = status;
  await invite.save();

  if (status === 'accepted') {
    const event = await Event.findById(invite.event._id);
    if (!event.speakers.includes(invite.speaker._id)) event.speakers.push(invite.speaker._id);
    event.speakerConfirmed = true;
    await event.save();
  }

  await notify(
    req.app.get('io'),
    invite.organizer,
    `Speaker ${status === 'accepted' ? 'confirmed' : 'declined'} for "${invite.event.name}".`,
    { type: 'speaker' }
  );

  res.json({ success: true, message: 'Response recorded', data: invite });
});

module.exports = { createInvite, getInvites, respondToInvite };
