// 特斯拉机器人每日简报 — 网页界面逻辑
const API = {
  archive: '../archive.json',
  latest: '../latest.md',
  report: (file) => '../' + file,
};

async function loadArchive() {
  const res = await fetch(API.archive);
  if (!res.ok) throw new Error('无法读取 archive.json');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function renderSidebar(items) {
  const list = document.getElementById('dateList');
  list.innerHTML = '';
  items.forEach((it) => {
    const btn = document.createElement('button');
    btn.className = 'date-item';
    btn.dataset.file = it.file;
    btn.innerHTML =
      '<span class="d">' + it.date + '</span>' +
      '<span class="t">' + (it.title || '每日简报') + '</span>';
    btn.onclick = () => selectReport(it);
    list.appendChild(btn);
  });
}

function setActive(file) {
  document.querySelectorAll('.date-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.file === file);
  });
  document.getElementById('latestBtn')
    .classList.toggle('active', file === null);
}

async function loadAndRender(url, label) {
  const main = document.getElementById('content');
  main.innerHTML = '<div class="loading">加载中…</div>';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const md = await res.text();
    let html;
    if (window.marked && marked.parse) {
      html = marked.parse(md);
    } else {
      html = '<pre>' + md.replace(/</g, '&lt;') + '</pre>';
    }
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    tmp.querySelectorAll('a').forEach((a) => {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });
    main.innerHTML = tmp.innerHTML;
    document.getElementById('updated').textContent = '当前：' + label;
  } catch (e) {
    main.innerHTML =
      '<div class="error">加载失败：' + e.message +
      '<br>请确认通过本地服务器（如 python -m http.server）打开本页，' +
      '而非直接双击 index.html。</div>';
  }
}

async function showLatest() {
  setActive(null);
  await loadAndRender(API.latest, '最新一期');
}

async function selectReport(it) {
  setActive(it.file);
  await loadAndRender(API.report(it.file), it.date);
}

(async function init() {
  document.getElementById('latestBtn').onclick = showLatest;
  try {
    const items = await loadArchive();
    renderSidebar(items);
    await showLatest();
  } catch (e) {
    document.getElementById('content').innerHTML =
      '<div class="error">初始化失败：' + e.message +
      '<br>请确认通过本地服务器（如 python -m http.server）打开本页，' +
      '而非直接双击 index.html。</div>';
  }
})();
