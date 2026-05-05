const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express().use(bodyParser.json());

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

        // === SALAMU & KUJULIANA HALI ===
        if (userMessage.includes('vp hali') || userMessage.includes('mambo') || userMessage.includes('habari') || userMessage.includes('sema')) {
          response = { "text": "Salama vp hali yako uko?\nKaribu nikuhudumie mkuu 🔥" };
        } 
        else if (userMessage.includes('niaje') || userMessage.includes('ukoje') || userMessage.includes('umeshindaje')) {
          response = { "text": "Poa sana mkuu, wewe je? Unahitaji huduma gani leo?" };
        }
        else if (userMessage.includes('poa') || userMessage.includes('safi') || userMessage.includes('nzuri')) {
          response = { "text": "Safi sana 💪\nNikusaidie nini leo?" };
        }
        
        // === KUHUSU WEWE & KAZI ===
        else if (userMessage.includes('kazi yako') || userMessage.includes('unafanya nini') || userMessage.includes('huduma') || userMessage.includes('unadeal na nini')) {
          response = { "text": "Mimi ni Content Creator na pia na manage wasanii.\nKama unahitaji kutengeneza content, kupiga picha, video, au management ya msanii niambie tu" };
        }
        else if (userMessage.includes('unapatikana wapi') || userMessage.includes('location') || userMessage.includes('upo wapi') || userMessage.includes('ofisi')) {
          response = { "text": "Napatikana Nyarugusu mkuu.\nKwa mawasiliano ya haraka: WhatsApp +255762237432" };
        }
        else if (userMessage.includes('namba') || userMessage.includes('contact') || userMessage.includes('mawasiliano') || userMessage.includes('whatsapp')) {
          response = { "text": "Namba yangu ya WhatsApp: +255762237432\nSave ukinikuta online tuongee zaidi 📱" };
        }
        else if (userMessage.includes('bei') || userMessage.includes('gharama') || userMessage.includes('lipa')) {
          response = { "text": "Bei inategemea na huduma unayotaka mkuu.\nNiambie unahitaji content gani nikupe ofa safi. Tuma 'huduma' uone list" };
        }

        // === SHUKRANI & KUAGA ===
        else if (userMessage.includes('asante') || userMessage.includes('shukran') || userMessage.includes('thanks')) {
          response = { "text": "Karibu sana mkuu 🙏\nNipo hapa kukuhudumia wakati wowote" };
        }
        else if (userMessage.includes('sawa') || userMessage.includes('poa') || userMessage.includes('fresh')) {
          response = { "text": "Sawa mkuu ✌️\nUkiwa tayari niambie tu" };
        }
        else if (userMessage.includes('baadaye') || userMessage.includes('tutaongea')) {
          response = { "text": "Sawa mkuu, nitakuwa hapa hapa.\nUsisite kurudi wakati wowote 🫡" };
        }

        // === DEFAULT ===
        else {
          response = { "text": `Nimekupata mkuu.\nKama unahitaji huduma ya content creation au management, niambie "huduma"\nAu tuma "namba" upate WhatsApp yangu` };
        }

        callSendAPI(sender_psid, response);
      }
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.get('/webhook', (req, res) => {
  let VERIFY_TOKEN = "kapela123";
  let mode = req.query['hub.mode'];
