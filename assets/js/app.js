const KEY='usagi-supplement-diary-v1';
const today=()=>dateKey(new Date());
const dateKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const parseDate=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
let state=loadState(), viewDate=new Date(), selectedDate=today();
function loadState(){try{return Object.assign({supplements:[],checks:{},memos:[],comparisons:[]},JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return {supplements:[],checks:{},memos:[],comparisons:[]}}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(s){const el=document.getElementById('toast');el.textContent=s;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1800)}
function showPage(name,btn){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.getElementById('page-'+name).classList.add('active');document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));btn?.classList.add('active');if(name==='calendar')renderCalendar();if(name==='memo')renderMemos();if(name==='compare')renderCompare()}
function openModal(title,body){document.getElementById('modalTitle').textContent=title;document.getElementById('modalBody').innerHTML=body;document.getElementById('modal').classList.add('show')}
function closeModal(){document.getElementById('modal').classList.remove('show')}
function openSupplement(){
openModal('영양제 등록',`<form id="suppForm"><div class="form-grid">
<div class="field full"><label>영양제 이름 *</label><input name="name" required placeholder="예: 비타민D 2000IU"></div>
<div class="field"><label>브랜드</label><input name="brand" placeholder="브랜드명"></div>
<div class="field"><label>복용 주기</label><select name="frequency"><option value="매일">매일</option><option value="격일">격일</option><option value="주 3회">주 3회</option><option value="주 1회">주 1회</option></select></div>
<div class="field full"><label>복용 시작일 *</label><input type="date" name="start" value="${today()}" required></div></div><div class="actions"><button type="button" class="secondary" onclick="closeModal()">취소</button><button class="primary">저장하기</button></div></form>`);
document.getElementById('suppForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.supplements.push({id:uid(),name:f.get('name').trim(),brand:f.get('brand').trim(),frequency:f.get('frequency'),start:f.get('start')});save();closeModal();renderHome();toast('영양제를 추가했어요 🐰')};
}
function shouldTake(s,day){if(day<s.start)return false;const diff=Math.floor((parseDate(day)-parseDate(s.start))/86400000);if(s.frequency==='격일')return diff%2===0;if(s.frequency==='주 3회')return [0,2,4].includes(parseDate(day).getDay());if(s.frequency==='주 1회')return parseDate(day).getDay()===parseDate(s.start).getDay();return true}
function toggleCheck(id){const d=today();state.checks[d]??=[];state.checks[d]=state.checks[d].includes(id)?state.checks[d].filter(x=>x!==id):[...state.checks[d],id];save();renderHome()}
function renderHome(){const day=today(),due=state.supplements.filter(s=>shouldTake(s,day)),done=state.checks[day]||[];const pct=due.length?Math.round(due.filter(s=>done.includes(s.id)).length/due.length*100):0;document.getElementById('percent').textContent=pct+'%';document.getElementById('progressFill').style.width=pct+'%';document.getElementById('progressText').textContent=due.length?`${done.filter(id=>due.some(s=>s.id===id)).length} / ${due.length}개 완료 · 오늘도 잘하고 있어요!`:'영양제를 등록하면 오늘의 루틴이 시작돼요.';const box=document.getElementById('todayList');if(!due.length){box.innerHTML=`<div class="empty"><div class="bunny">🐰🌼</div><h3>아직 등록된 루틴이 없어요!</h3><p>챙겨 먹는 영양제를 추가하고<br>나만의 건강 습관을 만들어봐요.</p><button class="primary" onclick="openSupplement()">첫 영양제 등록하기</button></div>`;return}box.innerHTML=due.map(s=>`<div class="supplement"><button class="check ${done.includes(s.id)?'done':''}" onclick="toggleCheck('${s.id}')">${done.includes(s.id)?'✓':''}</button><div class="supp-info"><strong>${esc(s.name)}</strong><small>${esc(s.brand||'브랜드 미입력')} · ${esc(s.frequency)}</small></div><button class="tiny-btn" onclick="deleteSupplement('${s.id}')">삭제</button></div>`).join('')}
function deleteSupplement(id){if(!confirm('이 영양제를 삭제할까요? 관련 섭취 체크 기록도 함께 정리됩니다.'))return;state.supplements=state.supplements.filter(s=>s.id!==id);Object.keys(state.checks).forEach(d=>state.checks[d]=state.checks[d].filter(x=>x!==id));save();renderHome();toast('삭제했어요')}
function shiftMonth(n){viewDate.setMonth(viewDate.getMonth()+n);renderCalendar()}
function renderCalendar(){const y=viewDate.getFullYear(),m=viewDate.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0);document.getElementById('monthLabel').textContent=`${y}년 ${m+1}월`;let cells=['일','월','화','수','목','금','토'].map(x=>`<div class="dow">${x}</div>`).join('');for(let i=0;i<first.getDay();i++)cells+=`<div class="day muted"></div>`;for(let n=1;n<=last.getDate();n++){const d=dateKey(new Date(y,m,n)),started=state.supplements.some(s=>s.start===d),checked=(state.checks[d]||[]).length;cells+=`<button class="day ${d===today()?'today':''} ${d===selectedDate?'selected':''}" onclick="selectDay('${d}')">${n}${started||checked?`<span class="dot">${started?'●':''}${checked?'✓':''}</span>`:''}</button>`}document.getElementById('calendarGrid').innerHTML=cells;showDayDetail();const sorted=[...state.supplements].sort((a,b)=>a.start.localeCompare(b.start));document.getElementById('timeline').innerHTML=sorted.length?sorted.map(s=>`<div class="supplement"><span style="font-size:18px">🌱</span><div class="supp-info"><strong>${esc(s.name)}</strong><small>${s.start} 시작 · ${esc(s.brand||'브랜드 미입력')}</small></div></div>`).join(''):`<div class="empty"><div class="bunny">🗓️</div><p>영양제를 등록하면 복용 시작일이 여기에 모여요.</p></div>`}
function selectDay(d){selectedDate=d;renderCalendar()}
function showDayDetail(){const due=state.supplements.filter(s=>shouldTake(s,selectedDate)),done=state.checks[selectedDate]||[];document.getElementById('dayDetail').innerHTML=`<strong>${selectedDate}</strong><br>${due.length?due.map(s=>`${done.includes(s.id)?'✅':'▫️'} ${esc(s.name)}`).join('<br>'):'이 날짜에 예정된 영양제가 없어요.'}<br><span style="color:#a58b91">완료 ${due.filter(s=>done.includes(s.id)).length} / ${due.length}</span>`}
function openMemo(){openModal('컨디션 메모',`<form id="memoForm"><div class="field"><label>날짜</label><input type="date" name="date" value="${today()}" required></div><div class="field"><label>관련 영양제</label><select name="supp"><option value="">전체 / 기타</option>${state.supplements.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div><div class="field"><label>컨디션 · 효과 · 부작용</label><textarea name="body" required placeholder="예: 오후 피로감이 줄어든 느낌, 속이 조금 불편함 등"></textarea></div><div class="actions"><button type="button" class="secondary" onclick="closeModal()">취소</button><button class="primary">메모 저장</button></div></form>`);document.getElementById('memoForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.memos.unshift({id:uid(),date:f.get('date'),supp:f.get('supp'),body:f.get('body').trim()});save();closeModal();renderMemos();toast('메모를 저장했어요 💌')}}
function renderMemos(){const el=document.getElementById('memoList');el.innerHTML=state.memos.length?state.memos.map(m=>{const s=state.supplements.find(x=>x.id===m.supp);return `<div class="memo"><small>${m.date} · ${esc(s?.name||'전체 / 기타')}</small><p>${esc(m.body).replace(/\n/g,'<br>')}</p><button class="tiny-btn" onclick="deleteMemo('${m.id}')">삭제</button></div>`}).join(''):`<div class="empty"><div class="bunny">💌</div><h3>첫 컨디션 기록을 남겨볼까요?</h3><p>몸의 변화를 꾸준히 기록해 보세요.</p></div>`}
function deleteMemo(id){state.memos=state.memos.filter(m=>m.id!==id);save();renderMemos()}
function openCompare(){openModal('비교 제품 추가',`<form id="compareForm"><div class="form-grid">
<div class="field full"><label>성분 / 카테고리 *</label><input name="category" required placeholder="예: 오메가3"></div>
<div class="field"><label>브랜드 *</label><input name="brand" required placeholder="브랜드명"></div><div class="field"><label>제품명</label><input name="product" placeholder="제품명"></div>
<div class="field"><label>가격 (원)</label><input name="price" type="number" min="0" placeholder="예: 29000"></div><div class="field"><label>함량</label><input name="dose" placeholder="예: EPA+DHA 1000mg"></div>
<div class="field full"><label>제형</label><input name="form" placeholder="예: 소프트젤, 캡슐, 분말"></div>
<div class="field"><label>장점</label><textarea name="pros" placeholder="원료, 인증, 가성비 등"></textarea></div><div class="field"><label>단점</label><textarea name="cons" placeholder="가격, 크기, 향 등"></textarea></div></div><div class="actions"><button type="button" class="secondary" onclick="closeModal()">취소</button><button class="primary">비교 목록에 저장</button></div></form>`);document.getElementById('compareForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.comparisons.push({id:uid(),category:f.get('category').trim(),brand:f.get('brand').trim(),product:f.get('product').trim(),price:f.get('price'),dose:f.get('dose'),form:f.get('form'),pros:f.get('pros'),cons:f.get('cons')});save();closeModal();renderCompare();toast('비교 제품을 저장했어요')}}
function renderCompare(){const filter=(document.getElementById('compareFilter')?.value||'').trim().toLowerCase();const rows=state.comparisons.filter(x=>!filter||x.category.toLowerCase().includes(filter));document.getElementById('compareBody').innerHTML=rows.length?rows.map(x=>`<tr><td><b>${esc(x.brand)}</b><br>${esc(x.product)}<br><span class="chip">${esc(x.category)}</span></td><td>${x.price?Number(x.price).toLocaleString()+'원':'—'}</td><td>${esc(x.dose||'—')}</td><td>${esc(x.form||'—')}</td><td>${esc(x.pros||'—')}</td><td>${esc(x.cons||'—')}</td><td><button class="tiny-btn" onclick="deleteCompare('${x.id}')">삭제</button></td></tr>`).join(''):`<tr><td colspan="7" style="text-align:center;color:#999;padding:28px">비교할 제품을 추가해 보세요 🐰</td></tr>`}
function deleteCompare(id){state.comparisons=state.comparisons.filter(x=>x.id!==id);save();renderCompare()}
document.getElementById('todayLabel').textContent=new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(new Date());
renderHome();

// Versioned JSON backup / restore
const BACKUP_SCHEMA = "usagi-supplement-diary";
const BACKUP_VERSION = 1;

function exportBackup() {
  const payload = {schema: BACKUP_SCHEMA, version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(), app: "Usagi Supplement Diary", data: state};
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type: "application/json;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `usagi_backup_${today()}.json`;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  toast("JSON 백업 파일을 만들었어요 🐰");
}
function isValidBackupData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  if (!Array.isArray(data.supplements) || !data.checks || typeof data.checks !== "object" ||
      !Array.isArray(data.memos) || !Array.isArray(data.comparisons)) return false;
  return data.supplements.every(s => s && typeof s.id === "string" && typeof s.name === "string" &&
      typeof s.start === "string" && typeof s.frequency === "string") &&
    Object.entries(data.checks).every(([d, ids]) => /^\d{4}-\d{2}-\d{2}$/.test(d) &&
      Array.isArray(ids) && ids.every(id => typeof id === "string")) &&
    data.memos.every(m => m && typeof m.id === "string" && typeof m.date === "string" && typeof m.body === "string") &&
    data.comparisons.every(c => c && typeof c.id === "string" && typeof c.category === "string" && typeof c.brand === "string");
}
async function importBackup(input) {
  const file = input.files && input.files[0]; if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error("백업 파일은 5MB 이하만 복원할 수 있어요.");
    const parsed = JSON.parse(await file.text());
    const data = parsed && parsed.schema === BACKUP_SCHEMA ? parsed.data : parsed;
    if (parsed && parsed.schema === BACKUP_SCHEMA && parsed.version > BACKUP_VERSION)
      throw new Error("더 최신 버전에서 만든 백업이에요. 앱을 업데이트한 뒤 복원해 주세요.");
    if (!isValidBackupData(data)) throw new Error("우사기 다이어리 백업 파일 형식이 올바르지 않아요.");
    if (!confirm("현재 브라우저의 기록을 백업 파일 내용으로 교체할까요? 기존 기록은 먼저 백업해 두는 것을 추천해요.")) return;
    state = {supplements:data.supplements, checks:data.checks, memos:data.memos, comparisons:data.comparisons};
    save(); renderHome(); renderMemos(); renderCompare(); renderCalendar();
    toast("백업 데이터를 복원했어요 ✨");
  } catch (err) { alert(err.message || "JSON 파일을 읽지 못했어요."); }
  finally { input.value = ""; }
}
// Future cloud-sync adapter hook. This is an extension point, not active cloud sync.
window.UsagiDiary = {
  exportBackup,
  getData: () => JSON.parse(JSON.stringify(state)),
  replaceData: data => {
    if (!isValidBackupData(data)) throw new Error("Invalid diary data");
    state = {supplements:data.supplements, checks:data.checks, memos:data.memos, comparisons:data.comparisons};
    save(); renderHome();
  }
};
