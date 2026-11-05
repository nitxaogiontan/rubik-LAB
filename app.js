/* RUBIK LAB — Full CFOP application logic */
(() => {
  'use strict';

  const DATA = window.RUBIK_DATA;
  const Cube = window.RubikCube;
  if (!DATA || !Cube) {
    document.body.innerHTML = '<main style="padding:2rem;font:16px system-ui;color:#fff;background:#111">Không tải được data.js hoặc cube.js. Hãy giữ đủ các file trong cùng một thư mục.</main>';
    return;
  }

  const ALL = [...DATA.F2L, ...DATA.OLL, ...DATA.PLL];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const tokenCount = alg => String(alg || '').trim().split(/\s+/).filter(Boolean).length;
  const groupName = group => ({f2l:'F2L', oll:'OLL', pll:'PLL'}[group] || group.toUpperCase());
  const learnedKey = 'rubikLabProLearned';
  const state = {
    filter: 'all',
    query: '',
    view: 'grid',
    filtered: ALL.slice(),
    learned: new Set(),
    beginnerIndex: 0,
    currentCase: null,
    activeAlgorithm: '',
    activeVariant: 'main',
    activeCaseData: null,
    caseMoves: [],
    moveIndex: 0,
    flashCurrent: null,
    timerRunning: false,
    timerStarted: 0,
    timerElapsed: 0,
    timerInterval: null,
    viewRotX: -26,
    viewRotY: -36,
    dragging: false,
    dragPointerId: null,
    dragLastX: 0,
    dragLastY: 0,
    previewObserver: null
  };

  try {
    const saved = JSON.parse(localStorage.getItem(learnedKey) || '[]');
    if (Array.isArray(saved)) state.learned = new Set(saved.filter(id => ALL.some(item => item.id === id)));
  } catch (_) { state.learned = new Set(); }

  function saveLearned() {
    try { localStorage.setItem(learnedKey, JSON.stringify([...state.learned])); } catch (_) { /* Private browsing may block storage. */ }
    updateProgress();
  }

  function updateProgress() {
    const count = state.learned.size;
    const label = $('#overallProgress');
    const bar = $('#overallBar');
    if (label) label.textContent = `${count} / ${ALL.length} đã đánh dấu thuộc`;
    if (bar) bar.style.width = `${(count / ALL.length) * 100}%`;
  }

  // Beginner lesson tabs and detail panel.
  function renderBeginner() {
    const tabs = $('#beginnerTabs');
    const detail = $('#beginnerDetail');
    if (!tabs || !detail) return;
    tabs.innerHTML = DATA.beginner.map((step, index) => `
      <button class="learn-step ${index === state.beginnerIndex ? 'active' : ''}" data-beginner="${index}" type="button">
        <span class="n">0${index + 1}</span><span><b>${escapeHTML(step.title)}</b><small>${escapeHTML(step.goal)}</small></span>
        ${index < state.beginnerIndex ? '<span class="checked">✓</span>' : ''}
      </button>`).join('');
    const step = DATA.beginner[state.beginnerIndex];
    detail.innerHTML = `
      <div class="learn-kicker">BEGINNER METHOD · STEP 0${state.beginnerIndex + 1} / 07</div>
      <h3>${escapeHTML(step.title)}</h3>
      <p class="learn-goal"><b>Mục tiêu:</b> ${escapeHTML(step.goal)}</p>
      <ol class="learn-how">${step.how.map(line => `<li>${escapeHTML(line)}</li>`).join('')}</ol>
      <div class="learn-alg"><span>CÔNG THỨC / THAO TÁC</span><code>${escapeHTML(step.alg)}</code></div>
      <div class="learn-tip"><b>Ghi nhớ:</b> ${escapeHTML(step.tip)}</div>
      <div class="learn-detail-controls">
        <button class="btn btn-soft" id="beginnerPrev" ${state.beginnerIndex === 0 ? 'disabled' : ''}>← Bước trước</button>
        <span>${state.beginnerIndex + 1} / ${DATA.beginner.length}</span>
        <button class="btn btn-main" id="beginnerNext" ${state.beginnerIndex === DATA.beginner.length - 1 ? 'disabled' : ''}>Bước tiếp →</button>
      </div>`;
  }

  function casePreview(item) {
    try {
      const cubeCase = Cube.makeCase(item.alg);
      return `<div class="cube-thumb-scene">${Cube.renderCube3D(cubeCase.start, {size:88})}</div>`;
    } catch (error) {
      return `<div class="preview-error">Sơ đồ lỗi: ${escapeHTML(error.message)}</div>`;
    }
  }

  function caseTag(item) {
    if (item.twoLook) return '<span class="case-tag tag-two">2-LOOK</span>';
    if (item.group === 'f2l') return '<span class="case-tag tag-f2l">PAIR CASE</span>';
    if (item.group === 'oll') return '<span class="case-tag tag-oll">ORIENTATION</span>';
    return '<span class="case-tag tag-pll">PERMUTATION</span>';
  }

  function hydrateCasePreviews(root) {
    if (state.previewObserver) state.previewObserver.disconnect();
    const placeholders = $$('[data-preview-id]', root);
    if (!placeholders.length) return;
    const paint = node => {
      const item = ALL.find(entry => entry.id === node.dataset.previewId);
      if (!item) return;
      node.innerHTML = casePreview(item);
      node.classList.remove('case-thumb-pending');
      node.removeAttribute('data-preview-id');
    };
    if (!('IntersectionObserver' in window)) {
      placeholders.forEach(paint);
      return;
    }
    state.previewObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        paint(entry.target);
        state.previewObserver?.unobserve(entry.target);
      });
    }, {rootMargin:'320px 0px'});
    placeholders.forEach(node => state.previewObserver.observe(node));
  }

  function renderGrid(items) {
    const grid = $('#algorithmGrid');
    if (!grid) return;
    if (!items.length) {
      if (state.previewObserver) state.previewObserver.disconnect();
      grid.innerHTML = '<div class="empty-state">Không thấy case khớp tìm kiếm. Thử OLL 21, F2L 12 hoặc Ua nha.</div>';
      return;
    }
    grid.innerHTML = items.map(item => `
      <article class="algorithm-card" data-open-case="${escapeHTML(item.id)}" tabindex="0" role="button" aria-label="Mở ${escapeHTML(item.case)}">
        <div class="alg-card-top"><span class="case-id">${escapeHTML(item.case)}</span>${caseTag(item)}</div>
        <div class="case-thumb case-thumb-pending" data-preview-id="${escapeHTML(item.id)}"><span>Đang dựng cube…</span></div>
        <div class="alg-recognition">${escapeHTML(item.recognition || item.subgroup || item.stage)}</div>
        <div class="alg-formula-small">${escapeHTML(item.alg)}</div>
        <div class="alg-card-bottom"><button type="button" data-copy-id="${escapeHTML(item.id)}">Copy công thức</button><span>${state.learned.has(item.id) ? '✓ Đã thuộc' : `${tokenCount(item.alg)} moves`}</span></div>
      </article>`).join('');
    hydrateCasePreviews(grid);
  }

  function renderTable(items) {
    const tbody = $('#algorithmTable');
    if (!tbody) return;
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="5">Không có case khớp tìm kiếm.</td></tr>';
      return;
    }
    tbody.innerHTML = items.map(item => `
      <tr>
        <td>${escapeHTML(item.case)} ${state.learned.has(item.id) ? '✓' : ''}</td>
        <td>${escapeHTML(item.subgroup || groupName(item.group))}${item.twoLook ? '<br><span class="table-two">2-LOOK</span>' : ''}</td>
        <td>${escapeHTML(item.recognition || item.hold || '')}</td>
        <td><code>${escapeHTML(item.alg)}</code></td>
        <td><button type="button" data-open-case="${escapeHTML(item.id)}">Xem case</button></td>
      </tr>`).join('');
  }

  function applyFilters() {
    const q = state.query.trim().toLowerCase();
    state.filtered = ALL.filter(item => {
      const matchesFilter = state.filter === 'all' || item.group === state.filter || (state.filter === '2look' && item.twoLook);
      const variantText = (item.variants || []).flatMap(variant => [variant.label, variant.alg, variant.note]);
      const haystack = [item.case, item.name, item.subgroup, item.recognition, item.stage, item.alg, item.id, ...variantText].join(' ').toLowerCase();
      return matchesFilter && (!q || haystack.includes(q));
    });
    const count = $('#resultCount');
    if (count) count.textContent = `Hiển thị ${state.filtered.length} / ${ALL.length} case`;
    renderGrid(state.filtered);
    renderTable(state.filtered);
  }

  function setFilter(filter) {
    state.filter = filter;
    $$('#filterRow [data-filter]').forEach(button => button.classList.toggle('active', button.dataset.filter === filter));
    applyFilters();
  }

  function setView(view) {
    state.view = view;
    $$('.view-switch [data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === view));
    $('#algorithmGrid').hidden = view !== 'grid';
    $('#algorithmTableWrap').hidden = view !== 'table';
  }

  // A case is generated by applying the inverse algorithm to a solved cube.
  // The player applies the actual algorithm one move at a time to return to solved.
  function applyCubeOrientation() {
    const cube = $('#cube3DHolder .rubik-cube-3d');
    if (!cube) return;
    cube.style.transform = `rotateX(${state.viewRotX}deg) rotateY(${state.viewRotY}deg)`;
  }

  function setCubeView(view) {
    const presets = {
      ISO: [-26, -36], F: [0, 0], B: [0, 180], R: [0, -90],
      L: [0, 90], U: [-90, 0], D: [90, 0]
    };
    const [x, y] = presets[view] || presets.ISO;
    state.viewRotX = x;
    state.viewRotY = y;
    applyCubeOrientation();
    $$('[data-cube-face]').forEach(button => button.classList.toggle('active', button.dataset.cubeFace === view));
  }

  function renderMoveState() {
    const item = state.currentCase;
    if (!item) return;
    const moves = state.caseMoves;
    const count = state.moveIndex;
    const cube = Cube.applyMoves(state.activeCaseData.start, moves.slice(0, count));
    $('#cube3DHolder').innerHTML = Cube.renderCube3D(cube, {size:230});
    applyCubeOrientation();
    $('#diagramNote').textContent = `Đã thực hiện ${count}/${moves.length} move · ${count === moves.length ? 'Cube đã trở về trạng thái giải.' : 'Đang hiển thị đúng trạng thái sau từng move.'}`;
    $('#moveCount').textContent = `${count} / ${moves.length}`;
    if (count === 0) {
      $('#moveCurrent').textContent = moves.length ? `Sẵn sàng · ${moves[0].token}` : 'Không có move';
      $('#moveMeaning').textContent = moves.length ? `Move kế tiếp: ${moveMeaning(moves[0].token)}` : 'Case này không có công thức.';
    } else {
      const last = moves[count - 1].token;
      $('#moveCurrent').textContent = `Đã thực hiện · ${last}`;
      $('#moveMeaning').textContent = count < moves.length ? `Tiếp theo ${moves[count].token}: ${moveMeaning(moves[count].token)}` : 'Hoàn tất công thức. Cube đã về trạng thái giải.';
    }
    const upcoming = count < moves.length ? moves[count].token : (moves.length ? moves[moves.length - 1].token : '');
    $('#fingerTipLive').textContent = count < moves.length ? `Ngón gợi ý cho ${upcoming}: ${fingerTrickForToken(upcoming)}` : 'Done! Lượt này đã chạy hết công thức. Reset để tập lại, đừng cố bấm thật nhanh.';
    $('#moveSequence').innerHTML = moves.map((move, index) => `<button type="button" class="move-chip ${index < count ? 'done' : ''} ${index === count ? 'active' : ''}" data-move-index="${index + 1}" title="Nhảy tới sau move ${index + 1}">${escapeHTML(move.token)}</button>`).join('');
    $('#movePrev').disabled = count === 0;
    $('#moveReset').disabled = count === 0;
    $('#moveNext').disabled = count === moves.length;
    $('#moveNext').textContent = count === moves.length ? 'Đã hoàn tất ✓' : 'Move tiếp →';
  }

  function moveMeaning(token) {
    const base = token[0];
    const suffix = token.slice(1);
    const names = {
      U:'mặt trên', D:'mặt dưới', R:'mặt phải', L:'mặt trái', F:'mặt trước', B:'mặt sau',
      u:'hai lớp trên (wide)', d:'hai lớp dưới (wide)', r:'hai lớp phải (wide)', l:'hai lớp trái (wide)', f:'hai lớp trước (wide)', b:'hai lớp sau (wide)',
      M:'lớp giữa dọc, theo chiều L', E:'lớp giữa ngang, theo chiều D', S:'lớp giữa trước-sau, theo chiều F',
      x:'xoay toàn bộ khối theo trục R', y:'xoay toàn bộ khối theo trục U', z:'xoay toàn bộ khối theo trục F'
    };
    const direction = suffix.includes('2') ? '180°' : suffix.includes("'") ? '90° ngược chiều kim đồng hồ khi nhìn thẳng mặt xoay' : '90° theo chiều kim đồng hồ khi nhìn thẳng mặt xoay';
    return `${names[base] || base}, ${direction}.`;
  }


  const CHUNK_SIZES = {
    'oll-21':[4,4,3], 'oll-26':[3,4], 'oll-27':[3,4],
    'oll-44':[3,3], 'oll-45':[3,3],
    'pll-t':[4,3,4,3], 'pll-ua':[4,4,3], 'pll-ub':[3,4,4], 'pll-h':[2,2,3], 'pll-ra':[4,4,4,3], 'pll-rb':[4,3,3,3], 'pll-z':[4,4,4,3]
  };

  function fingerTrickForToken(token) {
    const base = token[0];
    const cues = {
      R:'áp út tay phải flick mặt R; giữ các ngón còn lại đỡ cube',
      r:'xoay đồng thời hai lớp bên phải; giữ grip chắc, đừng chỉ xoay lớp ngoài',
      R2:'dùng flick kép hoặc hai cú xoay liền nhau, tránh nhấc cả bàn tay',
      U:'ngón giữa tay phải flick mặt U; hạn chế xoay cổ tay',
      U2:'flick kép mặt U, nối hai nhịp thật liền',
      F:'ngón cái tay phải đẩy mặt F xuống theo grip',
      F2:'đẩy kép mặt F; giữ cube không trượt',
      L:'ngón áp út tay trái hoặc cổ tay hỗ trợ, tùy grip',
      D:'dùng ngón tay/cổ tay hỗ trợ; cố định cube trước khi xoay',
      B:'đổi grip có kiểm soát nếu cần; đừng cố flick khi cube không ổn định',
      M:'dùng ngón giữa để đẩy lớp giữa; luyện M riêng trước khi chạy cả alg',
      S:'dùng ngón giữa đẩy lớp giữa trước-sau; không để cube bị xoay lệch',
      E:'dùng ngón giữa kéo lớp giữa ngang; giữ hai tầng ngoài ổn định',
      x:'xoay toàn bộ cube theo trục R; đây là regrip có chủ đích',
      y:'xoay toàn bộ cube theo trục U; giữ hướng nhận diện nhất quán',
      z:'xoay toàn bộ cube theo trục F; chỉ dùng khi công thức yêu cầu'
    };
    if (!token) return 'Chưa có move tiếp theo.';
    if (token.endsWith('2')) {
      if (base === 'R' || base === 'U' || base === 'F') return `flick kép mặt ${base}; nối hai nhịp và giữ cube không trượt`;
      if (base === 'M') return 'flick kép lớp M; tập riêng cho thẳng trước khi ghép vào algorithm';
    }
    if (token.includes("'")) {
      if (base === 'R') return 'ngón cái tay phải (hoặc ngón trỏ tùy grip) kéo mặt R ngược chiều';
      if (base === 'U') return 'ngón cái tay trái flick mặt U ngược chiều';
      if (base === 'F') return 'ngón trỏ tay phải kéo mặt F lên';
      if (base === 'M') return 'flick lớp M theo chiều ngược lại; đừng làm cube xoay theo';
      if (base === 'L') return 'ngón cái tay trái hoặc cổ tay hỗ trợ, tùy grip';
    }
    return cues[base] || 'giữ cube chắc và xoay đúng lớp được ký hiệu';
  }

  function splitIntoPracticeGroups(item, algorithm) {
    const tokens = String(algorithm || '').trim().split(/\s+/).filter(Boolean);
    const sizes = state.activeVariant === 'main' ? (CHUNK_SIZES[item.id] || []) : [];
    const plan = sizes.length && sizes.reduce((a,b)=>a+b,0) === tokens.length
      ? sizes
      : Array.from({length:Math.ceil(tokens.length/4)}, (_,i)=>Math.min(4,tokens.length-i*4));
    const groups = [];
    let cursor = 0;
    for (const size of plan) {
      groups.push(tokens.slice(cursor,cursor+size));
      cursor += size;
    }
    return groups;
  }

  function caseFingerSummary(item, algorithm) {
    const tokens = algorithm.trim().split(/\s+/).filter(Boolean);
    const bases = [...new Set(tokens.map(token=>token[0]))];
    const hasRU = bases.includes('R') && bases.includes('U');
    const hasF = bases.includes('F');
    const hasM = bases.includes('M');
    if (hasM) return 'Có M-slice: tập riêng M / M2 vài lượt cho thật thẳng. Giữ cube ổn định, không để cả khối xoay theo lớp giữa.';
    if (hasRU && hasF) return 'Giữ grip R-U-F sẵn sàng. Dùng ngón cho R/U, chuyển sang F bằng ngón cái hoặc trỏ; tránh nhấc tay giữa trigger.';
    if (hasRU) return 'Tập R-U liền mạch: R bằng áp út, U bằng ngón giữa, R\' bằng ngón cái, U\' bằng ngón cái tay trái. Chỉnh theo grip tự nhiên của m.';
    if (hasF) return 'F và F\' thường là đoạn dễ bị khựng. Tập riêng đẩy bằng ngón cái và kéo bằng ngón trỏ, rồi nối với các move giữa.';
    return 'Ưu tiên đúng hướng và giữ cube ổn định trước. Move nào khiến m phải đổi grip liên tục thì giảm tốc để tìm cách chuyển ngón mượt hơn.';
  }

  function casePracticeSummary(item) {
    if (item.id === 'oll-21') return `Đọc thành 3 block: R U2 R' U' / R U R' U' / R U' R'. Tập đúng từng block rồi nối lại, tránh pause sau mỗi move.`;
    if (item.id === 'oll-26') return 'Anti-Sune: đọc theo 3 + 4 move. Tập chậm cho U2 và các cú U\' không bị hụt.';
    if (item.id === 'oll-27') return 'Sune: giữ nhịp R U R\' / U R U2 R\'. Đây là trigger đáng luyện đến khi gần như tự động.';
    if (item.id === 'pll-ua') return 'Ua: tìm cạnh đã đúng và đặt nó ở phía sau; sau đó nhìn chiều ba cạnh còn lại chạy vòng. Bản M-slice chỉ chọn khi flick M đã ổn.';
    if (item.id === 'pll-ub') return 'Ub: để cạnh đã đúng ở phía sau, xác định chiều vòng ngược với Ua. Bản M-slice ngắn hơn nhưng cần kỹ thuật lớp giữa.';
    if (item.id === 'pll-ra') return `Ra: bản thay thế dùng R/U/F thay cho D/D'. Nếu D move làm m phải đổi grip, thử bản này và so cảm giác tay.`;
    if (item.id === 'pll-rb') return `Rb: thử chia 4 block, đặc biệt đoạn F R U R' U' F'. Ưu tiên giữ grip và nối đoạn F thật mượt.`;
    if (item.id === 'pll-z') return 'Z Perm: bản R/U-only dài hơn nhưng không cần M-slice. Học bản này nếu lớp giữa còn khựng; khi M đã ổn thì so lại bản chuẩn.';
    if (item.id === 'pll-t') return 'T Perm: học theo các block R/U rồi đến đoạn F. Khi đã thuộc, tập nối đoạn F mà không regrip thừa.';
    if (item.id === 'pll-y') return 'Y Perm khá dài: chia thành các cụm nhỏ, giữ grip ổn định ở đoạn F và chỉ tăng tốc khi không còn pause.';
    if (item.group === 'f2l') return 'Giữ cross trắng ở D, slot mục tiêu FR. Nhìn góc + cạnh cùng màu, ghép pair trước rồi mới chèn; đừng xoay cube lung tung giữa case.';
    if (item.group === 'oll') return 'Giữ vàng ở U và hai tầng dưới đã giải. Nhận diện pattern trước, căn U đúng hướng rồi mới chạy công thức.';
    return 'Giữ vàng ở U. Nhìn block/headlights để nhận diện, chạy alg liền mạch rồi dùng U / U\' căn cuối (AUF) nếu cần.';
  }

  function renderFormulaLearning(item) {
    const variants = item.variants || [];
    const selected = variants.find(variant => variant.id === state.activeVariant);
    const algorithm = selected ? selected.alg : item.alg;
    state.activeAlgorithm = algorithm;
    state.activeCaseData = Cube.makeCase(algorithm);
    state.caseMoves = state.activeCaseData.moves;
    state.moveIndex = 0;

    const picker = $('#formulaVariant');
    const pickerRow = $('#formulaVariantRow');
    picker.innerHTML = [
      `<option value="main">Bản chính · ${tokenCount(item.alg)} move</option>`,
      ...variants.map(variant => `<option value="${escapeHTML(variant.id)}">${escapeHTML(variant.label)} · ${tokenCount(variant.alg)} move</option>`)
    ].join('');
    picker.value = state.activeVariant;
    pickerRow.hidden = variants.length === 0;

    $('#modalFormula').textContent = algorithm;
    $('#modalSubtitle').textContent = `${item.subgroup || item.stage} · ${tokenCount(algorithm)} moves${item.twoLook ? ' · 2-look' : ''}${selected ? ` · ${selected.label}` : ''}`;
    $('#formulaMeta').textContent = `${tokenCount(algorithm)} move tokens · ${item.group === 'f2l' ? 'Cross ở D · slot mục tiêu FR' : 'U = vàng · D = trắng · F = xanh lá'}${state.activeCaseData.normalizedAlg !== algorithm ? ` · mô phỏng: ${state.activeCaseData.normalizedAlg}` : ''}`;
    $('#variantNote').hidden = !selected;
    $('#variantNote').textContent = selected ? selected.note : '';

    const groups = splitIntoPracticeGroups(item, algorithm);
    $('#formulaBreakdown').innerHTML = groups.map((group,index) => `
      <div class="formula-group"><span>${String(index+1).padStart(2,'0')}</span><code>${group.map(escapeHTML).join(' ')}</code></div>`).join('');
    $('#modalFingerTip').textContent = caseFingerSummary(item, algorithm);
    $('#modalPracticeTip').textContent = casePracticeSummary(item);
    renderMoveState();
  }

  function setFormulaVariant(variantId) {
    const item = state.currentCase;
    if (!item) return;
    const valid = variantId === 'main' || (item.variants || []).some(variant => variant.id === variantId);
    if (!valid) return;
    state.activeVariant = variantId;
    renderFormulaLearning(item);
  }

  function openCase(id) {
    const source = ALL.find(item => item.id === id);
    if (!source) return;
    const item = {...source};
    state.currentCase = item;
    state.activeVariant = 'main';
    $('#modalKicker').textContent = `${groupName(item.group)} · ${item.stage || 'CFOP'}`;
    $('#modalTitle').textContent = item.case;
    $('#modalHold').textContent = item.hold || 'Giữ vàng ở trên (U), trắng ở dưới (D), xanh lá ở trước (F).';
    $('#modalRecognition').textContent = item.recognition || '';
    $('#learnToggle').classList.toggle('learned', state.learned.has(item.id));
    $('#learnToggle').textContent = state.learned.has(item.id) ? '✓ Đã thuộc' : '＋ Đánh dấu đã thuộc';
    $('#modalProgressText').textContent = state.learned.has(item.id) ? 'Đã đánh dấu thuộc công thức này' : 'Chưa đánh dấu thuộc';
    $('#caseModal').hidden = false;
    document.body.style.overflow = 'hidden';
    setCubeView('ISO');
    renderFormulaLearning(item);
  }

  function closeModal() {
    $('#caseModal').hidden = true;
    document.body.style.overflow = '';
    state.currentCase = null;
    state.activeCaseData = null;
    state.activeAlgorithm = '';
    state.activeVariant = 'main';
  }

  function copyText(value) {
    const text = String(value || '');
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else fallbackCopy(text);
  }

  function fallbackCopy(text) {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    try { document.execCommand('copy'); } catch (_) { /* Clipboard permission denied. */ }
    field.remove();
  }

  function toggleLearned() {
    const item = state.currentCase;
    if (!item) return;
    if (state.learned.has(item.id)) state.learned.delete(item.id);
    else state.learned.add(item.id);
    saveLearned();
    $('#learnToggle').classList.toggle('learned', state.learned.has(item.id));
    $('#learnToggle').textContent = state.learned.has(item.id) ? '✓ Đã thuộc' : '＋ Đánh dấu đã thuộc';
    $('#modalProgressText').textContent = state.learned.has(item.id) ? 'Đã đánh dấu thuộc công thức này' : 'Chưa đánh dấu thuộc';
    applyFilters();
  }

  function openNextCase() {
    if (!state.currentCase) return;
    const items = state.filtered.length ? state.filtered : ALL;
    const index = items.findIndex(item => item.id === state.currentCase.id);
    const next = items[(index + 1 + items.length) % items.length] || ALL[0];
    openCase(next.id);
  }

  // Flashcards reveal the case name and algorithm only after the learner commits to a guess.
  function flashCandidates() {
    const kind = $('#flashType').value;
    return ALL.filter(item => kind === 'all' || item.group === kind || (kind === '2look' && item.twoLook));
  }

  function nextFlashcard() {
    const candidates = flashCandidates();
    if (!candidates.length) return;
    const previous = state.flashCurrent?.id;
    let item = candidates[Math.floor(Math.random() * candidates.length)];
    if (candidates.length > 1) {
      let attempts = 0;
      while (item.id === previous && attempts++ < 8) item = candidates[Math.floor(Math.random() * candidates.length)];
    }
    state.flashCurrent = item;
    $('#flashCase').textContent = `${groupName(item.group)} · ${item.twoLook ? '2-LOOK' : item.stage}`;
    $('#flashDiagram').innerHTML = casePreview(item, 9, true);
    $('#flashName').textContent = 'WHAT IS THE CASE?';
    $('#flashAnswer').hidden = true;
    $('#flashAnswer').textContent = `${item.case}\n${item.alg}`;
    $('#flashReveal').disabled = false;
  }

  function revealFlashcard() {
    const item = state.flashCurrent;
    if (!item) return;
    $('#flashName').textContent = item.case;
    $('#flashAnswer').hidden = false;
    $('#flashReveal').textContent = 'Đã reveal ✓';
  }

  // Simple solve timer. Space toggles; keyboard shortcuts are ignored in form fields.
  function formatTime(ms) {
    const centiseconds = Math.floor(ms / 10);
    const minutes = Math.floor(centiseconds / 6000);
    const seconds = Math.floor((centiseconds % 6000) / 100);
    const hundredths = centiseconds % 100;
    return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(hundredths).padStart(2,'0')}`;
  }

  function updateTimer() {
    const elapsed = state.timerRunning ? state.timerElapsed + (performance.now() - state.timerStarted) : state.timerElapsed;
    $('#timerDisplay').textContent = formatTime(elapsed);
  }

  function toggleTimer() {
    const button = $('#timerStart');
    if (!state.timerRunning) {
      state.timerRunning = true;
      state.timerStarted = performance.now();
      button.textContent = 'Dừng';
      button.classList.add('running');
      if (state.timerInterval) clearInterval(state.timerInterval);
      state.timerInterval = setInterval(updateTimer, 10);
    } else {
      state.timerElapsed += performance.now() - state.timerStarted;
      state.timerRunning = false;
      button.textContent = 'Bắt đầu';
      button.classList.remove('running');
      clearInterval(state.timerInterval);
      state.timerInterval = null;
      updateTimer();
    }
  }

  function resetTimer() {
    state.timerRunning = false;
    state.timerStarted = 0;
    state.timerElapsed = 0;
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = null;
    $('#timerStart').textContent = 'Bắt đầu';
    $('#timerStart').classList.remove('running');
    updateTimer();
  }

  // Event delegation keeps the algorithm library efficient with 119 cases.
  document.addEventListener('click', event => {
    const copyTarget = event.target.closest('[data-copy-id]');
    if (copyTarget) {
      const item = ALL.find(entry => entry.id === copyTarget.dataset.copyId);
      if (item) {
        copyText(item.alg);
        const old = copyTarget.textContent;
        copyTarget.textContent = 'Đã copy ✓';
        setTimeout(() => { if (copyTarget.isConnected) copyTarget.textContent = old; }, 1000);
      }
      return;
    }
    const openTarget = event.target.closest('[data-open-case]');
    if (openTarget) { openCase(openTarget.dataset.openCase); return; }
    const beginnerTarget = event.target.closest('[data-beginner]');
    if (beginnerTarget) {
      state.beginnerIndex = Number(beginnerTarget.dataset.beginner);
      renderBeginner();
    }
    const moveTarget = event.target.closest('[data-move-index]');
    if (moveTarget && state.currentCase) {
      state.moveIndex = Math.max(0, Math.min(state.caseMoves.length, Number(moveTarget.dataset.moveIndex)));
      renderMoveState();
    }
  });

  $('#beginnerDetail').addEventListener('click', event => {
    if (event.target.closest('#beginnerPrev')) { state.beginnerIndex = Math.max(0, state.beginnerIndex - 1); renderBeginner(); }
    if (event.target.closest('#beginnerNext')) { state.beginnerIndex = Math.min(DATA.beginner.length - 1, state.beginnerIndex + 1); renderBeginner(); }
  });

  $('#filterRow').addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (button) setFilter(button.dataset.filter);
  });
  $('#algorithmSearch').addEventListener('input', event => { state.query = event.target.value; applyFilters(); });
  $$('.view-switch [data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
  $$('[data-filter-link]').forEach(link => link.addEventListener('click', () => {
    setFilter(link.dataset.filterLink);
    setView('grid');
  }));
  $('#showTwoLook').addEventListener('click', () => {
    setFilter('2look');
    setView('grid');
    $('#algorithms').scrollIntoView({behavior:'smooth'});
  });

  $('#closeModal').addEventListener('click', closeModal);
  $('#caseModal').addEventListener('click', event => { if (event.target === $('#caseModal')) closeModal(); });
  $('#learnToggle').addEventListener('click', toggleLearned);
  $('#formulaVariant').addEventListener('change', event => setFormulaVariant(event.target.value));
  $('#copyFormula').addEventListener('click', () => {
    if (!state.currentCase) return;
    copyText(state.activeAlgorithm || state.currentCase.alg);
    $('#copyFormula').textContent = 'Đã copy ✓';
    setTimeout(() => { if ($('#copyFormula')) $('#copyFormula').textContent = 'Copy ↗'; }, 1000);
  });
  $('#moveNext').addEventListener('click', () => { state.moveIndex = Math.min(state.caseMoves.length, state.moveIndex + 1); renderMoveState(); });
  $('#movePrev').addEventListener('click', () => { state.moveIndex = Math.max(0, state.moveIndex - 1); renderMoveState(); });
  $('#moveReset').addEventListener('click', () => { state.moveIndex = 0; renderMoveState(); });
  $('#modalNextCase').addEventListener('click', openNextCase);
  $('#cubeViewReset').addEventListener('click', () => setCubeView('ISO'));
  $$('[data-cube-face]').forEach(button => button.addEventListener('click', () => setCubeView(button.dataset.cubeFace)));

  const cubeStage = $('#cube3DStage');
  cubeStage.addEventListener('pointerdown', event => {
    if (!state.currentCase) return;
    state.dragging = true;
    state.dragPointerId = event.pointerId;
    state.dragLastX = event.clientX;
    state.dragLastY = event.clientY;
    cubeStage.setPointerCapture(event.pointerId);
  });
  cubeStage.addEventListener('pointermove', event => {
    if (!state.dragging || event.pointerId !== state.dragPointerId) return;
    const dx = event.clientX - state.dragLastX;
    const dy = event.clientY - state.dragLastY;
    state.dragLastX = event.clientX;
    state.dragLastY = event.clientY;
    state.viewRotY += dx * 0.65;
    state.viewRotX = Math.max(-88, Math.min(88, state.viewRotX - dy * 0.65));
    applyCubeOrientation();
    $$('[data-cube-face]').forEach(button => button.classList.remove('active'));
  });
  const stopCubeDrag = event => {
    if (event.pointerId === state.dragPointerId) {
      state.dragging = false;
      state.dragPointerId = null;
    }
  };
  cubeStage.addEventListener('pointerup', stopCubeDrag);
  cubeStage.addEventListener('pointercancel', stopCubeDrag);

  $('#flashNext').addEventListener('click', nextFlashcard);
  $('#flashReveal').addEventListener('click', revealFlashcard);
  $('#flashType').addEventListener('change', () => {
    state.flashCurrent = null;
    $('#flashName').textContent = 'READY?';
    $('#flashCase').textContent = 'Chọn “Case ngẫu nhiên” để bắt đầu';
    $('#flashDiagram').innerHTML = '';
    $('#flashAnswer').hidden = true;
    $('#flashReveal').disabled = true;
    $('#flashReveal').textContent = 'Hiện công thức';
  });
  $('#timerStart').addEventListener('click', toggleTimer);
  $('#timerReset').addEventListener('click', resetTimer);

  $('#mobileMenu').addEventListener('click', () => $('#mainNav').classList.toggle('open'));
  $$('#mainNav a').forEach(link => link.addEventListener('click', () => $('#mainNav').classList.remove('open')));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !$('#caseModal').hidden) closeModal();
    if (event.code === 'Space' && !event.repeat) {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const editing = ['input','textarea','select','button'].includes(tag) || document.activeElement?.isContentEditable;
      if (!editing && $('#caseModal').hidden) { event.preventDefault(); toggleTimer(); }
    }
    if (!$('#caseModal').hidden && event.key === 'ArrowRight' && state.currentCase) {
      event.preventDefault(); state.moveIndex = Math.min(state.caseMoves.length, state.moveIndex + 1); renderMoveState();
    }
    if (!$('#caseModal').hidden && event.key === 'ArrowLeft' && state.currentCase) {
      event.preventDefault(); state.moveIndex = Math.max(0, state.moveIndex - 1); renderMoveState();
    }
  });

  // Keyboard-accessible algorithm cards.
  $('#algorithmGrid').addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.algorithm-card')) {
      event.preventDefault(); openCase(event.target.dataset.openCase);
    }
  });

  renderBeginner();
  updateProgress();
  applyFilters();
  setView('grid');
  updateTimer();
})();
