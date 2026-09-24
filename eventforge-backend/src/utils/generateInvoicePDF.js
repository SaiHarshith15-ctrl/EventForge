const PDFDocument = require('pdfkit');

// Streams a simple ticket/invoice PDF directly to the HTTP response
const streamTicketPDF = (res, { booking, event, qrDataUrl }) => {
  const doc = new PDFDocument({ size: 'A5', margin: 40 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=ticket-${booking.bookingRef}.pdf`);

  doc.pipe(res);

  doc.fontSize(20).fillColor('#2563eb').text('EventForge', { align: 'left' });
  doc.moveDown(0.3);
  doc.fontSize(14).fillColor('#0f172a').text(event.name, { align: 'left' });
  doc.moveDown(0.8);

  doc.fontSize(10).fillColor('#64748b');
  doc.text(`Date: ${new Date(event.date).toDateString()}  |  Time: ${event.time}`);
  doc.text(`Location: ${event.location}`);
  doc.moveDown(0.5);
  doc.text(`Booking ID: ${booking.bookingRef}`);
  doc.text(`Ticket: ${booking.ticketTypeName} x ${booking.quantity}`);
  doc.text(`Attendee: ${booking.attendeeName || ''}`);
  doc.text(`Amount Paid: Rs. ${booking.totalAmount}`);
  doc.moveDown(1);

  if (qrDataUrl) {
    const base64 = qrDataUrl.split(',')[1];
    const imgBuffer = Buffer.from(base64, 'base64');
    doc.image(imgBuffer, { fit: [150, 150], align: 'center' });
  }

  doc.moveDown(1);
  doc.fontSize(8).fillColor('#94a3b8').text('Present this ticket (QR code) at the venue entrance for check-in.', { align: 'center' });

  doc.end();
};

module.exports = streamTicketPDF;
