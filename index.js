const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express().use(bodyParser.json());

// Homepage ya UptimeRobot - INAZUIA BOT KULALA
app.get('/', (req, res) => {
  res.status(200).send('Kapela Bot is ALIVE 🔥');
});

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.post('/webhook', (req, res) => {
  let body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(function(entry) {
      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;

      if (webhook_event.message && webhook_event.message.text) {
        let userMessage = webhook_event.message.text.toLowerCase();
        let response;

        // AUTO-REPLY SMART
        if (userMessage.includes('mambo') || userMessage.includes('hello') || userMessage.includes('habari')) {
          response = { "text": "Salama vp hali yako uko? Karibu nikuhudumie mkuu 🔥" };
        }
        else if (userMessage.includes('niaje') || userMessage.includes('vipi') || userMessage.includes('poa')) {
          response = { "text": "Poa sana mkuu, wewe je? Unahitaji huduma gani leo?" };
        }
        else if (userMessage.includes('namba') || userMessage.includes('number') || userMessage.includes('whatsapp')) {
          response = { "text": "Namba yangu ya WhatsApp: +255762237432\nSave ukinikuta online tuongee zaidi" };
        }
        else if (userMessage.includes('asante') || userMessage.includes('thanks') || userMessage.includes('shukran')) {
          response = { "text": "Karibu sana mkuu 🙏\nNipo hapa kukusaidia wakati wowote" };
        }
        else if (userMessage.includes('miaka') || userMessage.includes('umri') || userMessage.includes('age')) {
          response = { "text": "Mimi ni kijana mwenye 23 mkuu 💪\nNina uzoefu wa miaka 4 kwenye content creation" };
        }
        else if (userMessage.includes('group') || userMessage.includes('kundi') || userMessage.includes('join')) {
          response = { "text": "Karibu kwenye group langu la WhatsApp mkuu\nBonyeza link: https://chat.whatsapp.com/yourlink\nAu niambie
