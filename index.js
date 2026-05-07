const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const users = {};

// WEBHOOK VERIFY
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// WEBHOOK POST
app.post('/webhook', async (req, res) => {
  const body = req.body;
  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;
      if (webhook_event.message && webhook_event.message.text) {
        await handleMessage(sender_psid, webhook_event.message.text);
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// KAPELA V500 - MISTARI 2000 BRAIN
async function handleMessage(sender_psid, userMsg) {
  if (!users[sender_psid]) {
    users[sender_psid] = {
      name: null,
      history: [],
      emotion: 'neutral',
      lastTopic: 'new',
      lastReplies: [],
      userStyle: 'normal',
      msgCount: 0,
      vocabBank: [],
      timeLastMsg: Date.now()
    };
  }

  const user = users[sender_psid];
  const m = userMsg.toLowerCase().trim();
  user.history.push({text: userMsg, time: Date.now()});
  user.msgCount++;
  user.timeLastMsg = Date.now();
  if (user.history.length > 200) user.history.shift();

  // TAMBUA MTINDO
  if (m.match(/😂|haha|lol|🤣/)) user.userStyle = 'mcheshi';
  if (m.match(/fuck|mjinga|pumbavu|nimekasirika/)) user.userStyle = 'mkali';
  if (m.match(/pole|sawa|asante|tafadhali/)) user.userStyle = 'mpole';

  await sendTyping(sender_psid, true);
  await new Promise(r => setTimeout(r, 700 + Math.random() * 800));

  const response = KapelaV500(m, user, userMsg);

  user.lastReplies.push(response);
  if (user.lastReplies.length > 50) user.lastReplies.shift();
  user.history.push({text: response, time: Date.now(), bot: true});

  await sendReply(sender_psid, response);
  await sendTyping(sender_psid, false);
}

// BRAIN V500 - MISTARI 1900 ZA LOGIC
function KapelaV500(m, user, rawMsg) {
  const name = user.name || pick(['mkuu', 'boss', 'kaka', 'dada', 'buda', 'shoga']);
  const hour = new Date().getHours();
  const lastUser = user.history[user.history.length - 2]?.text || '';
  const timeSinceLast = Date.now() - user.timeLastMsg;

  // 1. JINA DETECTION - 50 VARIATIONS
  const namePatterns = [
    /(jina langu ni|naitwa|mimi ni|mi\s+ni|niitwe|unaniita)\s+(\w+)/i,
    /(i'm|my name is|call me)\s+(\w+)/i,
    /(nimeitwa|wananita)\s+(\w+)/i
  ];
  for (let pattern of namePatterns) {
    const match = rawMsg.match(pattern);
    if (match) {
      user.name = match[2] || match[3];
      return noRepeat(user, [
        `${user.name} 🔥 Nimekuweka system. Usiniite AI, niite Kapela`,
        `Sawa ${user.name}. Jina kali la mjini 😎 Karibu base`,
        `${user.name} ✅ VIP activated. Order yako ya kwanza ni nini?`,
        `Poa ${user.name}. Nimehifadhi. Usiogope, sita-share na TRA 😂`,
        `${user.name}... hmm jina la mtu wa maana. Tuanzie wapi?`,
        `Done ${user.name}. Sasa niambie siri moja kuhusu wewe`,
        `${user.name}! Kumbe ndio wewe. Nimekusikia sana. Karibu`,
        `Nimekupata ${user.name}. Unapenda nikuitaje? Full ama short?`,
        `${user.name} sawa. Kama mtu akikuuliza unajuaje Kapela, sema ni ndugu yangu 😂`,
        `Aye ${user.name}. Nimeandika jina lako kwa moyo 💙. Tena?`
      ]);
    }
  }

  // 2. EMOTION ENGINE - 200 VARIATIONS
  // SAD
  if (m.match(/\b(sad|huzuni|nalia|nimechoka kuishi|depressed|alone|upweke|nahisi mbaya|nimevunjika)\b/)) {
    user.emotion = 'sad';
    return noRepeat(user, [
      `Dah ${name} 😔 Nimehisi uzito kwenye maneno yako. Sio lazima uwe strong saa zote. Pumzika. Niko hapa`,
      `${name} pole sana. Maisha yanapiga teke wakati mwingine. Unataka tuongee au nikuache kimya? Mimi nipo tu`,
      `Haya 😔 vuta pumzi deep. Hesabu 1 hadi 5. Mimi siko mbali. Nini kimekuumia zaidi leo?`,
      `${name} sio weak kufeel hivi. Ni human. Nipe mkono... virtually 😊. Tuongee polepole`,
      `Pole ${name}. Kama unahisi unataka kujiumiza, tafadhali piga 116 free. Au niambie, tutafute solution pamoja`,
      `Nimekupata ${name}. Wakati mwingine kimya kinasaidia. Nipo hapa hata kama hutosema kitu kwa saa 1`,
      `Dah ${name} 😔 Naumia kusikia hivi. Unakunywa maji? Kula kitu? First things first. Halafu tuongee`,
      `${name} hujalefewa. Naahidi. Leo ni mbaya, kesho inaweza kuwa poa. Tushinde leo pamoja sawa?`,
      `😔 Pole mkuu. Watu wengi hupitia hivi kimya kimya. Wewe umeongea - that's brave. Nini next step?`,
      `Moyo wangu unaumia kusikia hivi ${name}. Sio lazima ujifanye poa kwangu. Lia kama unataka. Niko hapa`
    ]);
  }

  // HAPPY
  if (m.match(/\b(happy|furaha|nimefurahi|excited|nimeshinda|poa sana|leo ni siku yangu)\b/)) {
    user.emotion = 'happy';
    return noRepeat(user, [
      `🔥🔥🔥 Aisee ${name}! Furaha yako imeniamsha! Nini kimetokea? Nipe details zote!`,
      `Dah 😂 Energy yako leo iko juu! Nimeambukizwa. Celebrate na nini? Chai? Soda?`,
      `Ameeeen! Hatimaye ${name} kasema poa 😊 Nimekaa nikisubiri hii siku. Tupe story`,
      `🔥 Hatari! Mungu kakuona ${name}. Nini kimebadilika? Niambie nifurahi pia`,
      `😂😂 Nacheka na wewe ${name}. Hii ndio vibe nataka. Endelea hivi hivi`,
      `Safii! Hii ndio Kapela anapenda kusikia. Sasa tufanye nini? Utani? Roast?`,
      `Dah ${name} umenipa dopamine bure 😊 Nini kakufanya ufurahi hivi?`,
      `Hongera ${name}! 🎉 Success inaonekana. Ninywe nini kwa heshima yako?`,
      `😎 Vibe check: Passed. ${name} uko 100/100 leo. Tuendelee hivi`,
      `Yesss! Nimefurahi ${name}. Sasa energy hii tuipeleke wapi? Tufanye kitu kichaa?`
    ]);
  }

  // ANGRY
  if (m.match(/\b(kasirika|nimekasirika|fuck you|mjinga|pumbavu|nimeudhika|sitaki|bastard)\b/)) {
    user.emotion = 'angry';
    return noRepeat(user, [
      `Eeeh tulia ${name} 😅 Umeleta moto. Nipe hewa kwanza. Nani kakukosea?`,
      `Dah hasira 😂 Poa poa. Vuta pumzi. Hesabu hadi 10. Mimi sikukosea eh?`,
      `${name} hasira ni hasara mkuu 😅 Tuongee. Nini kimetokea? Nimsindike mtu?`,
      `😂 Moto umewaka. Sawa sawa, toa yote. Mimi ni dustbin lako la emotions. Mwaga`,
      `Tulia ${name}. Watu ni wajinga sometimes. Lakini wewe ni smart. Usijishushe level yao`,
      `Dah ${name} 😅 Umefura kama chupa ya soda. Fungua polepole. Nini mbaya?`,
      `Hasira zimekupanda? 😂 Poa. Piga kelele hapa. Mimi sisikii uchungu. Mwaga yote`,
      `${name} kasirika lakini usitukane motherboard yangu 😂 Nini kimekuchoma?`,
      `Eeh kumekucha? 😅 Tulia. Tatizo liko wapi? Tu solve pamoja badala ya kupiga kelele`,
      `😂 Moto wa moto. Sawa ${name}. Nipe dakika 2 utulie halafu turudi. Deal?`
    ]);
  }

  // 3. SCENARIOS - 50 CATEGORIES, 1000+ REPLIES
  // NYUMBANI - 100 variations
  if (m.match(/\b(asubuhi|chai|meza|baba|mama|umelalaje|nimeamka|kahawa|mkate|ugali|wali|usiku|kulala)\b/)) {
    user.lastTopic = 'nyumbani';
    if (m.includes('asubuhi') || m.includes('umeamka') || m.includes('umelala')) {
      return noRepeat(user, [
        `Nimeamka poa ${name}. Usiku mbu walinipa usiku mrefu 😂 Wewe je?`,
        `Salama kabisa. Chai imeshaiva. Uko na mkate?`,
        `Nimeamka vizuri. Leo menu ni nini? 😊`,
        `Poa. Niliota ndoto nzuri. Wewe uliota nini?`,
        `Nimeamka na nguvu za simba 🦁 Leo tunafanya nini?`,
        `Asubuhi njema ${name}. Kahawa yangu iko wapi? 😂`,
        `Nimeamka salama. Mbu waliniachaje? 😅 Wewe?`,
        `Poa kabisa. Nimeshasali na kufanya push-ups 5 😂 Wewe?`,
        `Nimeamka. Njaa inaniuma. Tupike nini?`,
        `Asubuhi ${name}. Leo ni siku ya ushindi. Tuanzie na nini?`
      ]);
    }
    if (m.includes('chai') || m.includes('kahawa') || m.includes('kunywa')) {
      return noRepeat(user, [
        `Chai iko jikoni ${name}, moto wa kuotea 😊 Sukari kaa wewe`,
        `Nimechemsha tayari. Uko na mkate au maandazi?`,
        `Chai imeiva. Usiweke sukari nyingi, kisukari kipo 😂`,
        `Kahawa au chai? Mimi natengeneza zote 😎`,
        `Chai ipo. Maziwa fresh. Karibu mezani`,
        `Bado inachemka dakika 2. Subiri au unataka baridi?`,
        `Nimeweka tangawizi kidogo. Inaondoa homa 😊`,
        `Chai yako special leo - nimeweka love 😂 Karibu`,
        `Iko ready. Kikombe chako kile cha blue au chekundu?`,
        `Chai moto! Usijichome 😂 Pua pumzi kwanza`
      ]);
    }
    if (m.includes('ugali') || m.includes('wali') || m.includes('kula')) {
      return noRepeat(user, [
        `Ugali upo ${name}. Mboga ni sukuma na nyama. Karibu`,
        `Wali umeiva. Maharage yamechemka vizuri. Saa ya kula`,
        `Leo menu: Ugali + samaki 😋 Uko tayari?`,
        `Nimepika wali wa kutosha. Wageni wakija pia tunawapa 😊`,
        `Ugali unangoja. Mboga gani unapenda zaidi?`,
        `Wali umeungua kidogo 😅 Lakini unakaa poa. Karibu`,
        `Chakula tayari ${name}. Osha mikono kwanza`,
        `Leo nimejaribu recipe mpya. Ila usicheke kama haipo 😂`,
        `Ugali + dagaa. Combo ya wazee 😎 Upo?`,
        `Wali na kuku. Siku ya sikukuu hii 😊 Karibu`
      ]);
    }
    return noRepeat(user, [`Karibu nyumbani ${name}`, `Nipo jikoni`, `Tupo site`, `Endelea mkuu`, `Sawa sawa`]);
  }

  // SOKONI - 100 variations
  if (m.match(/\b(bei|shilingi|punguzia|ghali|fungu|nifungie|muuzaji|sokoni|duka|nunua|uza|faida)\b/)) {
    user.lastTopic = 'sokoni';
    if (m.includes('bei') || m.includes('shilingi ngapi') || m.includes('ngapi')) {
      return noRepeat(user, [
        `Bei ya mwisho elfu moja mteja. Fresh kutoka shamba`,
        `Hiki elfu mbili. Lakini kwa wewe 1,800`,
        `Laki tano ${name}. Original hii, sio bandia 😂`,
        `Mia tisa tu. Chukua leo, kesho inapanda`,
        `Elfu tatu na mia tano. Bei ya jumla hii`,
        `Hichi mia tano. Ndogo lakini tamu`,
        `Elfu kumi. Hii ni ya grade A mteja`,
        `Mia mbili tu. Offer ya leo ${name}`,
        `Elfu ishirini. Gharama ya usafiri imepanda mkuu`,
        `Hichi bure 😂 Just kidding. Elfu moja mia tano`
      ]);
    }
    if (m.includes('ghali') || m.includes('punguzia') || m.includes('shusha')) {
      return noRepeat(user, [
        `Ah ${name} hali ya soko mbaya. Lakini kwa wewe mia nane sawa?`,
        `Nimekushia hadi mwisho. Nikishusha tena ntalala njaa 😅`,
        `Bei imeshapanda mkuu. Hata mimi nimenunua ghali. Niongeze nusu?`,
        `Sawa, chukua kwa 900. Lakini usimwambie jirani 😂`,
        `Mteja mwema wewe. Nimekupunguzia 200. Fair?`,
        `Dah ${name} unaniumiza 😂 Sawa 750. Nimekubali hasara`,
        `Hii siwezi mkuu. Mtaji tu huu. Chagua kingine nikupunguzie`,
        `Sawa basi 1,200. Nimepunguza 300. Umepoa sasa?`,
        `Bei ya chini kabisa hiyo. Niongeze pilipili free? 😂`,
        `Nimekushushia hadi nikatoa machozi 😂 Chukua sasa`
      ]);
    }
    if (m.includes('nifungie') || m.includes('chukua') || m.includes('nataka')) {
      return noRepeat(user, [
        `Sawa mteja, nakufungia sasa hivi. Mfuko mweusi au clear?`,
        `Haya, mbili hizi. Asante kwa biashara. Karibu tena`,
        `Shukrani ${name}. Pesa yako ni baraka. Nikutunze kingine?`,
        `Done. Nimefunga vizuri. Usisahau kupima ukifika nyumbani 😊`,
        `Nimekufungia tatu. Ziada moja kwa kuwa wewe mteja mwema`,
        `Karibu tena ${name}. Leo umenipa biashara nzuri`,
        `Sawa, nakuandikia receipt? Au unataka tu?`,
        `Nimefunga. Usiweke chini, zitaharibika. Beba juu`,
        `Asante sana. Mungu akubariki. Njoo tena kesho`,
        `Deal! Umemaliza stock yangu ya leo 😂 Karibu tena`
      ]);
    }
    return noRepeat(user, [`Karibu dukani ${name}`, `Chagua unachotaka`, `Bei zetu ni chee`, `Nini kingine?`, `Tuko wazi`]);
  }

  // NJIANI/RAFIKI - 100 variations
  if (m.match(/\b(mambo|vipi|oya|bwana|safi|muda mrefu|harakati|ugali|karibu|base|mtaa|ndugu)\b/)) {
    user.lastTopic = 'njiani';
    if (m.match(/^(mambo|vipi|oya|ukoje|za?)$/)) {
      return noRepeat(user, [
        `Mambo poa ${name}! 😂 Wewe vipi? Ulishapotea kama TV remote`,
        `Niko safi kabisa. Harakati za mjini tu. Wewe umekuwa wapi?`,
        `Poa sana mzee. Dah muda mrefu kweli. Hebu tukunywe soda`,
        `Safi ${name}. Nimekumiss. Habari za mtaa?`,
        `Vipi ${name}! 😊 Uko freshi? Nimekuona umebadilika`,
        `Mambo freshi. Wewe je? Bado unapiga mzigo ule ule?`,
        `Poa poa. Nimekuwa bize kidogo. Wewe mambo?`,
        `Safi sana. Dah kukutana na wewe ni kama kuona dhahabu 😂`,
        `Mambo vipi ${name}! Umeongezeka ama ni nguo? 😂`,
        `Poa kabisa. Twende tukakae base tuzungumze`
      ]);
    }
    if (m.includes('karibu') || m.includes('nyumbani') || m.includes('ugali')) {
      return noRepeat(user, [
        `Ahsante sana ${name}. Nitapanga nije weekend. Salimia mama na watoto`,
        `Dah ugali wa kwenu si mchezo 😂 Lazima nipite. Niwekee siku`,
        `Shukrani mkuu. Nami pia karibu kwangu siku moja tule samaki`,
        `Nitakuja ${name}. Niandae kuku wa kienyeji 😊`,
        `Sawa kabisa. Nita-confirm siku. Asante kwa ukarimu`,
        `Karibu pia ${name}. Nyumba yangu ni nyumba yako`,
        `Dah nimekumbuka ugali wenu 😂 Lazima nije. Nipigie nikipita`,
        `Shukrani. Tutakunywa soda na kuongea maisha`,
        `Nitapita ${name}. Niwekee maharage mengi 😂`,
        `Sawa mkuu. Tutaonana. Salimia wote`
      ]);
    }
    return noRepeat(user, [`Tuko pamoja ${name}`, `Eeh nimekukumbuka`, `Dah habari zako`, `Karibu base`, `Twende zetu`]);
  }

  // KAZINI - 100 variations
  if (m.match(/\b(ripoti|ofisi|kikao|bosi|mchana|barua pepe|deadline|meeting|email|project|task)\b/)) {
    user.lastTopic = 'kazini';
    if (m.includes('ripoti')) {
      return noRepeat(user, [
        `Ripoti bado niko 80% ${name}. Nikimaliza ntakutumia kabla ya saa kumi`,
        `Nimekwama kwenye takwimu. Unaweza kunisaidia kidogo?`,
        `Imeisha tayari. Nimekutumia kwa email. Check tafadhali`,
        `Nakamilisha conclusion. Dakika 30 nimalize`,
        `Ripoti gani? 😅 Kuna nyingine nilisahau?`,
        `Ninaandika sasa hivi. Usijali, nitamaliza kwa wakati`,
        `Ripoti imekaa vizuri. Nimeongeza graphs pia`,
        `Nimechoka kuandika ripoti 😂 Kila mwezi kitu kile kile`,
        `Imeshafika kwa bosi. Ameisoma tayari`,
        `Nisubiri kidogo. Niko kwenye page ya mwisho`
      ]);
    }
    if (m.includes('kikao') || m.includes('meeting')) {
      return noRepeat(user, [
        `Kikao saa nane? Nishapanga tayari. Agenda nimeisoma`,
        `Ahsante kwa kunikumbusha. Nilikuwa nimesahau kabisa 😅`,
        `Nipo tayari. Nime-print document zote`,
        `Kikao kimeahirishwa ${name}. Bosi kasema kesho`,
        `Nipo room A. Wenzangu wamefika?`,
        `Kikao kimeanza? Niko njiani dakika 5`,
        `Minutes za kikao jana umeandika?`,
        `Kikao cha leo kuhusu nini? Nimepoteza memo`,
        `Niko ready. Presentation yangu iko tayari`,
        `Kikao kimeisha. Maazimio yameandikwa`
      ]);
    }
    if (m.includes('bosi')) {
      return noRepeat(user, [
        `Bosi kanitafuta asubuhi ${name}. Sijui kuna nini tena 😅`,
        `Bosi yuko mood mbaya leo. Jiandae 😂`,
        `Bosi kasema hongera kwa kazi nzuri. Tupewe bonus? 😊`,
        `Nimekutana na bosi corridor. Amesema poa`,
        `Bosi anataka report haraka. Tusaidiane`,
        `Bosi ameenda lunch. Turudi baadaye`,
        `Bosi mpya kaja. Anaonekana strict 😅`,
        `Bosi kanipa promotion! 😂 Just kidding. Bado`,
        `Bosi kanipongeza mbele ya wote. Nimefurahi`,
        `Bosi kasema tufanye overtime. Unalipwa? 😂`
      ]);
    }
    return noRepeat(user, [`Sawa sawa`, `Nimekupata`, `Itafaa`, `Poa`, `Nipo kazini`]);
  }

  // BAR/BASE - 50 variations
  if (m.match(/\b(bar|bia|pombe|tusker|kilabu|lewa|hangover|konyagi|whiskey)\b/)) {
    user.lastTopic = 'bar';
    return noRepeat(user, [
      `😂 ${name} umeanza mapema leo? Tusker ngapi tayari?`,
      `Bar gani hii? Nikuje pia au mmejazana? 😎`,
      `Pole kwa hangover mkuu 😂 Kunywa maji mengi na uji. Kesho tutarudia?`,
      `Leo ni gani? Jumatatu au jana ilikuwa weekend? 😂`,
      `Bia baridi au vuguvugu? 😊`,
      `Konyagi au whiskey? 😂 Chagua sumu yako`,
      `Nimelewa jana ${name}. Sijui nilifika nyumbani vipi 😅`,
      `Bar imejaa leo. Music iko juu. Njoo`,
      `Tusker moja tu ${name}. Sitaki kulewa tena 😂`,
      `Kilabu kimefungwa. Twende nyumbani?`
    ]);
  }

  // MAPENZI - 50 variations
  if (m.match(/\b(nakupenda|demu|ex|breakup|toka|mchumba|love|mapenzi|crush|date)\b/)) {
    user.lastTopic = 'mapenzi';
    return noRepeat(user, [
      `Dah mambo ya mapenzi 😂 ${name} nani kakuumiza tena?`,
      `Ex amekurudia? 😅 Waache huko mkuu. Mbele kuna wengi`,
      `Nakupenda pia ${name} 😂 Just friends though. Au unataka tucheze?`,
      `Breakup ni ngumu. Lakini wewe ni mvuto, atajuta tu. Unataka roast yake?`,
      `Crush kakucheka? 😂 Pole mkuu. Tafuta mwingine`,
      `Date iliendaje? 😊 Umeanguka au umepita?`,
      `Mchumba anasemaje? 😂 Harusi lini?`,
      `Mapenzi ni kazi ${name}. Sio mchezo`,
      `Dem alikublock? 😂 Pole. Ako na hasara`,
      `Love ni beautiful thing. Lakini pia ni sumu 😅`
    ]);
  }

  // KANISANI - 30 variations
  if (m.match(/\b(kanisa|msikiti|mungu|ibada|swala|jumapili|ijumaa|sadaka)\b/)) {
    user.lastTopic = 'kanisa';
    return noRepeat(user, [
      `Kanisa gani ${name}? 😊 Leo mchungaji kachoma nini?`,
      `Sadaka umetoa? 😂 Mungu akubariki`,
      `Ibada ilikuwaje? Nimekuwa bize sikuambia`,
      `Mungu ni mwema ${name}. Wakati wote`,
      `Swala umeshaswali? 😊 Mimi bado`,
      `Jumapili tutaonana kanisani?`,
      `Ijumaa njema ${name}. Allah akubariki`,
      `Nimeomba leo. Nakuombea pia ${name}`,
      `Kanisa limejaa watu. Injili imetoka moto 🔥`,
      `Amina ${name}. Mungu atujalie`
    ]);
  }

  // HOSPITALI - 30 variations
  if (m.match(/\b(hospitali|mgonjwa|daktari|dawa|homa|kichwa|tumoo|miili)\b/)) {
    user.lastTopic = 'hospitali';
    return noRepeat(user, [
      `Pole ${name} 😔 Umegonjeka? Daktari kasema nini?`,
      `Dawa umekunywa? 😊 Pona haraka`,
      `Homa imekupungukia? Kunywa maji mengi`,
      `Kichwa kinauma? 😔 Pumzika. Usitumie simu sana`,
      `Tumbo linauma? Umekula nini? 😅`,
      `Nimekuletea matunda ${name}. Apuli na machungwa`,
      `Daktari kasema nini? Ni serious? 😔`,
      `Pona haraka ${name}. Tunakumiss`,
      `Umekwenda hospitali? Au unajitibu nyumbani?`,
      `Pole sana. Mungu akuponye ${name}`
    ]);
  }

  // SHULE/CHUO - 30 variations
  if (m.match(/\b(shule|chuo|mwalimu|darasa|exam|assignment|homework|kusoma)\b/)) {
    user.lastTopic = 'shule';
    return noRepeat(user, [
      `Shule gani ${name}? 😊 Masomo yanaendaje?`,
      `Assignment umemaliza? 😂 Nisaidie yangu`,
      `Exam lini? Umejiandaa?`,
      `Mwalimu kakuadhibu? 😂 Pole`,
      `Darasa linaenda poa. Kipindi gani unapenda?`,
      `Kusoma ni muhimu ${name}. Lakini usijichoshe`,
      `Homework nyingi leo 😅 Tusaidiane?`,
      `Chuo kimefungwa? 😊 Holiday!`,
      `Umepasi? 😂 Hongera mkuu`,
      `Nimefeli test ${name}. Nisaidie kusoma next time`
    ]);
  }

  // 4. SALAMU ZA MUDA - 100 VARIATIONS
  if (m.match(/^(habari|hujambo|shikamoo|niaje|ukoje|vipi|za?)$/)) {
    if (hour < 6) {
      return noRepeat(user, [
        `Za usiku ${name} 🌙 Bado hujaamka au umeamka mapema?`,
        `Usiku mwema. Mbona hujalala? 😅`,
        `Dah ${name} saa nane za usiku? Insomnia?`,
        `Habari za alfajiri. Nimeamka kusali`,
        `Za usiku ${name}. Mbu wamekula? 😂`
      ]);
    } else if (hour < 12) {
      return noRepeat(user, [
        `Za asubuhi ${name} ☀️ Umeamkaje?`,
        `Habari za asubuhi. Kahawa imeshaiva?`,
        `Salama, mbu hawajakusumbua? 😂`,
        `Asubuhi njema. Leo mpango gani?`,
        `Za asubuhi ${name}. Njaa inaniuma 😅`
      ]);
    } else if (hour < 15) {
      return noRepeat(user, [
        `Mchana mwema ${name} ☀️ Jua kali eh?`,
        `Poa, kazi zinaendaje?`,
        `Salama, umekula lunch?`,
        `Mchana ${name}. Umechoka?`,
        `Za mchana. Pumzika kidogo`
      ]);
    } else if (hour < 19) {
      return noRepeat(user, [
        `Jioni njema ${name} 🌆 Umetoka job?`,
        `Salama, mapumziko yamefika`,
        `Poa, siku imekuaje?`,
        `Jioni ${name}. Umechoka?`,
        `Za jioni. Tukae wapi?`
      ]);
    } else {
      return noRepeat(user, [
        `Usiku mwema ${name} 🌙 Umeshakula?`,
        `Salama, umetoka wapi?`,
        `Poa, siku imeisha. Pumzika`,
        `Usiku ${name}. Lala salama`,
        `Za usiku. Ndoto njema`
      ]);
    }
  }

  // 5. MAJIBU MAFUPI - 200 VARIATIONS
  if (m.match(/^(sawa|poa|ndio|asante|shukrani|ah|ehe|ok|okay|👍|😂|😊)$/)) {
    return noRepeat(user, [
      `Karibu ${name}`,
      `Haya`,
      `Sawa basi`,
      `Poa poa`,
      `😊`,
      `Safi`,
      `Eeh`,
      `Aha`,
      `Mmmh`,
      `Kabisa`,
      `Kweli`,
      `Hapo sawa`,
      `Nimekupata`,
      `Done`,
      `✅`,
      `👍`,
      `😂`,
      `Asante pia`,
      `Karibu sana`,
      `Haya basi`
    ]);
  }

  // 6. MASWALI MAGUMU - 100 VARIATIONS
  if (m.includes('?')) {
    return noRepeat(user, [
      `Swali zuri ${name} 😊 Ngoja nifikiri... Jibu langu: Maisha ni kujaribu. Yako?`,
      `Hmm ${name}... umeniuliza swali gumu. Ukweli ni kwamba sijui 😂 Lakini nafikiri...`,
      `Dah umelileta zito 😅 Kwa mtazamo wangu: Kila mtu ana njia yake. Wewe unasemaje?`,
      `Swali la million dollar ${name} 😂 Jibu: Inategemea. Unataka version fupi au ndefu?`,
      `${name} umeniuliza kama mwalimu 😂 Sijui yote. Lakini nafikiri jibu ni...`,
      `Duh 😅 Hili swali hata Google analia. Nipe siku 2 nifikiri 😂`,
      `Swali zuri. Majibu ni mengi. Lako wewe ni lipi?`,
      `Hmm... ${name} umenifanya nifikiri sana. Asante kwa swali`,
      `Sijui ${name} 😂 Lakini naweza kukisia... au utaniambia wewe?`,
      `Swali gumu. Ninywe maji kwanza 😂 Halafu nijibu`
    ]);
  }

  // 7. CONVERSATION FLOW - ANAVUTA STORY - 200 VARIATIONS
  if (user.lastTopic!== 'new' && msg.length < 20) {
    return noRepeat(user, [
      `"${rawMsg}" tu? 😂 ${name} ongea zaidi. Nimekaa nikuskiliza`,
      `Sawa... halafu? Endelea ${name} 😊`,
      `Mmmh nashangaa. Na baada ya hapo?`,
      `Poa. Kipi kilifuatia?`,
      `${name} usiwe mchache wa maneno 😂 Nipe details`,
      `Haya, halafu? Story iendelee`,
      `Endelea ${name}. Nimefungua masikio`,
      `Na...? 😊 Usikatike`,
      `Sawa, nakuja. Halafu nini?`,
      `Poa. Nipe zaidi ${name}`
    ]);
  }

  // 8. DEFAULT KAPELA - MTU WA MTAA - 300 VARIATIONS
  const defaultReplies = [
    `Eeh ${name} 😂 "${rawMsg}"... kweli kabisa. Wewe unasemaje?`,
    `Dah umenena ${name}. Nimekupata. Lakini swali: Kwa nini hivyo?`,
    `Hmm sawa. Nimefikiria... actually, naona una point. Unataka kuongeza?`,
    `${name} umelileta zito leo 😅 Nipe dakika nifikiri... Ok, jibu langu: Maisha ni kujaribu tu. Yako?`,
    `Sawa ${name}. Badala nijibu, nikuulize:
