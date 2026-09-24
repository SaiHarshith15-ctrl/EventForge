const Notification = require('../models/Notification');

// Creates a notification in the DB and emits it in real-time over Socket.io if available.
// `recipient` can be a userId, or an array of userIds for bulk notify.
const notify = async (io, recipient, text, opts = {}) => {
  const recipients = Array.isArray(recipient) ? recipient : [recipient];
  const docs = await Notification.insertMany(
    recipients.filter(Boolean).map((r) => ({
      recipient: r,
      text,
      type: opts.type || 'system',
      relatedEvent: opts.relatedEvent,
    }))
  );

  if (io) {
    docs.forEach((doc) => {
      io.to(`user:${doc.recipient}`).emit('notification', doc);
    });
  }
  return docs;
};

module.exports = notify;
