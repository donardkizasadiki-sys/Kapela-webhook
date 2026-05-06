const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express().use(bodyParser.json());

app.get('/',(r,s)=>s.send('OK'));

const TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.post('/webhook',(req,res)=>{
  let b=req.body;
  if(b.object==='page'){
    b.entry.forEach(e=>{
      let m=e.messaging[0];
      let id=m.sender.id;
      if(m.message && m.message.text){
        let t=m.message.text.toLowerCase();
        let r={text:"Nimekupata mkuu"};
        if(t.includes('mambo'))r={text:"Salama vp mkuu"};
        if(t.includes('namba'))r={text:"WhatsApp: +255762237432"};
        if(t.includes('bei'))r={text:"Bei kuanzia 20k"};
        axios.post(
          `https://graph.facebook.com/v18.0/me/messages?access_token=${TOKEN}`,
          {recipient:{id:id},message:r}
        ).catch(e=>console.log(e));
      }
    });
    res.sendStatus(200);
  }else res.sendStatus(404);
});

app.get('/webhook',(q,s)=>{
  let v="kapela123";
  if(q.query['hub.mode']&&q.query['hub.verify_token']===v)
    s.status(200).send(q.query['hub.challenge']);
  else s.sendStatus(403);
});

app.listen(process.env.PORT||3000);
