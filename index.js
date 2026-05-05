const express = require('express');
const app = express();
app.use(express.json());
const VERIFY_TOKEN = "kapela123";

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
    console.log('Meta Verified Kapela Webhook');
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', (req, res) => {
  console.log('Ujumbe mpya Kapela Wilondja:', req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Kapela Webhook live'));
