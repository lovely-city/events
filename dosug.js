
const LANG=((document.querySelector(".lc-dosug")||{}).dataset||{}).lang||(/^\/en(\/|$)/.test(location.pathname)?"en":"ru"), EN=LANG==="en";
const STATIC_EN={"Все предстоящие": "All upcoming", "Сегодня": "Today", "Завтра": "Tomorrow", "Ближайшие выходные": "This weekend", "Свои даты": "Pick dates", "с": "from", "по": "to", "Что": "What", "Вид спорта": "Sport", "Для кого": "For", "Где": "Where", "Поиск": "Search", "События": "Events", "Доступный досуг": "Open any day", "Парки, музеи, выставки, сезонные площадки и кафе — работают в выбранные даты, можно прийти в любой день.": "Parks, museums, exhibitions, seasonal venues and cafés — open on the selected dates, drop in any day.", "Ваша идея может стать новым местом": "Your idea could become a new place", "Расскажите, чего вам не хватает рядом с домом.": "Tell us what you’re missing near home.", "Расскажите, какого досуга вам не хватает": "Tell us what kind of leisure you’re missing", "Мы соберём ответы жителей по районам": "We collect residents’ answers by area", "Покажем их тем, кто открывает студии, клубы и площадки": "And show them to those who open studios, clubs and venues", "Рассказать": "Tell us", "Когда": "When", "Название, место, район…": "Name, venue, area…"};
if(EN){const root=document.querySelector(".lc-dosug"); if(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT); let n; while((n=w.nextNode())){const t=n.nodeValue.trim(); if(t&&STATIC_EN[t]) n.nodeValue=n.nodeValue.replace(t,STATIC_EN[t]);} root.querySelectorAll("[placeholder],[aria-label]").forEach(el=>{["placeholder","aria-label"].forEach(at=>{const v=el.getAttribute(at); if(v&&STATIC_EN[v]) el.setAttribute(at,STATIC_EN[v]);});}); const h=root.querySelector("h1"); if(h&&/Куда/.test(h.textContent)) h.innerHTML='<span class="b">What’s on</span> in Dubai';}}
const T=(ru,en)=>EN?en:ru;
const CITY_EN={"Дубай":"Dubai","Абу-Даби":"Abu Dhabi","Рас-эль-Хайма":"Ras Al Khaimah","Шарджа":"Sharjah"};
const cityName=c=>EN?(CITY_EN[c]||c):c;
const EVENTS = [];
let ITEMS = EVENTS.map(e=>Object.assign({status:"approved"},e));
let DB=null, EDITOR=false, view="site", edOn=false;
const CATS = EN?{concert:"Concerts & shows",places:"Places to visit",sport:"Sport",sportev:"Sports events",master:"Workshops",hobby:"Hobbies & courses",expo:"Exhibitions & talks",weekend:"Weekend ideas",date:"Date ideas",games:"Games & socialising"}:{concert:"Концерты и шоу",places:"Интересные места",sport:"Спорт",sportev:"Спортивные события",master:"Мастер-классы",hobby:"Хобби и курсы",expo:"Выставки и лекции",weekend:"Куда сходить на выходные",date:"Куда сходить на свидание",games:"Игры и общение"};
const SUBS = EN?{padel:"Padel",tennis:"Tennis",dance:"Dance",yoga:"Yoga & Pilates",water:"Water sports",riding:"Horse riding",winter:"Ice & ski",run:"Running",cycle:"Cycling",fight:"Combat sports",outdoor:"Hiking & trips",other:"Other"}:{padel:"Падел",tennis:"Теннис",dance:"Танцы",yoga:"Йога и пилатес",water:"Водный спорт",riding:"Верховая езда",winter:"Каток и лыжи",run:"Бег",cycle:"Вело",fight:"Единоборства",outdoor:"Хайкинг и выезды",other:"Другое"};
const OLD2NEW = {kidsfun:"weekend",kidsdev:"hobby",adults:"date",sport:"sport",yoga:"sport",food:"date",beauty:"date",cowork:"places",other:"weekend"};
const tagsRaw = e => Array.isArray(e.tags)&&e.tags.length ? e.tags : [...new Set((e.cats||[]).map(c=>OLD2NEW[c]||"weekend"))];
const SURVEY = EN?{sportev:"en/sport",sport:"en/sport",weekend:"en/kidsentertainment",concert:"en/entertainment",places:"en/entertainment",master:"en/entertainment",hobby:"en/entertainment",expo:"en/entertainment",date:"en/entertainment",games:"en/entertainment"}:{sportev:"sport",concert:"razvlecheniya-dlya-vzroslyh",places:"razvlecheniya-dlya-vzroslyh",sport:"sport",master:"razvlecheniya-dlya-vzroslyh",hobby:"razvlecheniya-dlya-vzroslyh",expo:"razvlecheniya-dlya-vzroslyh",weekend:"razvlecheniya-dlya-detej",date:"razvlecheniya-dlya-vzroslyh",games:"razvlecheniya-dlya-vzroslyh"};
const AUDS = EN?{any:"All",kids:"With kids",adults:"Adults"}:{any:"Все",kids:"С детьми",adults:"Взрослым"};
const MON = EN?["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]:["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"];
const WD = EN?["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]:["вс","пн","вт","ср","чт","пт","сб"];
const state = {w:"weekend", cat:null, sub:null, aud:"any", city:"all", q:"", d1:"", d2:""};
try{const s=JSON.parse(localStorage.getItem("leisure-f")||"null"); if(s){state.w=s.w||state.w; state.aud=s.aud||"any"; state.city=s.city||"all";}}catch(e){}

const iso = d => d.toISOString().slice(0,10);
const parse = s => new Date(s+"T00:00:00Z");
const add = (s,n) => { const d=parse(s); d.setUTCDate(d.getUTCDate()+n); return iso(d); };
const TODAY = iso(new Date(Date.now()+4*3600e3)); // время Дубая, UTC+4
const FAR = "2099-12-31";

function windowFor(){
  if(state.w==="today") return [TODAY,TODAY];
  if(state.w==="tomorrow"){const t=add(TODAY,1);return [t,t];}
  if(state.w==="weekend"){const g=parse(TODAY).getUTCDay(); if(g===0) return [TODAY,TODAY]; const sat=add(TODAY,(6-g+7)%7); return [sat,add(sat,1)];}
  if(state.w==="custom"){let a=state.d1||TODAY,b=state.d2||a; if(b<a)[a,b]=[b,a]; return [a,b];}
  return [TODAY,FAR];
}
function fmt(s){const d=parse(s);return d.getUTCDate()+" "+MON[d.getUTCMonth()];}
function fmtRange(a,b){ if(!b||a===b) return fmt(a); const A=parse(a),B=parse(b); if(A.getUTCMonth()===B.getUTCMonth()&&A.getUTCFullYear()===B.getUTCFullYear()) return A.getUTCDate()+"–"+B.getUTCDate()+" "+MON[B.getUTCMonth()]; return fmt(a)+" – "+fmt(b);}
function wdOf(s){return WD[parse(s).getUTCDay()];}

function matches(e,a,b){
  if(e.ty==="venue") return (!e.st || e.st<=b) && (!e.en || e.en>=a);
  const st=e.st||"1900-01-01", en=e.en||(e.ty==="recurring"?FAR:st);
  if(st>b||en<a) return false;
  if(e.ty!=="recurring") return true;
  let from = a>st?a:st, to = b<en?b:en, n=0;
  for(let d=from; d<=to && n<8; d=add(d,1), n++) if(e.wd.includes(parse(d).getUTCDay())) return true;
  return false;
}
function weekendWin(){const g=parse(TODAY).getUTCDay(); if(g===0) return [TODAY,TODAY]; const sat=add(TODAY,(6-g+7)%7); return [sat,add(sat,1)];}
function tagsOf(e){const s=new Set(tagsRaw(e)); if(e.ty!=="venue"){const [a,b]=weekendWin(); if(matches(e,a,b)) s.add("weekend");} return s;}
function passFilters(e,{cat=true}={}){
  if(cat && state.cat && !tagsOf(e).has(state.cat)) return false;
  if(cat && (state.cat==="sport"||state.cat==="sportev") && state.sub && e.sub!==state.sub) return false;
  if(state.aud==="kids" && !(e.aud==="kids"||e.aud==="all")) return false;
  if(state.aud==="adults" && !(e.aud==="adults"||e.aud==="all")) return false;
  if(state.city==="dubai" && e.city!=="Дубай") return false;
  if(state.city==="ad" && e.city!=="Абу-Даби") return false;
  if(state.city==="other" && (e.city==="Дубай"||e.city==="Абу-Даби")) return false;
  if(state.q){const h=(e.ti+" "+e.pl+" "+e.sm+" "+e.city).toLowerCase(); if(!h.includes(state.q)) return false;}
  return true;
}
const esc = s => String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function dateCell(e,a){
  if(e.ty==="venue") return e.st&&e.st>TODAY?`${T("с","from")} ${fmt(e.st)}<small>${e.en?T("до ","until ")+fmt(e.en):T("откроется","opening")}</small>`:(e.en?`${T("работает","open")}<small>${T("до","until")} ${fmt(e.en)}</small>`:(e.st&&e.st>=add(TODAY,-21)?`${T("открыто","now open")}<small>${T("с","since")} ${fmt(e.st)}</small>`:T(`в любой день`,`any day`)));
  if(e.ty==="recurring"){const days=e.wd.length===7?T("ежедневно","daily"):e.wd.map(x=>WD[x]).join(", "); return `${days}<small>${e.en?T("до ","until ")+fmt(e.en):T("регулярно","regular")}</small>`;}
  const st=e.st,en=e.en||st, now = st<TODAY && en>=TODAY;
  let h = fmtRange(st,en) + `<small>${st===en?wdOf(st):wdOf(st)+" – "+wdOf(en)}</small>`;
  if(now) h += `<span class="now">${T("идёт сейчас","on now")}</span>`; else if(st===TODAY) h+=`<span class="now">${T("сегодня","today")}</span>`;
  return h;
}
function card(e,a){
  const audT = e.aud==="kids"?T("детям","kids"):e.aud==="adults"?T("взрослым","adults"):T("всей семье","all ages");
  const links = [];
  // гостям — только ссылка на само событие или организатора; пост в Telegram видит только редактор
  const u=String(e.u||"");
  if(e.src==="pl") links.push(`<a href="${esc(u)}" target="_blank" rel="noopener">${T("Билеты на Platinumlist","Tickets on Platinumlist")} ↗</a>`);
  else {
    if(u && !/t\.me\/c\//.test(u)) links.push(`<a href="${esc(u)}" target="_blank" rel="noopener">${/t\.me\//.test(u)?T("Подробнее в Telegram ↗","More on Telegram ↗"):/instagram\.com/.test(u)?T("Организатор в Instagram ↗","Organiser on Instagram ↗"):/platinumlist/.test(u)?T("Билеты на Platinumlist ↗","Tickets on Platinumlist ↗"):T("Сайт организатора ↗","Organiser website ↗")}</a>`);
    if(EDITOR && e.s && e.p) links.push(`<a href="https://t.me/${esc(e.s)}/${esc(e.p)}" target="_blank" rel="noopener">Источник в Telegram (видно только вам) ↗</a>`);
  }
  return `<article class="item"><div class="date">${dateCell(e,a)}</div><div style="min-width:0">
    <h3>${esc(e.ti)}</h3><div class="meta">${esc(e.pl)}${e.city&&!String(e.pl).includes(e.city)&&!String(e.pl).includes(cityName(e.city))?" · "+esc(cityName(e.city)):""}</div>
    <p>${esc(e.sm)}</p>
    <div class="tags">${[...tagsOf(e)].map(c=>`<span class="tag">${c==="sport"&&e.sub&&SUBS[e.sub]?SUBS[e.sub]:CATS[c]}</span>`).join("")}<span class="tag">${audT}</span>${e.pr?`<span class="tag price">${esc(e.pr)}</span>`:""}</div>
    <div class="links">${links.join("")}</div>${(EDITOR&&(edOn||view!=="site"))?editor(e):""}</div></article>`;
}

function editor(e){
  const id=esc(e.id);
  const tg=tagsRaw(e);
  const chips=Object.keys(CATS).map(k=>`<button class="chip" data-act="cat" data-id="${id}" data-c="${k}" aria-pressed="${tg.includes(k)}">${CATS[k]}</button>`).join("")
    + ((tg.includes("sport")||tg.includes("sportev"))?`<select aria-label="Вид спорта" data-act="f" data-f="sub" data-id="${id}">${Object.entries(SUBS).map(([k,v])=>`<option value="${k}"${(e.sub||"other")===k?" selected":""}>${v}</option>`).join("")}</select>`:"");
  const st=e.status||"approved";
  const acts = st==="approved" ? `<button class="btn no" data-act="status" data-id="${id}" data-s="rejected">Снять с сайта</button>`
    : st==="pending" ? `<button class="btn ok" data-act="status" data-id="${id}" data-s="approved">Опубликовать</button><button class="btn no" data-act="status" data-id="${id}" data-s="rejected">Отклонить</button>`
    : `<button class="btn" data-act="status" data-id="${id}" data-s="pending">Вернуть на проверку</button>`;
  return `<div class="ed">
    <div class="row"><span class="st ${st}">${st==="approved"?"на сайте":st==="pending"?"на проверке":"отклонено"}</span><input type="text" aria-label="Название" data-act="f" data-f="ti" data-id="${id}" value="${esc(e.ti)}"></div>
    <div class="row">${chips}</div>
    <div class="row"><label>Ссылка организатора</label><input type="text" aria-label="Ссылка организатора" data-act="f" data-f="u" data-id="${id}" value="${esc(e.u)}" placeholder="https://…"></div>
    <div class="row"><label>Для кого</label><select data-act="f" data-f="aud" data-id="${id}">${[["all","всей семье"],["kids","детям"],["adults","взрослым"]].map(([v,l])=>`<option value="${v}"${e.aud===v?" selected":""}>${l}</option>`).join("")}</select>
      ${e.ty==="venue"?"":`<label>с</label><input type="date" data-act="f" data-f="st" data-id="${id}" value="${esc(e.st)}"><label>по</label><input type="date" data-act="f" data-f="en" data-id="${id}" value="${esc(e.en)}">`}</div>
    <div class="row">${acts}<span class="saving" data-saving="${id}"></span></div></div>`;
}
const chains={};
function save(id,patch){
  const it=ITEMS.find(x=>x.id===id); if(!it) return;
  Object.assign(it,patch); render();
  if(!DB) return;
  const el=()=>document.querySelector(`[data-saving="${CSS.escape(id)}"]`);
  chains[id]=(chains[id]||Promise.resolve()).then(()=>DB.collection("items").doc(id).update(Object.assign({},patch,{updatedAt:new Date().toISOString()})))
    .then(()=>{const s=el(); if(s) s.textContent="Сохранено";})
    .catch(err=>{const s=el(); if(s) s.textContent="Не сохранилось: "+(err&&err.code||"ошибка")+". Обновите страницу и попробуйте ещё раз.";});
}
function onEdit(ev){
  const t=ev.target.closest("[data-act]"); if(!t||!EDITOR) return;
  const id=t.dataset.id, it=ITEMS.find(x=>x.id===id); if(!it) return;
  if(ev.type==="click"&&t.dataset.act==="cat"){const c=t.dataset.c, cur=tagsRaw(it); let cs=cur.includes(c)?cur.filter(x=>x!==c):[...cur,c]; if(!cs.length) return; const p={tags:cs}; if((c==="sport"||c==="sportev")&&cs.includes(c)&&!it.sub) p.sub="other"; save(id,p);}
  if(ev.type==="click"&&t.dataset.act==="status") save(id,{status:t.dataset.s});
  if(ev.type==="change"&&t.dataset.act==="f"){const v=t.value.trim(); if(t.dataset.f==="ti"&&!v) return; save(id,{[t.dataset.f]:v});}
}
["events","venues","queue"].forEach(k=>{const el=document.getElementById(k); el.addEventListener("click",onEdit); el.addEventListener("change",onEdit);});
function renderEditor(){
  const bar=document.getElementById("edbar"); bar.hidden=!EDITOR; if(!EDITOR) return;
  bar.querySelectorAll(".seg").forEach(x=>x.setAttribute("aria-pressed",x.dataset.v===view));
  const pend=ITEMS.filter(e=>e.status==="pending"), rej=ITEMS.filter(e=>e.status==="rejected");
  document.getElementById("nPend").textContent=pend.length; document.getElementById("nRej").textContent=rej.length;
  document.getElementById("siteBox").hidden = view!=="site";
  document.getElementById("queueBox").hidden = view==="site";
  if(view!=="site"){
    const list=(view==="pending"?pend:rej).slice().sort((x,y)=>(y.d||"").localeCompare(x.d||""));
    document.getElementById("qH").textContent = view==="pending"?"На проверке":"Отклонено";
    document.getElementById("qSub").textContent = view==="pending"?"Новые находки из каналов. Отметьте категории, поправьте название или даты и опубликуйте или отклоните.":"Карточки, которые не попадут на сайт. Любую можно вернуть на проверку.";
    document.getElementById("queue").innerHTML = list.map(e=>card(e,TODAY)).join("") || `<div class="empty">${view==="pending"?"Очередь пуста. Новые находки появятся после ежедневного обновления.":"Отклонённых нет."}</div>`;
  }
}
function render(){
  renderEditor();
  const [a,b]=windowFor();
  document.querySelectorAll(".seg").forEach(x=>x.setAttribute("aria-pressed",x.dataset.w===state.w));
  document.getElementById("rangeBox").hidden = state.w!=="custom";
  document.getElementById("span").textContent = b===FAR ? T(`с ${fmt(a)} и дальше`,`from ${fmt(a)} onwards`) : (a===b?`${fmt(a)}, ${wdOf(a)}`:`${fmtRange(a,b)} · ${wdOf(a)}–${wdOf(b)}`);
  const inWin = ITEMS.filter(e=>(e.status||"approved")==="approved" && matches(e,a,b));
  // счётчики категорий по текущему окну и прочим фильтрам
  const base = inWin.filter(e=>passFilters(e,{cat:false}));
  const cnt={}, scnt={}; base.forEach(e=>{const t=tagsOf(e); t.forEach(c=>cnt[c]=(cnt[c]||0)+1); if(state.cat&&t.has(state.cat)){const k=e.sub||"other"; scnt[k]=(scnt[k]||0)+1;}});
  document.getElementById("cats").innerHTML = `<button class="chip" data-cat="" aria-pressed="${!state.cat}">${T("Все","All")}</button>` + Object.keys(CATS).filter(k=>cnt[k]||state.cat===k).map(k=>`<button class="chip" data-cat="${k}" aria-pressed="${state.cat===k}">${CATS[k]}<span class="n">${cnt[k]||0}</span></button>`).join("");
  document.getElementById("subRow").hidden = !(state.cat==="sport"||state.cat==="sportev");
  document.getElementById("subs").innerHTML = `<button class="chip" data-sub="" aria-pressed="${!state.sub}">${T("Все виды","All sports")}</button>` + Object.keys(SUBS).filter(k=>scnt[k]||state.sub===k).map(k=>`<button class="chip" data-sub="${k}" aria-pressed="${state.sub===k}">${SUBS[k]}<span class="n">${scnt[k]||0}</span></button>`).join("");
  document.getElementById("auds").innerHTML = Object.entries(AUDS).map(([k,v])=>`<button class="chip" data-aud="${k}" aria-pressed="${state.aud===k}">${v}</button>`).join("");
  document.getElementById("cities").innerHTML = [["all",T("Все","All")],["dubai",T("Дубай","Dubai")],["ad",T("Абу-Даби","Abu Dhabi")],["other",T("Другие эмираты","Other emirates")]].map(([k,v])=>`<button class="chip" data-city="${k}" aria-pressed="${state.city===k}">${v}</button>`).join("");
  const shown = inWin.filter(passFilters);
  const evs = shown.filter(e=>e.ty!=="venue").sort((x,y)=>{const xs=(x.st||"")<a?a:x.st, ys=(y.st||"")<a?a:y.st; return xs<ys?-1:xs>ys?1:(x.en||x.st||"").localeCompare(y.en||y.st||"");});
  const vns = shown.filter(e=>e.ty==="venue").sort((x,y)=>(y.st||y.d).localeCompare(x.st||x.d));
  document.getElementById("evSub").textContent = evs.length ? (EN?`${evs.length} event${evs.length===1?"":"s"} on the selected dates`:`${evs.length} ${plural(evs.length,"событие","события","событий")} в выбранные даты`) : "";
  document.getElementById("events").innerHTML = evs.map(e=>card(e,a)).join("") || `<div class="empty">${T("В эти даты событий не нашлось. Попробуйте другие дни или уберите фильтры — места ниже открыты всегда.","No events on these dates. Try other days or clear the filters — the places below are open any day.")}</div>`;
  document.getElementById("venues").innerHTML = vns.map(e=>card(e,a)).join("") || `<div class="empty">${T("Под эти фильтры мест нет.","No places match these filters.")}</div>`;
  const one = state.cat;
  document.getElementById("ctaA").href = "https://lovely.city/"+(one?SURVEY[one]+"/":(EN?"en/":"")); document.querySelectorAll(".ctaB").forEach(x=>x.href=document.getElementById("ctaA").href);
  
  try{localStorage.setItem("leisure-f",JSON.stringify({w:state.w,aud:state.aud,city:state.city}));}catch(e){}
}
function plural(n,a,b,c){const m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c;}

document.querySelector(".when").addEventListener("click",ev=>{const t=ev.target.closest(".seg"); if(!t) return; state.w=t.dataset.w; if(state.w==="custom"&&!state.d1){state.d1=TODAY; state.d2=add(TODAY,6); d1.value=state.d1; d2.value=state.d2;} render();});
document.querySelector(".filters").addEventListener("click",ev=>{const t=ev.target.closest(".chip"); if(!t) return;
  if(t.dataset.cat!==undefined){const k=t.dataset.cat||null; state.cat = state.cat===k?null:k; state.sub=null;}
  if(t.dataset.sub!==undefined){state.sub=t.dataset.sub||null;}
  if(t.dataset.aud) state.aud=t.dataset.aud;
  if(t.dataset.city) state.city=t.dataset.city;
  render();});
const d1=document.getElementById("d1"), d2=document.getElementById("d2");
d1.addEventListener("change",()=>{state.d1=d1.value; render();});
d2.addEventListener("change",()=>{state.d2=d2.value; render();});
document.getElementById("q").addEventListener("input",ev=>{state.q=ev.target.value.trim().toLowerCase(); render();});
if(state.w==="custom"){state.d1=TODAY;state.d2=add(TODAY,6);d1.value=state.d1;d2.value=state.d2;}
render();
document.getElementById("edbar").addEventListener("click",ev=>{const t=ev.target.closest(".seg"); if(!t) return; view=t.dataset.v; render();});
document.getElementById("edOn").addEventListener("change",ev=>{edOn=ev.target.checked; render();});
(async()=>{
  try{
    const c=window.claude; if(!c||!c.use) return;
    const [db,user]=await Promise.all([c.use("db"),c.use("user")]);
    if(!db) return;
    DB=db;
    EDITOR = !!(user && ((await user.isOwner()) || (await user.canEdit())));
    db.collection("items").onSnapshot(snap=>{
      if(snap.empty){ render(); return; }
      ITEMS = snap.docs.map(d=>Object.assign({id:d.id},d.data())).filter(e=>Array.isArray(e.tags)||Array.isArray(e.cats));
      render();
    },()=>{});
    render();
  }catch(e){}
})();

(async()=>{try{const h=Math.floor(Date.now()/3600e3), base="https://raw.githubusercontent.com/lovely-city/events/main/";
const d=await fetch(base+"events.json?t="+h,{cache:"no-store"}).then(r=>r.json());
let tr={}; if(EN){try{tr=await fetch(base+"tr.json?t="+h,{cache:"no-store"}).then(r=>r.json());}catch(e){}}
if(Array.isArray(d)&&!DB){ITEMS=d.map(e=>Object.assign({status:"approved"},e,EN&&tr[e.id]?tr[e.id]:{}));render();}}catch(e){}})();
