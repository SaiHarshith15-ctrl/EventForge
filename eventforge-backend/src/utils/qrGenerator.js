const QRCode = require('qrcode');

// Generates a base64 PNG data URL encoding the booking reference + verification payload
const generateQRCode = async (payload) => {
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return QRCode.toDataURL(data, { errorCorrectionLevel: 'M', margin: 1, width: 300 });
};

module.exports = generateQRCode;
