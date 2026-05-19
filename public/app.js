const DUMMY_USER = { email: 'admin', username: 'admin', password: 'admin' };

let pct = 0;
const pctEl = document.getElementById('loader-pct');
const loaderInterval = setInterval(() => {
  pct += Math.floor(Math.random() * 18) + 6;
  if (pct >= 100) { pct = 100; clearInterval(loaderInterval); }
  pctEl.textContent = pct + '%';
  if (pct === 100) setTimeout(() => document.getElementById('loader').classList.add('out'), 300);
}, 120);

function navigate(page) {
  document.documentElement.setAttribute('data-page', page);
  window.scrollTo(0, 0);
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const navEl = document.getElementById('nav-' + page);
  if (navEl) navEl.classList.add('active');
}

function goToDocs() {
  window.location.href = '/docs';
}

function toggleFaq(el) {
  const item = el.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.faq-a').style.maxHeight = null;
  });
  if (!isOpen) {
    item.classList.add('open');
    const a = item.querySelector('.faq-a');
    a.style.maxHeight = a.scrollHeight + 'px';
  }
}

function toggleEp(el) {
  const card = el.parentElement;
  const isOpen = card.classList.contains('open');
  document.querySelectorAll('.endpoint-card').forEach(c => c.classList.remove('open'));
  if (!isOpen) card.classList.add('open');
}

function switchTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-reg').classList.toggle('active', tab === 'reg');
  document.getElementById('log-form').classList.toggle('show', tab === 'login');
  document.getElementById('reg-form').classList.toggle('show', tab === 'reg');
  document.getElementById('login-error').style.display = 'none';
  const regErr = document.getElementById('reg-error');
  regErr.style.display = 'none';
  document.getElementById('reg-success').classList.remove('show');
}

function showOAuthMsg(provider) {
  showToast('🔗', provider + ' OAuth', 'Belum terhubung — pasang storage dulu');
}

function copyBaseUrl() {
  navigator.clipboard.writeText(document.getElementById('base-url').textContent);
  const btn = document.querySelector('.copy-btn');
  btn.textContent = 'Copied!';
  setTimeout(() => btn.textContent = 'Copy', 1500);
}

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showToast(icon, title, sub) {
  const root = document.getElementById('toast-root');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<div class="toast-i">${icon}</div><div><div class="toast-t">${title}</div><div class="toast-s">${sub}</div></div>`;
  root.appendChild(t);
  setTimeout(() => t.classList.add('show'), 50);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 4000);
}

function handleLogin() {
  const emailVal = document.getElementById('login-email').value.trim();
  const passVal = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-error');

  const isValid =
    (emailVal === DUMMY_USER.email || emailVal === DUMMY_USER.username) &&
    passVal === DUMMY_USER.password;

  if (!isValid) {
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';
  showToast('✓', 'Login berhasil', 'Mengalihkan ke profil...');
  setTimeout(() => { window.location.href = '/profile'; }, 1400);
}

function handleRegister() {
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  const errEl = document.getElementById('reg-error');
  const successEl = document.getElementById('reg-success');

  errEl.style.display = 'none';
  successEl.classList.remove('show');

  if (!username || !email || !pass || !pass2) {
    errEl.textContent = 'Semua field wajib diisi.';
    errEl.style.display = 'block';
    return;
  }
  if (pass !== pass2) {
    errEl.textContent = 'Password tidak cocok.';
    errEl.style.display = 'block';
    return;
  }
  if (pass.length < 8) {
    errEl.textContent = 'Password minimal 8 karakter.';
    errEl.style.display = 'block';
    return;
  }

  successEl.classList.add('show');
  showToast('✓', 'Login berhasil', 'Akun berhasil dibuat');
}

const cmds = [
  {
    text: `curl "https://api.codersid.biz.id/ai/chatbot?prompt=halo&model=chatgpt4" -H "x-api-key: YOUR_KEY"`,
    out: `{
  <span style="color:#4d9fff">"status"</span>: <span style="color:#f59e0b">true</span>,
  <span style="color:#4d9fff">"model"</span>: <span style="color:#00e5cc">"chatgpt4"</span>,
  <span style="color:#4d9fff">"response"</span>: <span style="color:#00e5cc">"Halo! Ada yang bisa saya bantu?"</span>
}`
  },
  {
    text: `curl "https://api.codersid.biz.id/search/youtube?q=lofi+hip+hop" -H "x-api-key: YOUR_KEY"`,
    out: `{
  <span style="color:#4d9fff">"status"</span>: <span style="color:#f59e0b">true</span>,
  <span style="color:#4d9fff">"result"</span>: [{ <span style="color:#4d9fff">"title"</span>: <span style="color:#00e5cc">"Lofi Hip Hop Radio"</span>, ... }]
}`
  }
];
let ci = 0;
async function runTerminal() {
  const cmdEl = document.getElementById('term-cmd');
  const outEl = document.getElementById('term-out');
  const caret = document.getElementById('term-caret');
  const cmd = cmds[ci % cmds.length]; ci++;
  cmdEl.textContent = '';
  outEl.style.display = 'none';
  caret.style.display = 'inline-block';
  for (let i = 0; i < cmd.text.length; i++) {
    cmdEl.textContent += cmd.text[i];
    await sleep(28);
  }
  caret.style.display = 'none';
  await sleep(500);
  outEl.innerHTML = `<pre style="font-family:var(--ff-mono);font-size:11px;line-height:1.8;color:#6b7898;white-space:pre-wrap">${cmd.out}</pre>`;
  outEl.style.display = 'block';
  await sleep(5000);
  runTerminal();
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
setTimeout(runTerminal, 1800);

const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
}, { threshold: 0.07 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

const btt = document.getElementById('btt');
window.addEventListener('scroll', () => btt.classList.toggle('show', window.scrollY > 400));

document.getElementById('yr').textContent = new Date().getFullYear();

let reqN = 1254380;
const reqEl = document.getElementById('stat-req');
setInterval(() => { reqN += Math.floor(Math.random() * 4) + 1; reqEl.textContent = reqN.toLocaleString() + '+'; }, 3000);

const activities = [
  ['🤖', 'User AI Request', '/ai/chatbot → 200ms'],
  ['📺', 'YouTube Search', '/search/youtube → 145ms'],
  ['🎌', 'Anime Scraper', '/anime/alqanime/ongoing → 89ms'],
  ['🎨', 'Image Created', '/ai/deepimg → 312ms'],
  ['🔍', 'NPM Search', '/search/npm → 67ms'],
];
setTimeout(() => {
  showActivity();
  setInterval(() => { if (Math.random() > .5) showActivity(); }, 8000);
}, 4000);
function showActivity() {
  const a = activities[Math.floor(Math.random() * activities.length)];
  showToast(a[0], a[1], a[2]);
}AOS.init({duration:900,easing:'ease-out-cubic',once:true,offset:30});

    function toggleCategory(index){
        const c=document.getElementById(`category-${index}`),i=document.getElementById(`category-icon-${index}`);
        c.classList.contains('hidden')?(c.classList.remove('hidden'),i.textContent='expand_less'):(c.classList.add('hidden'),i.textContent='expand_more');
    }
    function toggleEndpoint(ci,ei){
        const e=document.getElementById(`endpoint-${ci}-${ei}`),i=document.getElementById(`endpoint-icon-${ci}-${ei}`);
        e.classList.contains('hidden')?(e.classList.remove('hidden'),i.textContent='expand_less'):(e.classList.add('hidden'),i.textContent='expand_more');
    }
    async function executeRequest(event,ci,ei,method,path,produces){
        event.preventDefault();
        const form=document.getElementById(`form-${ci}-${ei}`);
        const responseDiv=document.getElementById(`response-${ci}-${ei}`);
        const responseContent=document.getElementById(`response-content-${ci}-${ei}`);
        const clearButton=document.getElementById(`clear-${ci}-${ei}`);
        const params=new URLSearchParams();
        for(const[k,v]of new FormData(form).entries()) if(v) params.append(k,v);
        responseDiv.classList.remove('hidden');
        responseContent.innerHTML='<div class="flex justify-center py-4"><div class="loader"></div></div>';
        try{
            const res=await fetch(`${path}?${params.toString()}`);
            const ct=res.headers.get("content-type");
            if(ct&&ct.includes("application/json")){
                const d=await res.json();
                responseContent.innerHTML=`<pre>${JSON.stringify(d,null,2)}</pre>`;
            }else if(ct&&ct.startsWith("image/")){
                const blob=await res.blob();
                responseContent.innerHTML=`<img src="${URL.createObjectURL(blob)}" class="max-w-full h-auto rounded-md">`;
            }else{
                responseContent.innerHTML=`<pre>${await res.text()}</pre>`;
            }
        }catch(err){
            responseContent.innerHTML=`<pre style="color:#dc2626">${err}</pre>`;
        }
        clearButton.classList.remove('hidden');
    }
    function clearResponse(ci,ei){
        document.getElementById(`response-${ci}-${ei}`).classList.add('hidden');
        document.getElementById(`response-content-${ci}-${ei}`).innerHTML='';
        document.getElementById(`clear-${ci}-${ei}`).classList.add('hidden');
    }

    async function loadApis(){
        const apiList=document.getElementById('apiList');
        try{
            const res=await fetch('/assets/settings.json');
            const data=await res.json();
            let html='';
            data.categories.forEach((category,ci)=>{
                html+=`<div class="category-card category-group" data-category="${category.name}">
                    <div class="category-header" onclick="toggleCategory(${ci})">
                        <div class="flex items-center gap-2">
                            <span class="material-icons text-base text-gray-400">folder_open</span>
                            <span class="font-semibold text-sm text-gray-700">${category.name}</span>
                            <span class="text-xs text-gray-400">(${category.items.length})</span>
                        </div>
                        <span class="material-icons text-gray-400 text-lg" id="category-icon-${ci}">expand_more</span>
                    </div>
                    <div id="category-${ci}" class="hidden">`;
                category.items.forEach((item,ei)=>{
                    const method='GET';
                    const path=item.path.split('?')[0];
                    const qp=new URLSearchParams(item.path.split('?')[1]||'');
                    const sc={'ready':'status-ready','update':'status-update','error':'status-error'}[item.status]||'status-ready';
                    html+=`<div class="endpoint-item api-item" data-method="${method}" data-path="${path}" data-alias="${item.name}" data-description="${item.desc}" data-category="${category.name}">
                        <div class="endpoint-header" onclick="toggleEndpoint(${ci},${ei})">
                            <div class="flex items-center gap-2 min-w-0 flex-1">
                                <span class="method-badge">${method}</span>
                                <div class="min-w-0 flex-1">
                                    <div class="font-mono text-xs text-gray-700 truncate font-semibold">${path}</div>
                                    <div class="flex items-center gap-1.5 mt-0.5">
                                        <span class="text-xs text-gray-400 truncate">${item.name}</span>
                                        <span class="status-badge ${sc}">${item.status||'ready'}</span>
                                    </div>
                                </div>
                            </div>
                            <span class="material-icons text-gray-400 text-lg flex-shrink-0" id="endpoint-icon-${ci}-${ei}">expand_more</span>
                        </div>
                        <div id="endpoint-${ci}-${ei}" class="hidden endpoint-body">
                            <p class="text-xs text-gray-500 mb-3">${item.desc}</p>`;
                    if(item.status==='ready'){
                        html+=`<div>
                            <div class="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1"><span class="material-icons text-sm">play_arrow</span>TRY IT OUT</div>
                            <form id="form-${ci}-${ei}" onsubmit="executeRequest(event,${ci},${ei},'${method}','${path}','application/json')">
                                <div class="space-y-2 mb-3">`;
                        if(item.params){
                            Object.keys(item.params).forEach(p=>{
                                const req=!qp.has(p)||qp.get(p)==='';
                                html+=`<div><label class="block text-xs font-medium text-gray-500 mb-1">${p}${req?' <span style="color:#ef4444">*</span>':''}</label>
                                    <input type="text" name="${p}" class="form-input" placeholder="${item.params[p]}" ${req?'required':''}></div>`;
                            });
                        }
                        html+=`</div>
                            <button type="submit" class="btn-execute">Execute</button>
                            <button type="button" id="clear-${ci}-${ei}" onclick="clearResponse(${ci},${ei})" class="btn-clear hidden">Clear</button>
                            </form></div>`;
                    }else{
                        html+=`<div class="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">Endpoint ini tidak dapat diuji coba saat ini.</div>`;
                    }
                    html+=`<div id="response-${ci}-${ei}" class="hidden">
                        <div class="text-xs font-semibold text-gray-600 mt-3 mb-1 flex items-center gap-1"><span class="material-icons text-sm">code</span>RESPONSE</div>
                        <div class="response-box"><div id="response-content-${ci}-${ei}"></div></div>
                        </div></div></div>`;
                });
                html+=`</div></div>`;
            });
            apiList.innerHTML=html;
        }catch(e){
            apiList.innerHTML='<p class="text-sm text-red-500 text-center py-8">Failed to load API data.</p>';
        }
    }

    async function loadNotifications(){
        const list=document.getElementById('notifications-list');
        const badge=document.getElementById('unread-count');
        try{
            const res=await fetch('/notifications.json');
            const notifs=await res.json();
            list.innerHTML='';
            let unread=0;
            notifs.sort((a,b)=>new Date(b.date)-new Date(a.date));
            notifs.forEach(n=>{
                if(!n.read) unread++;
                const el=document.createElement('div');
                el.className=`notif-card${n.read?' opacity-60':''}`;
                el.innerHTML=`<div class="flex justify-between items-start gap-3">
                    <div class="flex-1">
                        <p class="font-semibold text-gray-700 mb-0.5">${n.title}</p>
                        <p class="text-gray-500">${n.message}</p>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        ${!n.read?'<div class="w-2 h-2 bg-green-400 rounded-full"></div>':''}
                        <span class="text-gray-400">${new Date(n.date).toLocaleDateString('id-ID',{year:'numeric',month:'short',day:'numeric'})}</span>
                    </div></div>`;
                list.appendChild(el);
            });
            if(unread>0){badge.textContent=`${unread} Belum dibaca`;badge.classList.remove('hidden');}
        }catch(e){
            list.innerHTML='<p class="text-xs text-red-500 text-center py-2">Gagal memuat notifikasi.</p>';
        }
    }

    document.getElementById('searchInput').addEventListener('input',function(){
        const t=this.value.toLowerCase();
        const items=document.querySelectorAll('.api-item');
        const cats=document.querySelectorAll('.category-group');
        let vis=0;
        items.forEach(item=>{
            const match=item.dataset.path.toLowerCase().includes(t)||item.dataset.alias.toLowerCase().includes(t)||item.dataset.description.toLowerCase().includes(t);
            item.style.display=match?'':'none';
            if(match) vis++;
        });
        cats.forEach(c=>{c.style.display=c.querySelectorAll('.api-item[style=""]').length>0?'':'none';});
        document.getElementById('noResults').style.display=vis===0?'block':'none';
    });

    document.addEventListener('DOMContentLoaded',()=>{loadApis();loadNotifications();});const DAILY_LIMIT = 40;
  const PROFILE_KEY = 'coders_profile_demo';
  const USAGE_KEY = 'coders_usage_demo';

  let profile = null;
  let usage = null;
  let apiKeyVisible = false;

  document.getElementById('yr').textContent = new Date().getFullYear();

  window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('loader').classList.add('out'), 450);
  });

  function todayStr(offset = 0) {
    const d = new Date();
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0,10);
  }

  function formatDateID(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  }

  function shortDateID(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: '2-digit' }).format(d);
  }

  function timeNow() {
    return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date());
  }

  function generateApiKey() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 28; i++) rand += chars[Math.floor(Math.random() * chars.length)];
    return 'CODERS_FREE_' + rand;
  }

  function initProfile() {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      profile = JSON.parse(saved);
      if (!('photo' in profile)) profile.photo = '';
      if (!profile.email || profile.email === 'jackos018@gmail.com') profile.email = 'coders@net';
      if (!profile.username || profile.username === 'jackos_x881') profile.username = 'coders_user';
      if (!profile.referral || profile.referral === 'jackos_xQCAH') profile.referral = 'coders_xQCAH';
      saveProfile();
      return;
    }
    profile = {
      username: 'coders_user',
      email: 'coders@net',
      role: 'FREE',
      joined: '2026-04-14',
      referral: 'coders_xQCAH',
      oauth: 'Tidak ada',
      photo: '',
      apiKey: generateApiKey()
    };
    saveProfile();
  }

  function initUsage() {
    const saved = localStorage.getItem(USAGE_KEY);
    if (saved) {
      usage = JSON.parse(saved);
      normalizeUsage();
      return;
    }

    const history = [];
    const seed = [4, 7, 3, 8, 6, 5];
    for (let i = 6; i >= 1; i--) {
      history.push({ date: todayStr(-i), count: seed[6 - i] || 0 });
    }
    history.push({ date: todayStr(0), count: 0 });

    usage = {
      lastReset: todayStr(0),
      usedToday: 0,
      history,
      logs: [
        { time: '09:13:11', endpoint: '/api/ai/search?q=naruto', method: 'GET', amount: 1, status: 'Success', day: todayStr(-1) },
        { time: '14:22:45', endpoint: '/api/downloader/tiktok', method: 'GET', amount: 2, status: 'Success', day: todayStr(-2) },
        { time: '18:05:09', endpoint: '/api/manga/latest', method: 'GET', amount: 1, status: 'Success', day: todayStr(-3) }
      ]
    };
    saveUsage();
  }

  function normalizeUsage() {
    const today = todayStr(0);
    const map = {};

    (usage.history || []).forEach(item => {
      map[item.date] = item.count;
    });

    if (usage.lastReset) {
      map[usage.lastReset] = usage.usedToday;
    }

    const rebuilt = [];
    for (let i = 6; i >= 0; i--) {
      const d = todayStr(-i);
      rebuilt.push({ date: d, count: map[d] || 0 });
    }

    usage.history = rebuilt;

    if (usage.lastReset !== today) {
      usage.lastReset = today;
      usage.usedToday = 0;
      usage.history[usage.history.length - 1].count = 0;
    } else {
      usage.history[usage.history.length - 1].count = usage.usedToday;
    }

    if (!Array.isArray(usage.logs)) usage.logs = [];
    saveUsage();
  }

  function saveProfile() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  function saveUsage() {
    localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  }

  function getRemaining() {
    return Math.max(0, DAILY_LIMIT - usage.usedToday);
  }

  function getWeekTotal() {
    return usage.history.reduce((sum, item) => sum + item.count, 0);
  }

  function getWeekAvg() {
    return (getWeekTotal() / 7).toFixed(1);
  }

  function getResetCountdown() {
    const now = new Date();
    const next = new Date();
    next.setHours(24, 0, 0, 0);
    const diff = next - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}j ${m}m`;
  }

  function maskApiKey(key) {
    if (!key) return '—';
    return key.slice(0, 6) + '••••••••••••••••' + key.slice(-6);
  }

  function renderProfile() {
    const first = (profile.username || 'C').charAt(0).toUpperCase();
    const avatarImg = document.getElementById('avatarPhoto');
    const avatarFallback = document.getElementById('avatarFallback');

    avatarFallback.textContent = first;
    if (profile.photo) {
      avatarImg.src = profile.photo;
      avatarImg.style.display = 'block';
      avatarFallback.style.display = 'none';
    } else {
      avatarImg.style.display = 'none';
      avatarFallback.style.display = 'flex';
    }

    document.getElementById('heroEyebrow').textContent = `# ${profile.role.toLowerCase()}-user — Selamat datang`;
    document.getElementById('heroSub').textContent = `${profile.username} · ${profile.email}`;

    document.getElementById('infoUsername').textContent = profile.username;
    document.getElementById('infoEmail').textContent = profile.email;
    document.getElementById('infoRole').textContent = profile.role;
    document.getElementById('infoJoined').textContent = formatDateID(profile.joined);
    document.getElementById('infoReferral').textContent = profile.referral;
    document.getElementById('infoOauth').textContent = profile.oauth;
    document.getElementById('roleText').textContent = profile.role;

    renderApiKey();
  }

  function renderStats() {
    const used = usage.usedToday;
    const remaining = getRemaining();
    const totalWeek = getWeekTotal();
    const percent = Math.min(100, Math.round((used / DAILY_LIMIT) * 100));

    document.getElementById('usedToday').textContent = used;
    document.getElementById('remainingText').textContent = `Sisa ${remaining} request`;
    document.getElementById('totalWeek').textContent = totalWeek;
    document.getElementById('usagePercent').textContent = `${percent}%`;
    document.getElementById('usageRing').style.setProperty('--p', `${(percent / 100) * 360}deg`);
    document.getElementById('resetTimeText').textContent = `Reset ${getResetCountdown()} lagi`;

    document.getElementById('chipToday').textContent = `${used} request`;
    document.getElementById('chipRemaining').textContent = `${remaining} request`;
    document.getElementById('chipReset').textContent = getResetCountdown();
    document.getElementById('chipAvg').textContent = `${getWeekAvg()} / hari`;

    document.getElementById('limitUsedCard').textContent = used;
    document.getElementById('limitRemainCard').textContent = remaining;
    document.getElementById('limitBar').style.width = `${(used / DAILY_LIMIT) * 100}%`;
  }

  function renderChart() {
    const canvas = document.getElementById('usageChart');
    const ctx = canvas.getContext('2d');
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 1200;
    const height = rect.height || 360;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 18, right: 18, bottom: 38, left: 42 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const data = usage.history.map(i => i.count);
    const labels = usage.history.map(i => shortDateID(i.date));
    const maxValue = Math.max(8, ...data, DAILY_LIMIT / 2);

    ctx.strokeStyle = 'rgba(15,23,42,0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartH / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = Math.round(maxValue - (maxValue / 5) * i);
      const y = padding.top + (chartH / 5) * i + 4;
      ctx.fillText(String(value), padding.left - 8, y);
    }

    const points = data.map((value, index) => {
      const x = padding.left + (chartW / (data.length - 1)) * index;
      const y = padding.top + chartH - (value / maxValue) * chartH;
      return { x, y, value };
    });

    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, 'rgba(0,0,0,.14)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.beginPath();
    points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
    ctx.lineTo(points[0].x, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2;
    ctx.stroke();

    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#111111';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,0,0,.14)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.fillStyle = '#7c8aa5';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const x = padding.left + (chartW / (labels.length - 1)) * i;
      ctx.fillText(label, x, height - 14);
    });
  }

  function renderLogs() {
    const wrap = document.getElementById('logList');
    wrap.innerHTML = '';
    const logs = [...usage.logs].reverse();

    if (!logs.length) {
      wrap.innerHTML = `<div class="empty-state">Belum ada request log. Gunakan simulasi request di tab <strong>Limit Harian</strong> untuk melihat statistik bergerak.</div>`;
      return;
    }

    logs.slice(0, 18).forEach(log => {
      const item = document.createElement('div');
      item.className = 'log-item';
      item.innerHTML = `
        <div>
          <div class="log-endpoint">${log.endpoint}</div>
          <div class="log-meta">${log.method} • ${formatDateID(log.day)} • ${log.time}</div>
        </div>
        <div class="log-col">${log.amount} request</div>
        <div class="log-col">${log.method}</div>
        <div class="log-col"><span class="status-pill">${log.status}</span></div>
      `;
      wrap.appendChild(item);
    });
  }

  function renderApiKey() {
    document.getElementById('apiKeyField').textContent = apiKeyVisible ? profile.apiKey : maskApiKey(profile.apiKey);
    document.getElementById('apiEyeIcon').className = apiKeyVisible ? 'fas fa-eye-slash' : 'fas fa-eye';
  }

  function renderAll() {
    renderProfile();
    renderStats();
    renderChart();
    renderLogs();
  }

  function switchTab(name) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[data-tab="${name}"]`).classList.add('active');
    document.getElementById(`tab-${name}`).classList.add('active');
  }

  function togglePass(id, btn) {
    const input = document.getElementById(id);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
      input.type = 'text';
      icon.className = 'fas fa-eye-slash';
    } else {
      input.type = 'password';
      icon.className = 'fas fa-eye';
    }
  }

  function showInlineMsg(id, type, text) {
    const el = document.getElementById(id);
    el.className = `inline-msg ${type}`;
    el.textContent = text;
  }

  function clearInlineMsgs() {
    ['emailMsg', 'usernameMsg'].forEach(id => {
      const el = document.getElementById(id);
      el.className = 'inline-msg';
      el.textContent = '';
    });
  }

  function setButtonLoading(id, on) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.classList.toggle('loading', on);
  }

  function updateEmail(e) {
    e.preventDefault();
    clearInlineMsgs();
    const email = document.getElementById('newEmail').value.trim();
    const pass = document.getElementById('emailPass').value.trim();
    if (!email || !pass) {
      showInlineMsg('emailMsg', 'error', 'Email baru dan password wajib diisi.');
      return;
    }
    setButtonLoading('emailBtn', true);
    setTimeout(() => {
      profile.email = email;
      saveProfile();
      renderProfile();
      showInlineMsg('emailMsg', 'success', 'Email berhasil diperbarui di profile demo.');
      showToast('Email berhasil diubah', 'fa-envelope-circle-check');
      document.getElementById('newEmail').value = '';
      document.getElementById('emailPass').value = '';
      setButtonLoading('emailBtn', false);
    }, 650);
  }

  function updateUsername(e) {
    e.preventDefault();
    clearInlineMsgs();
    const username = document.getElementById('newUsername').value.trim();
    const pass = document.getElementById('userPass').value.trim();
    if (!username || !pass) {
      showInlineMsg('usernameMsg', 'error', 'Username baru dan password wajib diisi.');
      return;
    }
    if (!/^[A-Za-z0-9_]{3,32}$/.test(username)) {
      showInlineMsg('usernameMsg', 'error', 'Username hanya boleh huruf, angka, dan underscore (3–32 karakter).');
      return;
    }
    setButtonLoading('usernameBtn', true);
    setTimeout(() => {
      profile.username = username;
      saveProfile();
      renderProfile();
      showInlineMsg('usernameMsg', 'success', 'Username berhasil diperbarui di profile demo.');
      showToast('Username berhasil diubah', 'fa-user-check');
      document.getElementById('newUsername').value = '';
      document.getElementById('userPass').value = '';
      setButtonLoading('usernameBtn', false);
    }, 650);
  }

  function addLog(endpoint, amount, status = 'Success') {
    usage.logs.push({
      time: timeNow(),
      endpoint,
      method: 'GET',
      amount,
      status,
      day: todayStr(0)
    });
    usage.logs = usage.logs.slice(-50);
  }

  function simulateRequest(amount) {
    const remaining = getRemaining();
    const endpoint = document.getElementById('endpointSelect').value;
    if (remaining < amount) {
      showToast(`Limit tidak cukup. Sisa ${remaining} request hari ini.`, 'fa-triangle-exclamation');
      switchTab('limit');
      return;
    }
    usage.usedToday += amount;
    usage.history[usage.history.length - 1].count = usage.usedToday;
    addLog(endpoint, amount, 'Success');
    saveUsage();
    renderAll();
    showToast(`${amount} request berhasil dicatat ke statistik`, 'fa-chart-line');
  }

  function toggleApiKeyVisibility() {
    apiKeyVisible = !apiKeyVisible;
    renderApiKey();
  }

  async function copyApiKey() {
    try {
      await navigator.clipboard.writeText(profile.apiKey);
      showToast('API Key berhasil disalin', 'fa-copy');
    } catch {
      showToast('Gagal menyalin API Key', 'fa-circle-xmark');
    }
  }

  function regenerateApiKey() {
    profile.apiKey = generateApiKey();
    saveProfile();
    renderApiKey();
    showToast('API Key baru berhasil dibuat', 'fa-rotate');
  }

  function handleAvatarUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('File harus berupa gambar', 'fa-circle-xmark');
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      profile.photo = e.target.result;
      saveProfile();
      renderProfile();
      showToast('Foto profil berhasil diperbarui', 'fa-camera');
    };
    reader.readAsDataURL(file);
  }

  function fakeLogout() {
    document.getElementById('logoutModal').classList.add('show');
  }

  function closeLogoutModal() {
    document.getElementById('logoutModal').classList.remove('show');
  }

  function confirmLogout() {
    closeLogoutModal();
    showToast('Logout dibatalkan karena ini masih demo profile', 'fa-right-from-bracket');
  }

  function showToast(message, icon = 'fa-circle-info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas ${icon}"></i><div><div>${message}</div><small>Coders API Profile</small></div>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('out');
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  }

  initProfile();
  initUsage();
  renderAll();

  setInterval(() => {
    normalizeUsage();
    renderStats();
    document.getElementById('chartSub').textContent = `Update realtime • reset dalam ${getResetCountdown()}`;
  }, 30000);

  document.getElementById('logoutModal').addEventListener('click', (e) => {
    if (e.target.id === 'logoutModal') closeLogoutModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLogoutModal();
  });

  window.addEventListener('resize', renderChart);