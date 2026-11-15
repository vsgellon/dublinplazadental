// Dublin Plaza Dental concierge chat: front end prototype only.
// Everything runs in the browser. There are no fetch or XHR calls and nothing is sent or stored.
// Voice input uses the browser Web Speech API when available. In Chrome, that API may send
// audio to the browser vendor's speech service. This matters for a dental practice before launch.
(function(){
  'use strict';
  var d=document;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PHONE='(925) 833-9800', TEL='tel:+19258339800', EMAIL='dublinplazadental@sbcglobal.net';

  // ---------- Answers: only facts already on the prototype pages ----------
  var A={
    hours:['The office is open Monday, Tuesday, Thursday, and Friday, 9am to 6pm. Saturday is by appointment.',
      '<span class="small">Wednesday and Sunday are not listed on the current site yet. The practice will confirm those hours.</span>'],
    services:['Dr. Desai offers restorative, cosmetic, and preventative care, all in one office.',
      '<b>Restorative:</b> fillings, same day crowns, root canals, extractions, and implants, bridges, and dentures.<br><b>Cosmetic:</b> teeth whitening, bonded veneers, bonding, and Invisalign for teens and adults.<br><b>Preventative:</b> comprehensive exams, regular cleanings, digital X rays, and sealants.',
      '<a href="services.html">See all services</a>'],
    crowns:['Crowns and onlays can be made in the office in one visit with CEREC. Your tooth is scanned in 3D, the crown is designed and made in the office, then placed the same day.',
      'That means no temporary to wear and no second appointment. Emax and zirconia are the two main materials.',
      '<span class="small">Technology details are adapted from the current site and will be confirmed by the practice.</span>'],
    insurance:['The office works with most dental plans and PPOs. For patients without insurance, the team is happy to discuss ways it might help.',
      'To check your specific plan, please call '+telLink()+'.'],
    directions:['The office is at 7792 Dublin Boulevard, Dublin, CA 94568, on Dublin Boulevard between Golden Gate Street and Regional Street.',
      'From BART, exit West Dublin/Pleasanton station and walk north over the pedestrian overpass, then follow signs for Dublin Boulevard. The office is in the back corner of a shopping center behind Mancini\u2019s Sleepworld.',
      '<a href="contact.html#directions">See directions</a>'],
    call:['You can reach the office at '+telLink()+', or write to <a href="mailto:'+EMAIL+'">'+EMAIL+'</a>.',
      '<span class="small">Phone hours follow office hours: Monday, Tuesday, Thursday, and Friday, 9am to 6pm.</span>'],
    doctor:['Dr. Tejas S. Desai graduated from the UCSF School of Dentistry in 1998 and has cared for patients of all ages in the Tri\u2011Valley since 2003.',
      'He is also an Invisalign certified provider. <a href="about.html">Read more about Dr. Desai</a>'],
    invisalign:['Dr. Desai is an Invisalign certified provider, offering Invisalign for teens and adults.','Would you like to request a visit to talk it through?'],
    forms:['New patient forms can be filled out securely from home before your first visit.','<a href="new-patients.html#forms">Find the patient forms</a>'],
    exam:['A first comprehensive exam looks at the whole mouth, visually and with periodic X rays, and includes a simple oral cancer screening. Treatment options are explained if needed.'],
    clinical:['I\u2019m not able to give medical or dental advice here. Please call the office at '+telLink()+' so the team can help.',
      '<span class="small">If this is an emergency, call 911. Please don\u2019t share health details in this chat.</span>'],
    price:['I can\u2019t share prices here. The team is happy to talk through costs and insurance by phone at '+telLink()+'.'],
    avail:['I can\u2019t see the office schedule. You can send a visit request and the office will call to confirm a time, or call '+telLink()+'.'],
    unknown:['I\u2019m not sure about that one, and I\u2019d rather not guess. The team can help at '+telLink()+'.']
  };
  function telLink(){return '<a href="'+TEL+'">'+PHONE+'</a>';}

  var QUICK=[['book','Book an appointment'],['hours','Hours'],['directions','Location'],['insurance','Insurance'],['services','Services']];
  var LABEL={book:'Book an appointment',hours:'Hours',directions:'Location',insurance:'Insurance',services:'Services',more:'Other questions'};

  // Keyword matching, checked in order. Clinical and price come first so they never fall into a general answer.
  var RULES=[
    ['clinical',/\b(pain|hurt|hurts|ache|aching|toothache|bleed|bleeding|swell|swollen|swelling|emergenc|infect|abscess|fever|medic|antibiotic|prescri|pregnan|diagnos|symptom|numb|sensitive|cracked|chipped|broke|knocked|should i|is it normal|bump|lump|sore)\b/],
    ['price',/\b(price|prices|cost|costs|how much|fee|fees|charge|cheap|expensive|\$)/],
    ['avail',/\b(available|availability|opening|openings|slot|slots|today|tomorrow|this week|next week|soonest|earliest|walk in|walk-in)\b/],
    ['book',/\b(book|booking|appointment|appt|schedule|reserve|request a visit|make a visit|come in|new patient exam)\b/],
    ['crowns',/\b(crown|crowns|cerec|onlay|onlays|inlay|same day|one visit|emax|zirconia)\b/],
    ['invisalign',/\b(invisalign|aligner|aligners|straighten|braces)\b/],
    ['insurance',/\b(insurance|insured|ppo|plan|plans|coverage|cover|covered|delta|dental plan|pay|payment|uninsured)\b/],
    ['hours',/\b(hour|hours|open|opens|close|closed|closing|when|monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekend)\b/],
    ['directions',/\b(where|address|location|located|direction|directions|bart|train|map|find you|get there|dublin boulevard|blvd)\b/],
    ['call',/\b(phone|call|number|email|e-mail|contact|reach)\b/],
    ['forms',/\b(form|forms|paperwork|hipaa)\b/],
    ['exam',/\b(exam|checkup|check up|first visit|screening)\b/],
    ['doctor',/\b(dr|doctor|desai|dentist|who|ucsf|experience|qualified|background)\b/],
    ['services',/\b(service|services|clean|cleaning|cleanings|whiten|whitening|veneer|veneers|bonding|implant|implants|root canal|filling|fillings|extraction|denture|dentures|bridge|bridges|sealant|sealants|x ray|xray|cosmetic|restorative|preventative|kids|children|family)\b/]
  ];
  function match(t){t=' '+t.toLowerCase().replace(/[^\w$\s'-]/g,' ')+' ';for(var i=0;i<RULES.length;i++){if(RULES[i][1].test(t))return RULES[i][0];}return 'unknown';}

  var ICO='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 6.2c0-.7.6-1.2 1.2-1.2h11.6c.7 0 1.2.5 1.2 1.2v8.4c0 .7-.5 1.2-1.2 1.2H9.2L5 18.8V6.2z"/></svg>';
  var MIC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5A3.5 3.5 0 0 0 8.5 7v5a3.5 3.5 0 0 0 7 0V7A3.5 3.5 0 0 0 12 3.5Z"/><path d="M6.5 11.5a5.5 5.5 0 0 0 11 0"/><path d="M12 17v3.5"/></svg>';
  var SEND='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var SPK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10v4h3.5L12 18V6L7.5 10H4z"/><path class="cc-waves" d="M15 9.5a3.2 3.2 0 0 1 0 5M17.5 7.5a6 6 0 0 1 0 9"/></svg>';

  // ---------- DOM ----------
  var launch=el('button',{class:'cc-launch',type:'button','aria-haspopup':'dialog','aria-expanded':'false','aria-controls':'cc-panel','aria-label':'Book or ask, open the concierge chat'},
    '<span class="cc-ico" aria-hidden="true">'+ICO+'</span><span class="cc-lbl">Book or ask</span>');
  var panel=el('div',{class:'cc-panel',id:'cc-panel',role:'dialog','aria-modal':'true','aria-labelledby':'cc-title','aria-describedby':'cc-sub cc-note',hidden:''},
    '<div class="cc-head"><div class="cc-head-text"><h2 class="cc-title" id="cc-title">Concierge</h2>'+
    '<p class="cc-sub" id="cc-sub">Book a visit or ask a question</p></div>'+
    '<button class="cc-speak" type="button" aria-pressed="false" aria-label="Read replies aloud" title="Read replies aloud">'+SPK+'</button>'+
    '<button class="cc-close" type="button" aria-label="Close chat"></button></div>'+
    '<p class="cc-note" id="cc-note"><b>Sample prototype</b>Answers come from this site. Nothing you type is sent.</p>'+
    '<div class="cc-log" role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation"></div>'+
    '<div class="cc-quick" role="group" aria-label="Quick questions"></div>'+
    '<form class="cc-form" novalidate><p class="cc-listen" hidden role="status" aria-live="polite"><span class="cc-listen-dot" aria-hidden="true"></span>Listening</p>'+
    '<div class="row"><div class="field"><label for="cc-in">Ask a question</label>'+
    '<input id="cc-in" type="text" autocomplete="off" placeholder="Type a message" maxlength="2000"></div>'+
    '<button class="cc-mic" type="button" aria-label="Start voice input" aria-pressed="false">'+MIC+'</button>'+
    '<button class="cc-go" type="submit" aria-label="Send">'+SEND+'</button></div>'+
    '<p class="cc-fine">Please don\u2019t share health details. For care questions, call '+PHONE+'.</p></form>');
  d.body.appendChild(launch); d.body.appendChild(panel);
  var log=panel.querySelector('.cc-log'), form=panel.querySelector('.cc-form'), input=panel.querySelector('#cc-in'), lab=panel.querySelector('label[for=cc-in]');
  var closeBtn=panel.querySelector('.cc-close'), speakBtn=panel.querySelector('.cc-speak');
  var micBtn=panel.querySelector('.cc-mic'), listenEl=panel.querySelector('.cc-listen'), quick=panel.querySelector('.cc-quick');

  QUICK.forEach(function(c){
    var b=el('button',{class:'cc-chip',type:'button'});
    b.textContent=c[1]; b.dataset.k=c[0];
    b.addEventListener('click',function(){
      if(mode==='book')return;
      user(c[1]); route(c[0]);
    });
    quick.appendChild(b);
  });

  function el(tag,attrs,html){var e=d.createElement(tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(html)e.innerHTML=html;return e;}
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function scroll(){log.scrollTop=log.scrollHeight;}
  function user(text){var m=el('div',{class:'cc-msg cc-user'});m.textContent=text;log.appendChild(m);scroll();}
  var queue=Promise.resolve();
  function bot(paras,cls){
    queue=queue.then(function(){return new Promise(function(res){
      var t=null;
      if(!reduce){t=el('div',{class:'cc-typing','aria-hidden':'true'},'<i></i><i></i><i></i>');log.appendChild(t);scroll();}
      setTimeout(function(){
        if(t)t.remove();
        var m=el('div',{class:'cc-msg cc-bot'+(cls?' '+cls:'')});
        m.innerHTML=paras.map(function(p){return '<p>'+p+'</p>';}).join('');
        log.appendChild(m);scroll();
        if(speakOn)speak(m.textContent);
        res(m);
      },reduce?0:380);
    });});
    return queue;
  }
  function chips(list,onPick,opts){
    opts=opts||{};
    return queue=queue.then(function(){
      var wrap=el('div',{class:'cc-chips',role:'group','aria-label':opts.label||'Quick replies'});
      list.forEach(function(c){
        var b=el('button',{class:'cc-chip'+(c[2]?' '+c[2]:''),type:'button'});b.textContent=c[1];b.dataset.k=c[0];
        if(opts.multi)b.setAttribute('aria-pressed','false');
        b.addEventListener('click',function(){
          if(opts.multi&&c[0]!=='done'){var on=b.getAttribute('aria-pressed')==='true';b.setAttribute('aria-pressed',String(!on));return;}
          var picked=opts.multi?[].slice.call(wrap.querySelectorAll('[aria-pressed=true]')).map(function(x){return x.textContent;}):null;
          if(opts.multi&&!picked.length){bot(['Please choose at least one day, or pick Any day.'],'cc-err');return;}
          wrap.classList.add('used');b.setAttribute('aria-pressed','true');
          [].forEach.call(wrap.querySelectorAll('button'),function(x){x.disabled=true;});
          onPick(c[0],c[1],picked);
        });
        wrap.appendChild(b);
      });
      log.appendChild(wrap);scroll();
      return wrap;
    });
  }

  // ---------- Conversation ----------
  var mode='faq', step=null, B={};
  function showQuick(on){quick.hidden=!on;}
  function route(k){
    if(k==='book')return startBooking();
    bot(A[k]||A.unknown);
  }
  function greet(){
    bot(['Welcome to Dublin Plaza Dental. I can help you request a visit, or answer quick questions about the office.',
         '<span class="small">Please don\u2019t share health details here.</span>']);
  }

  // Booking flow
  var TYPES=[['new','New patient exam'],['clean','Cleaning'],['crown','Same day crown consult'],['other','Other']];
  var DAYS=[['Mon','Monday'],['Tue','Tuesday'],['Thu','Thursday'],['Fri','Friday'],['Sat','Saturday (by appointment)'],['any','Any day']];
  var TIMES=[['am','Morning'],['mid','Midday'],['pm','Afternoon'],['any','Any time']];
  function setInput(lbl,type,ac,ph){lab.textContent=lbl;input.type=type;input.setAttribute('autocomplete',ac||'off');input.placeholder=ph||'Type a message';input.removeAttribute('aria-invalid');input.value='';}
  function resetInput(){setInput('Ask a question','text','off','Type a message');}
  function startBooking(){
    mode='book';B={};step='type';showQuick(false);
    bot(['Happy to help you request a visit. The office will call to confirm a time.','What kind of visit is this?']);
    chips(TYPES.concat([['cancel','Cancel','ghost']]),function(k,lbl){user(lbl);if(k==='cancel')return cancel();B.type=lbl;
      if(k==='other'){step='other';setInput('What is the visit for?','text','off','A few words');bot(['In a few words, what is the visit for? Please skip any health details.']);focusIn();}
      else askDays();});
  }
  function askDays(){
    step='days';
    bot(['Which days work best? Choose any that apply, then tap Done.','<span class="small">The office is open Monday, Tuesday, Thursday, and Friday. Saturday is by appointment.</span>']);
    chips(DAYS.map(function(x){return [x[0],x[1]];}).concat([['done','Done','cc-send']]),function(k,lbl,picked){
      if(picked.indexOf('Any day')>-1)picked=['Any day'];
      B.days=picked.join(', ');user(B.days);askTime();},{multi:true,label:'Preferred days'});
  }
  function askTime(){
    step='time';
    bot(['And what time of day do you prefer?','<span class="small">Hours are 9am to 6pm.</span>']);
    chips(TIMES,function(k,lbl){B.time=lbl;user(lbl);askName();},{label:'Preferred time of day'});
  }
  function askName(){step='name';setInput('Your name','text','name','First and last name');bot(['Thank you. What name should the office use?']);focusIn();}
  function askPhone(){step='phone';setInput('Phone','tel','tel','(925) 555 0123');bot(['What is the best phone number to reach you?']);focusIn();}
  function askEmail(){step='email';setInput('Email','email','email','you@example.com');bot(['And your email address?']);focusIn();}
  function summary(){
    step='summary';resetInput();
    queue=queue.then(function(){
      var s=el('div',{class:'cc-sum',role:'group','aria-labelledby':'cc-sum-h'},
        '<h3 id="cc-sum-h">Your request</h3><dl>'+
        '<dt>Visit</dt><dd>'+esc(B.type+(B.note?': '+B.note:''))+'</dd><dt>Days</dt><dd>'+esc(B.days)+'</dd><dt>Time</dt><dd>'+esc(B.time)+'</dd>'+
        '<dt>Name</dt><dd>'+esc(B.name)+'</dd><dt>Phone</dt><dd>'+esc(B.phone)+'</dd><dt>Email</dt><dd>'+esc(B.email)+'</dd></dl>'+
        '<p class="cc-fine">This is a request, not a confirmed appointment. The office will call to confirm a time.</p>'+
        '<div class="cc-actions"><button type="button" class="cc-chip cc-send" data-a="send">Send request</button><button type="button" class="cc-chip ghost" data-a="edit">Start over</button></div>');
      log.appendChild(s);scroll();
      var btns=s.querySelectorAll('button');
      s.querySelector('[data-a=send]').addEventListener('click',function(){[].forEach.call(btns,function(b){b.disabled=true;});user('Send request');done();});
      s.querySelector('[data-a=edit]').addEventListener('click',function(){[].forEach.call(btns,function(b){b.disabled=true;});user('Start over');startBooking();});
      setTimeout(function(){s.querySelector('[data-a=send]').focus();},0);
    });
  }
  function done(){
    mode='faq';step=null;B={};showQuick(true);
    bot(['<b>Prototype: nothing was sent.</b> In the live version the office would call to confirm.','Is there anything else I can help with?'],'cc-done');
  }
  function cancel(){mode='faq';step=null;B={};resetInput();showQuick(true);bot(['No problem. What else can I help with?']);}
  function err(msg){input.setAttribute('aria-invalid','true');bot([msg],'cc-err');focusIn();}

  function submitText(v){
    v=(v||'').trim(); if(!v)return;
    if(mode==='book'&&/^(cancel|stop|never ?mind)$/i.test(v)){user(v);input.value='';return cancel();}
    if(mode==='book'&&step==='other'){
      if(match(v)==='clinical'){user(v);input.value='';bot(A.clinical);bot(['To keep things private, a short label is enough, for example \u201cconsultation\u201d.']);return focusIn();}
      B.note=v.slice(0,80);user(B.note);resetInput();return askDays();}
    if(mode==='book'&&step==='name'){
      user(v);if(!/[A-Za-z\u00C0-\u024F].*[A-Za-z\u00C0-\u024F]/.test(v)||v.length>60)return err('Please enter your name, for example Jordan Lee.');
      B.name=v;input.value='';return askPhone();}
    if(mode==='book'&&step==='phone'){
      user(v);var dg=v.replace(/\D/g,'');if(dg.length===11&&dg[0]==='1')dg=dg.slice(1);
      if(dg.length!==10)return err('That number doesn\u2019t look complete. Please enter a 10 digit phone number.');
      B.phone='('+dg.slice(0,3)+') '+dg.slice(3,6)+' '+dg.slice(6);input.value='';return askEmail();}
    if(mode==='book'&&step==='email'){
      user(v);if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))return err('Please check the email address, for example name@example.com.');
      B.email=v;input.value='';return summary();}
    if(mode==='book'&&(step==='type'||step==='days'||step==='time'||step==='summary')){
      user(v);input.value='';bot(['Please use the options above to continue, or type Cancel to stop the request.']);return;}
    user(v);input.value='';route(match(v));
  }

  form.addEventListener('submit',function(e){
    e.preventDefault();
    var v=input.value; input.value=''; submitText(v);
  });

  // ---------- Voice input (Web Speech API) and optional read aloud ----------
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  var rec=null, listening=false, speakOn=false;
  function setListening(on){
    listening=!!on;
    micBtn.classList.toggle('is-listening',listening);
    micBtn.setAttribute('aria-pressed',listening?'true':'false');
    micBtn.setAttribute('aria-label',listening?'Stop listening':'Start voice input');
    listenEl.hidden=!listening;
    listenEl.classList.toggle('is-on',listening);
  }
  function stopRec(){
    if(rec){
      try{rec.onresult=null;rec.onerror=null;rec.onend=null;rec.stop();}catch(e){}
      rec=null;
    }
    setListening(false);
  }
  function startRec(){
    if(!SR){
      bot(['Voice input is not available in this browser. You can still type a message.']);
      return;
    }
    if(listening){stopRec();return;}
    var e=new SR();
    e.lang=navigator.language||'en-US';
    e.interimResults=true;
    e.continuous=false;
    e.onresult=function(ev){
      var interim='', final='', i, r;
      for(i=0;i<ev.results.length;i++){
        r=ev.results[i];
        if(r.isFinal)final+=r[0].transcript; else interim+=r[0].transcript;
      }
      input.value=final||interim;
      if(final&&final.trim()){stopRec();var t=final.trim();input.value='';submitText(t);}
    };
    e.onerror=function(ev){
      var t=ev&&ev.error;
      stopRec();
      if(t==='not-allowed'||t==='service-not-allowed')bot(['Microphone access was blocked. You can still type a message.']);
      else if(t==='no-speech')bot(['I did not catch that. Try again, or type a message.']);
      else if(t==='audio-capture')bot(['No microphone was found. You can still type a message.']);
      else if(t==='network')bot(['Voice input could not reach the speech service. You can still type a message.']);
    };
    e.onend=function(){rec=null;setListening(false);};
    try{rec=e;e.start();setListening(true);}
    catch(err){rec=null;setListening(false);bot(['Voice input could not start. You can still type a message.']);}
  }
  micBtn.addEventListener('click',function(e){e.preventDefault();startRec();});

  function speak(text){
    if(!speakOn||!window.speechSynthesis)return;
    try{
      window.speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance(String(text||'').replace(/\s+/g,' ').trim());
      u.rate=1; u.lang='en-US';
      window.speechSynthesis.speak(u);
    }catch(e){}
  }
  function stopSpeak(){if(window.speechSynthesis){try{window.speechSynthesis.cancel();}catch(e){}}}
  speakBtn.addEventListener('click',function(){
    if(!window.speechSynthesis){bot(['Read aloud is not available in this browser.']);return;}
    speakOn=!speakOn;
    speakBtn.setAttribute('aria-pressed',speakOn?'true':'false');
    speakBtn.setAttribute('aria-label',speakOn?'Turn off read aloud':'Read replies aloud');
    if(!speakOn)stopSpeak();
  });

  // ---------- Open, close, focus trap ----------
  var started=false, lastFocus=null;
  function focusIn(){queue.then(function(){input.focus();});}
  function open(){
    lastFocus=d.activeElement; panel.hidden=false;
    requestAnimationFrame(function(){panel.classList.add('open');});
    launch.setAttribute('aria-expanded','true');
    if(!started){started=true;greet();}
    queue.then(function(){input.focus();});
  }
  function close(){
    stopRec(); stopSpeak();
    panel.classList.remove('open');launch.setAttribute('aria-expanded','false');
    setTimeout(function(){if(!panel.classList.contains('open'))panel.hidden=true;},reduce?0:360);
    (lastFocus&&lastFocus!==d.body?launch:launch).focus();
  }
  launch.addEventListener('click',open); closeBtn.addEventListener('click',close);
  panel.addEventListener('keydown',function(e){
    if(e.key==='Escape'){e.preventDefault();return close();}
    if(e.key!=='Tab')return;
    var f=[].filter.call(panel.querySelectorAll('a[href],button:not(:disabled):not([hidden]),input'),function(x){return x.offsetParent!==null&&!x.closest('[hidden]');});
    if(!f.length)return; var first=f[0], last=f[f.length-1];
    if(e.shiftKey&&d.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&d.activeElement===last){e.preventDefault();first.focus();}
  });
  [].forEach.call(d.querySelectorAll('[data-concierge]'),function(a){a.addEventListener('click',function(e){e.preventDefault();open();if(!started)return;});});

  window.__concierge={
    open:open,
    close:close,
    setListening:function(on,transcript){
      setListening(!!on);
      if(transcript!=null)input.value=transcript;
    },
    submitVoice:function(text){
      setListening(false);
      input.value='';
      submitText(text);
    }
  };
})();
