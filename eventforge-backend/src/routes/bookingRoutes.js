const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  createOrder, verifyPayment, simulatePayment,
  getMyBookings, getBooking, downloadTicketPDF, cancelBooking, getEventBookings,
} = require('../controllers/bookingController');

router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/simulate-payment', protect, simulatePayment);

router.get('/my', protect, getMyBookings);
router.get('/event/:eventId', protect, authorize('organizer', 'admin', 'staff'), getEventBookings);
router.get('/:id', protect, getBooking);
router.get('/:id/pdf', protect, downloadTicketPDF);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
