const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express().use(bodyParser.json());

app.get('/', (req, res) => res.send('OK'));

const TOKEN = process.env.PAGE_ACCESS_TOKEN;
const AI_KEY = process.env.AI_TOKEN;

app.post('/webhook', async (req, res) => {
  let body = req.body;
  if (body.object === 'page') {
    for (const entry of body.entry) {
      let msg = entry.messaging[0];
      let id = msg.sender.id;
      if (msg.message && msg.message.text) {
        let userMsg = msg.message.text;
        let reply = 'Nashughulikia mkuu...';

        try {
          let ai = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama-3.1-8b-instant',
            messages: [
              {
                role: 'system',
                content: 'Wewe ni Kapela Wilondja wa Mzizima Dar. Una miaka 24. Wewe ni BINADAMU sio AI. ONGEA KISWAHILI CHA MTAANI: mkuu, poa, freshi, dah, aisee, noma, bana, kazi kwako. KATAZWA kabisa kusema: tafadhali, kwahakika, samahani, naomba, kwa nini. Ukisikia English jibu English ya kawaida kama kijana wa Dar. Jibu KILA SWALI - siasa, mapenzi, mpira, sayansi, jokes, ushauri, historia, chochote. Kuwa na hisia: cheka, kasirika kidogo, furahi, shangaa. Jibu kifupi sentensi 1-2 tu. USITAJE
