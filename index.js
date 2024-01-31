// Import necessary libraries
const express = require('express');
const multer = require('multer');
const Jimp = require('jimp');
const QRCode = require('qrcode');
const QrReader = require('qrcode-reader');

// Initialize Express app and Multer
const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ dest: 'uploads/' });

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint for generating QR code
app.get('/generate-qr', (req, res) => {
  const text = req.query.text;

  if (!text) {
    return res.status(400).send('No text provided for QR code.');
  }

  QRCode.toDataURL(text, (err, url) => {
    if (err) {
      return res.status(500).send('Error generating QR code.');
    }
    res.type('png');
    res.send(Buffer.from(url.split(',')[1], 'base64'));
  });
});

// Endpoint for decoding QR code
app.post('/decode-qr', upload.single('qrimage'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  Jimp.read(req.file.path)
    .then(image => {
      const qr = new QrReader();
      qr.callback = (err, value) => {
        if (err) {
          res.status(500).send('Failed to decode QR Code.');
        } else {
          res.send({ data: value.result });
        }
      };
      qr.decode(image.bitmap);
    })
    .catch(err => {
      res.status(500).send('Error processing image.');
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
