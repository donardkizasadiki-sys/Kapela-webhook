const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const VERIFY_TOKEN = "kapela123";

app.use(bodyParser.json());

// HII NDIO META INATAFUTA
app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    console.log('Webhook verified');
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

// HII NDIO ITAPOKEA MESSAGES
app.post('/webhook', (req, res) => {
  console.log('Ujumbe umefika:', req.body);
  res.sendStatus(200);
});

// Homepage ya kawaida
app.get('/', (req, res) => {
  res.send('Kapela Webhook Iko Live');
});

app.listen(process.env.PORT || 3000, () => console.log('Server Live'));
