(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const CARD_LIBRARY = [
    {id:"emekli",name:"Emekli",kind:"unit",cost:2,attack:1,hp:5,emoji:"🧓",desc:"Ay sonunda +2 refah kazanır.",ability:"Aylık +2 refah",effect:"pension"},
    {id:"ogretmen",name:"Öğretmen",kind:"unit",cost:3,attack:2,hp:4,emoji:"🍎",desc:"Oynandığında 1 bütçe geri kazandırır.",ability:"Bütçe +1",effect:"refund"},
    {id:"isci",name:"İşçi",kind:"unit",cost:2,attack:3,hp:2,emoji:"🦺",desc:"Ucuz, sert ve kolay pes etmez.",ability:"",effect:""},
    {id:"kiraci",name:"Kiracı",kind:"unit",cost:1,attack:1,hp:3,emoji:"🔑",desc:"Sahaya çıktığında rakibin 1 refahını azaltır.",ability:"Rakibe -1 refah",effect:"rent"},
    {id:"esnaf",name:"Esnaf",kind:"unit",cost:3,attack:2,hp:5,emoji:"🥙",desc:"Ay sonunda sana 1 bütçe sağlar.",ability:"Aylık +1 bütçe",effect:"shop"},
    {id:"kurye",name:"Kurye",kind:"unit",cost:2,attack:2,hp:3,emoji:"🛵",desc:"Hızlıdır; oynandığı tur saldırabilir.",ability:"Hemen saldırır",effect:"rush"},
    {id:"bankaci",name:"Bankacı",kind:"unit",cost:4,attack:2,hp:5,emoji:"🏦",desc:"Oynandığında 2 bütçe verir; ay sonunda 1 refah götürür.",ability:"Bütçe +2 / refah -1",effect:"bank"},
    {id:"fabrikator",name:"Fabrikatör",kind:"unit",cost:5,attack:5,hp:6,emoji:"🏭",desc:"Güçlü bir saha kartı.",ability:"",effect:""},
    {id:"evsahibi",name:"Ev Sahibi",kind:"unit",cost:4,attack:3,hp:5,emoji:"🏠",desc:"Ay sonunda rakibin 2 refahını azaltır.",ability:"Rakibe aylık -2",effect:"landlord"},
    {id:"isveren",name:"İşveren",kind:"unit",cost:4,attack:4,hp:4,emoji:"🤵",desc:"Sahaya çıktığında rakibe 1 hasar verir.",ability:"Rakibe -1 refah",effect:"pressure"},
    {id:"vergi",name:"Vergi Denetimi",kind:"spell",cost:2,emoji:"🧾",desc:"Rakibin sahasındaki rastgele bir birime 2 hasar ver.",effect:"damage"},
    {id:"zam",name:"Kira Zammı",kind:"spell",cost:3,emoji:"📈",desc:"Rakibin refahını 4 azalt.",effect:"hit"},
    {id:"dayanisma",name:"Dayanışma",kind:"spell",cost:2,emoji:"🤝",desc:"Tüm dost birimlere +1 saldırı ve +1 can ver.",effect:"boost"},
    {id:"veresiye",name:"Veresiye Defteri",kind:"spell",cost:0,emoji:"📒",desc:"Şimdi 2 bütçe kazan; sonraki ay 3 refah öde.",effect:"loan"}
  ];
  const DECK_PLAYER = ["emekli","ogretmen","isci","kiraci","esnaf","kurye","bankaci","isci","emekli","vergi","zam","dayanisma","veresiye","esnaf","evsahibi","isci","ogretmen","vergi","kurye","dayanisma"];
  const DECK_AI = ["fabrikator","evsahibi","bankaci","isveren","isci","fabrikator","zam","vergi","evsahibi","bankaci","isveren","isci","zam","dayanisma","fabrikator","vergi","evsahibi","isveren","bankaci","fabrikator"];
  const EVENTS = [
    {title:"Enflasyon dalgası",desc:"Bu ay sonu herkes 2 refah kaybeder.",emoji:"🔥",type:"inflation"},
    {title:"Elektrik faturası",desc:"Bu ay sonu iki taraf da 1 refah öder.",emoji:"💡",type:"bill"},
    {title:"Piyasa sakin",desc:"Bu ay olağanüstü bir gelişme yok.",emoji:"📊",type:"calm"},
    {title:"Vergi haftası",desc:"Sahasında en az birim olan oyuncu 2 refah kaybeder.",emoji:"🧾",type:"tax"},
    {title:"Esnaf dayanışması",desc:"Ay sonunda iki taraf da 1 refah kazanır.",emoji:"🥖",type:"solidarity"}
  ];
  let state;
  let toastTimer;
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const shuffle = (arr) => { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
  const cardById = id => CARD_LIBRARY.find(c=>c.id===id);
  function newState(){
    const playerDeck=shuffle(DECK_PLAYER), aiDeck=shuffle(DECK_AI);
    const s={player:{health:30,budget:1,maxBudget:1,deck:playerDeck,hand:[],board:[]},enemy:{health:30,budget:1,maxBudget:1,deck:aiDeck,hand:[],board:[]},turn:1,month:1,monthTurn:0,active:"player",selected:null,logs:[],event:clone(EVENTS[2]),ended:false};
    for(let i=0;i<4;i++){draw(s.player);draw(s.enemy);}
    return s;
  }
  function draw(side){if(side.deck.length)side.hand.push(cardById(side.deck.shift()));}
  function log(message){state.logs.unshift(message);state.logs=state.logs.slice(0,8);}
  function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),1900);}
  function start(){state=newState();log("Yeni mücadele başladı. Bol şans!");beginPlayerTurn(true);render();}
  function beginPlayerTurn(first=false){
    state.active="player";state.player.maxBudget=Math.min(10,state.turn);state.player.budget=state.player.maxBudget;
    if(!first)draw(state.player);
    state.player.board.forEach(u=>u.ready=u.summonedTurn<state.turn||(u.effect==="rush"&&u.summonedTurn===state.turn));
    state.selected=null;
    if(state.turn>1 && state.turn%3===1){state.month++;state.monthTurn=0;state.event=clone(EVENTS[Math.floor(Math.random()*EVENTS.length)]);}
    log(first?"İlk tur: Hane Ekonomisi sahada.":`Tur ${state.turn}: bütçen yenilendi.`);
  }
  function render(){
    const p=state.player,e=state.enemy;
    $("player-health").textContent=p.health;$("enemy-health").textContent=e.health;
    $("player-health-bar").style.width=Math.max(0,p.health/30*100)+"%";$("enemy-health-bar").style.width=Math.max(0,e.health/30*100)+"%";
    $("budget").textContent=p.budget;$("max-budget").textContent=p.maxBudget;
    $("enemy-hand-count").textContent=e.hand.length;
    $("month-number").textContent=String(state.month).padStart(2,"0");$("turn-number").textContent=state.turn;
    $("month-progress").textContent=`${state.monthTurn+1} / 3 tur`;$("month-meter-fill").style.width=((state.monthTurn+1)/3*100)+"%";
    $("event-title").textContent=state.event.title;$("event-description").textContent=state.event.desc;
    document.querySelector(".event-icon").textContent=state.event.emoji;
    $("player-board-count").textContent=`${p.board.length} / 5`;$("enemy-board-count").textContent=`${e.board.length} / 5`;
    $("player-board").innerHTML=boardHTML(p.board,"player");$("enemy-board").innerHTML=boardHTML(e.board,"enemy");
    $("player-hand").innerHTML=p.hand.map((c,i)=>cardHTML(c,i)).join("");
    $("turn-title").textContent=state.ended?"Mücadele sona erdi": "Hamleni yap.";
    $("turn-description").textContent=state.active==="player"?"Kartlarını oyna; hazır birimlerinle rakibe saldır.":"Rakip düşünüyor…";
    $("end-turn").disabled=state.active!=="player"||state.ended;
    $("end-turn").style.opacity=state.active==="player"&&!state.ended?"1":".45";
    $("game-log").innerHTML=state.logs.map(x=>`<li>${escapeHTML(x)}</li>`).join("");
    $("hand-hint").textContent=p.hand.length?`${p.hand.length} kart · Oynamak için seç`:"Deste boş";
  }
  function escapeHTML(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function cardHTML(c,i){const unit=c.kind==="unit";const disabled=state.active!=="player"||state.ended||c.cost>state.player.budget||(unit&&state.player.board.length>=5);return `<button class="card ${unit?"":"spell-card"} card--${c.id}" data-card="${i}" ${disabled?"disabled":""} aria-label="${c.name}, maliyet ${c.cost}"><div class="card-top"><span class="card-type">${unit?"KARAKTER":"EKONOMİK HAMLE"}</span><span class="cost"><b>${c.cost}</b></span></div><div class="card-art art--${c.id}"><span class="art-glow"></span><span class="art-emoji">${c.emoji}</span><span class="art-caption">${unit?"SAHA KARTI":"TAKTİK KARTI"}</span></div><div class="card-name">${c.name}</div><div class="card-desc">${c.desc}</div><div class="card-bottom">${unit?`<span class="attack">⚔ ${c.attack} SALDIRI</span><span class="hp">♥ ${c.hp} CAN</span>`:"<span>✦ TEK KULLANIM</span>"}</div></button>`;}
  function boardHTML(board,side){return board.map((u,i)=>`<div class="unit ${u.ready&&side==="player"?"ready":""} ${state.selected===i&&side==="player"?"selected":""}"><span class="unit-name">${u.name}</span><span class="unit-emoji">${u.emoji}</span><span class="unit-ability">${u.ability||"Sahada"}</span><div class="unit-stats"><span>⚔ ${u.attack}</span><span>♥ ${u.hp}</span></div>${side==="player"?`<button data-unit="${i}" aria-label="${u.name} birimini seç"></button>`:""}</div>`).join("");}
  function playCard(index,side="player"){
    const actor=state[side],target=state[side==="player"?"enemy":"player"],c=actor.hand[index];
    if(!c||c.cost>actor.budget||state.ended)return;
    if(c.kind==="unit"&&actor.board.length>=5){if(side==="player")toast("Sahanda en fazla 5 birim olabilir.");return;}
    actor.budget-=c.cost;actor.hand.splice(index,1);
    if(c.kind==="unit"){
      const u={...clone(c),hp:c.hp,maxHp:c.hp,ready:c.effect==="rush",summonedTurn:state.turn};
      actor.board.push(u);
      if(c.effect==="refund")actor.budget=Math.min(actor.maxBudget,actor.budget+1);
      if(c.effect==="rent"||c.effect==="pressure")target.health-=c.effect==="rent"?1:1;
      if(c.effect==="bank")actor.budget=Math.min(actor.maxBudget,actor.budget+2);
      log(`${side==="player"?"Sen":"Rakip"} ${c.name} oynadı.`);
    }else{
      if(c.effect==="damage"){if(target.board.length){const u=target.board[Math.floor(Math.random()*target.board.length)];u.hp-=2;log(`${c.name}: ${u.name} 2 hasar aldı.`);if(u.hp<=0)target.board=target.board.filter(x=>x!==u);}else{target.health-=2;}}
      if(c.effect==="hit")target.health-=4;
      if(c.effect==="boost")actor.board.forEach(u=>{u.attack++;u.hp++;u.maxHp++;});
      if(c.effect==="loan"){actor.budget=Math.min(actor.maxBudget,actor.budget+2);actor.debt=(actor.debt||0)+3;}
      log(`${side==="player"?"Sen":"Rakip"} ${c.name} kullandı.`);
    }
    checkEnd();render();
  }
  function attack(attackerSide,index,targetIndex=null){
    const actor=state[attackerSide],defender=state[attackerSide==="player"?"enemy":"player"],u=actor.board[index];
    if(!u||!u.ready||state.ended)return;
    u.ready=false;
    if(defender.board.length){
      const t=defender.board[targetIndex??0];if(!t)return;
      t.hp-=u.attack;u.hp-=t.attack;
      log(`${u.name}, ${t.name} ile çarpıştı.`);
      if(t.hp<=0){log(`${t.name} sahadan silindi.`);defender.board.splice(targetIndex??0,1);}
      if(u.hp<=0){log(`${u.name} sahadan silindi.`);actor.board.splice(index,1);}
    }else{defender.health-=u.attack;log(`${u.name} rakibin refahından ${u.attack} götürdü.`);}
    checkEnd();render();
  }
  function checkEnd(){if(state.player.health<=0||state.enemy.health<=0){state.ended=true;const win=state.enemy.health<=0&&state.player.health>0;$("result-emoji").textContent=win?"🏆":"🧾";$("result-title").textContent=win?"Arenayı kazandın!":"Ekonomi seni yendi."; $("result-text").textContent=win?"Sermaye Düzeni'nin refahı sıfırlandı. Bu tur senin!":"Refahın sıfırlandı. Bir sonraki mücadelede bütçeni daha dikkatli yönet."; $("result-modal").classList.remove("hidden");}}
  function monthEnd(){
    const p=state.player,e=state.enemy;
    [p,e].forEach((s,idx)=>{
      const opponent=idx===0?e:p;
      s.board.forEach(u=>{if(u.effect==="pension")s.health+=2;if(u.effect==="landlord")opponent.health-=2;if(u.effect==="shop")s.budget=Math.min(s.maxBudget,s.budget+1);if(u.effect==="bank")s.health-=1;});
      if(s.debt){s.health-=s.debt;s.debt=0;log(idx===0?"Veresiye borcunu ödedin.":"Rakip veresiye borcunu ödedi.");}
    });
    if(state.event.type==="inflation"){p.health-=2;e.health-=2;}
    if(state.event.type==="bill"){p.health--;e.health--;}
    if(state.event.type==="tax"){if(p.board.length<e.board.length)p.health-=2;else if(e.board.length<p.board.length)e.health-=2;}
    if(state.event.type==="solidarity"){p.health++;e.health++;}
    log(`Ay sonu: ${state.event.title.toLowerCase()}.`);
    p.health=Math.min(30,p.health);e.health=Math.min(30,e.health);
    checkEnd();
  }
  function enemyTurn(){
    if(state.ended)return;state.active="enemy";render();
    window.setTimeout(()=>{
      const e=state.enemy;
      e.maxBudget=Math.min(10,state.turn);e.budget=e.maxBudget;draw(e);
      let guard=0;
      while(guard++<8){const affordable=e.hand.map((c,i)=>({c,i})).filter(x=>x.c.cost<=e.budget&& (x.c.kind!=="unit"||e.board.length<5)).sort((a,b)=>b.c.cost-a.c.cost);if(!affordable.length)break;playCard(affordable[0].i,"enemy");if(state.ended)return;}
      e.board.forEach((u,i)=>{if(u.summonedTurn!==state.turn)u.ready=true;});
      e.board.forEach((u,i)=>{if(u.ready&&!state.ended)attack("enemy",i,e.board.length?Math.floor(Math.random()*state.player.board.length):null);});
      if(state.ended)return;
      state.monthTurn++;
      if(state.monthTurn>=3){monthEnd();state.monthTurn=0;}
      if(state.ended){render();return;}
      state.turn++;beginPlayerTurn();render();
    },650);
  }
  $("player-hand").addEventListener("click",e=>{const b=e.target.closest("[data-card]");if(b)playCard(Number(b.dataset.card));});
  $("player-board").addEventListener("click",e=>{const b=e.target.closest("[data-unit]");if(!b||state.active!=="player")return;const i=Number(b.dataset.unit),u=state.player.board[i];if(!u)return;if(state.selected!==null){attack("player",state.selected,i);state.selected=null;}else if(u.ready){state.selected=i;render();toast("Hedef seç: rakip birime dokun veya doğrudan saldır.");}});
  $("enemy-board").addEventListener("click",()=>{if(state.selected!==null){attack("player",state.selected,null);state.selected=null;}});
  $("end-turn").addEventListener("click",()=>{if(state.active!=="player"||state.ended)return;state.player.board.forEach(u=>{if(u.summonedTurn<state.turn)u.ready=true;});enemyTurn();});
  $("new-game").addEventListener("click",()=>{$("result-modal").classList.add("hidden");start();});
  $("play-again").addEventListener("click",()=>{$("result-modal").classList.add("hidden");start();});
  $("clear-log").addEventListener("click",()=>{state.logs=[];render();});
  start();
})();