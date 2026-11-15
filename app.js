/* WER 2026 赛规 & 场地小助手 */
(function () {
  "use strict";

  const MAP = window.WER_MAP;
  const BASE_TASKS = window.WER_TASKS || [];
  const PARAMS = window.WER_PARAMS || [];
  const CFG = window.WER_CONFIG || {};

  const STORAGE_KEY = "wer-map-assistant-v1";
  const SX = (1252 - 11) / 220;   // px per cm, x
  const SY = (685 - 8) / 120;    // px per cm, y
  const px = (x) => 11 + x * SX;
  const py = (y) => 685 - y * SY;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  function normalizeTasks(list) {
    return list.map((t) => Object.assign({ enabled: true }, t));
  }

  const state = {
    tasks: normalizeTasks(clone(BASE_TASKS)),
    selectedSlot: null,
    pendingTask: null,
    showLines: true,
    showFree: true,
    showNodes: false,
    start: true,
    returned: true,
    restarts: 0,
    pillReturned: true,
  };

  const taskById = (id) => state.tasks.find((t) => t.id === id);
  const taskAtSlot = (slot) => state.tasks.find((t) => t.slot === slot) || null;
  const activeTask = (id) => {
    const t = taskById(id);
    return !!(t && t.enabled && t.slot);
  };
  const slotIds = MAP.slots.map((s) => s.id);
  const facingText = (deg) => {
    const map = { 0: "0°（朝右 / 场内）", 90: "90°（朝上 / 场内）", 180: "180°（朝左 / 场内）", 270: "270°（朝下 / 场内）" };
    return map[deg] || `${deg}°`;
  };
  const edgeText = (edge) => ({ top: "上边", right: "右边", bottom: "下边", left: "左边" }[edge] || edge);
  const typeText = (type) => ({ slot: "模型位", junction: "路口", dead_end: "死端", base: "基地" }[type] || type);

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (Array.isArray(saved.tasks)) {
        state.tasks = BASE_TASKS.map((base) => {
          const s = saved.tasks.find((x) => x && x.id === base.id) || {};
          const slot = slotIds.includes(s.slot) ? s.slot : base.slot;
          return Object.assign({}, base, { slot: slot || null, enabled: s.enabled !== false });
        });
      }
      ["start", "returned", "pillReturned"].forEach((k) => {
        if (typeof saved[k] === "boolean") state[k] = saved[k];
      });
      if (Number.isFinite(saved.restarts)) state.restarts = Math.max(0, Math.min(4, saved.restarts));
    } catch (e) {
      /* file:// 或隐私模式下 localStorage 可能不可用，忽略即可 */
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tasks: state.tasks.map((t) => ({ id: t.id, slot: t.slot, enabled: t.enabled })),
        start: state.start,
        returned: state.returned,
        restarts: state.restarts,
        pillReturned: state.pillReturned,
      }));
    } catch (e) { /* ignore */ }
  }

  function scoreOfTask(t) {
    if (!t.enabled || !t.slot) return 0;
    let s = Number(t.score) || 0;
    if (t.id === "T2" && state.pillReturned) s += Number(t.deliverScore) || 0;
    if (t.id === "T3" && state.pillReturned && activeTask("T2")) s += Number(t.deliverScore) || 0;
    return s;
  }

  function computeScore() {
    const details = state.tasks.map((t) => {
      const score = scoreOfTask(t);
      let status = "ok";
      if (!t.enabled) status = "off";
      else if (!t.slot) status = "unassigned";
      return { id: t.id, name: t.name, color: t.color, score, status, slot: t.slot };
    });
    const taskScore = details.reduce((a, b) => a + b.score, 0);
    const start = state.start ? (CFG.startScore || 0) : 0;
    const ret = state.returned ? (CFG.returnScore || 0) : 0;
    const autonomy = Math.max(0, (CFG.autonomyBase || 0) - (CFG.restartPenalty || 0) * state.restarts);
    const total = taskScore + start + ret + autonomy;
    const warnings = [];

    const unassigned = state.tasks.filter((t) => t.enabled && !t.slot);
    if (unassigned.length) {
      warnings.push({ level: "warn", text: "还没有分配模型位：" + unassigned.map((t) => t.name).join("、") + "。" });
    }
    if (taskById("T3") && taskById("T3").enabled && (!activeTask("T2") || !state.pillReturned)) {
      warnings.push({ level: "danger", text: "「用药提醒」的 +50 需要先完成「自动取药」并把药丸带回基地；当前最多 50 分。" });
    }
    if (taskById("T2") && taskById("T2").enabled && !state.pillReturned) {
      warnings.push({ level: "warn", text: "「自动取药」只算落药 50 分；把药丸带回基地再 +50。" });
    }
    if (!warnings.length) warnings.push({ level: "ok", text: "当前分配没有发现依赖 / 未分配问题。" });

    return { total, taskScore, start, ret, autonomy, details, warnings, max: CFG.maxScore || 700 };
  }

  function slotOptions(selected) {
    let out = '<option value="">—</option>';
    for (const id of slotIds) {
      out += `<option value="${id}"${selected === id ? " selected" : ""}>${id}</option>`;
    }
    return out;
  }

  function renderMap() {
    const svg = $("#map-svg");
    if (!svg) return;
    let out = "";

    // 边
    for (const e of MAP.edges) {
      if (e.kind === "line" && !state.showLines) continue;
      if (e.kind === "free" && !state.showFree) continue;
      const a = MAP.nodes[e.a], b = MAP.nodes[e.b];
      if (!a || !b) continue;
      const cls = e.kind === "line" ? "edge-line" : (e.kind === "free" ? "edge-free" : "edge-base");
      out += `<line class="edge ${cls}" x1="${px(a.xy[0]).toFixed(1)}" y1="${py(a.xy[1]).toFixed(1)}" x2="${px(b.xy[0]).toFixed(1)}" y2="${py(b.xy[1]).toFixed(1)}"><title>${escapeHtml(e.id)} ${escapeHtml(a.xy.join(", "))} → ${escapeHtml(b.xy.join(", "))}</title></line>`;
    }

    // 节点名（默认关闭，避免遮挡）
    if (state.showNodes) {
      for (const [id, n] of Object.entries(MAP.nodes)) {
        const x = px(n.xy[0]), y = py(n.xy[1]);
        out += `<circle class="node-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2"/>`;
        out += `<text class="node-label" x="${(x + 5).toFixed(1)}" y="${(y - 5).toFixed(1)}">${escapeHtml(id)}</text>`;
      }
    }

    // 基地
    const b = MAP.base;
    const bw = b.size[0] * SX, bh = b.size[1] * SY;
    out += `<rect x="${px(b.center[0] - b.size[0] / 2).toFixed(1)}" y="${py(b.center[1] + b.size[1] / 2).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="5" fill="rgba(13,148,136,.07)" stroke="rgba(13,148,136,.55)" stroke-dasharray="5 4" pointer-events="none"/>`;
    out += `<text class="base-label" x="${px(b.center[0]).toFixed(1)}" y="${(py(b.center[1]) + 4).toFixed(1)}">基地 30×30</text>`;

    // 模型区 + 编号圆点
    for (const s of MAP.slots) {
      const task = taskAtSlot(s.id);
      const color = task ? (task.enabled ? task.color : "#94a3b8") : "#94a3b8";
      const area = s.area;
      const x = px(area.cx - area.w / 2);
      const y = py(area.cy + area.h / 2);
      const w = area.w * SX;
      const h = area.h * SY;
      out += `<rect class="slot-area" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="4" style="fill:${color};fill-opacity:${task && task.enabled ? ".16" : ".05"};stroke:${color};stroke-opacity:${task ? ".85" : ".38"}"/>`;

      const n = MAP.nodes[s.node];
      const cx = px(n.xy[0]);
      const cy = py(n.xy[1]);
      const fill = task && task.enabled ? color : "#ffffff";
      const textFill = task && task.enabled ? "#ffffff" : "#475569";

      out += `<g class="slot-hit${state.selectedSlot === s.id ? " selected" : ""}" data-slot="${s.id}" tabindex="0" role="button" aria-label="${s.id} 号位 ${task ? task.name : "空位"}">
        <circle class="halo" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="22" fill="${color}"/>
        <circle class="badge" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="14" fill="${fill}" stroke="${color}"/>
        <text class="slot-num" x="${cx.toFixed(1)}" y="${(cy + 0.5).toFixed(1)}" fill="${textFill}">${s.id}</text>
        <title>${s.id} 号位 · ${task ? escapeHtml(task.name) : "空位"}</title>
      </g>`;
    }

    svg.innerHTML = out;
  }

  function renderLegend() {
    const el = $("#map-legend");
    if (!el) return;
    let out = state.tasks.map((t) => `<span class="legend-item"><i class="legend-dot" style="--c:${t.color}"></i>${escapeHtml(t.name)}</span>`).join("");
    out += '<span class="legend-item"><i class="legend-dot" style="--c:#94a3b8"></i>空位</span>';
    out += '<span class="legend-item"><i class="legend-line"></i>脱线段</span>';
    el.innerHTML = out;
  }

  function renderTaskList() {
    const list = $("#task-list");
    if (!list) return;
    const t2ok = activeTask("T2");
    list.innerHTML = state.tasks.map((t) => {
      const active = state.pendingTask === t.id;
      const dep = t.id === "T3" && t.enabled && (!t2ok || !state.pillReturned)
        ? '<span class="dep-flag" title="依赖 T2，且药丸要带回基地">!</span>' : "<span></span>";
      return `<div class="task-row${active ? " active" : ""}${t.enabled ? "" : " disabled"}" data-task="${t.id}" style="--c:${t.color}">
        <button class="task-pick" type="button" data-pick="${t.id}" title="${escapeHtml(t.note || "")}">
          <span class="dot"></span>
          <span class="t-name">${escapeHtml(t.name)}</span>
          <span class="t-score">${t.score}${t.deliverScore ? "+" + t.deliverScore : ""}</span>
        </button>
        <select data-slot-select="${t.id}" class="${t.slot ? "" : "unassigned"}" aria-label="${escapeHtml(t.name)} 模型位">${slotOptions(t.slot)}</select>
        <label title="启用/停用"><input type="checkbox" data-enable="${t.id}"${t.enabled ? " checked" : ""}></label>
        ${dep}
      </div>`;
    }).join("");
  }

  function renderSlotCard() {
    const body = $("#slot-body");
    if (!body) return;
    if (!state.selectedSlot) {
      body.innerHTML = `<div class="empty-state">
        <div class="empty-icon">👆</div>
        <p>还没有选中模型位。</p>
        <p class="muted">先点右侧任务名，再点地图圆点，可以直接分配。</p>
      </div>`;
      return;
    }
    const s = MAP.slots.find((x) => x.id === state.selectedSlot);
    const n = s ? MAP.nodes[s.node] : null;
    if (!s || !n) return;
    const task = taskAtSlot(s.id);
    const pending = state.pendingTask ? taskById(state.pendingTask) : null;
    let html = `<div class="slot-title-row">
      <div class="slot-title">${s.id} 号位</div>
      ${task
        ? `<span class="slot-task-badge" style="--c:${task.color}">${escapeHtml(task.name)} · ${scoreOfTask(task)} 分</span>`
        : '<span class="slot-task-badge" style="--c:#94a3b8">空位</span>'}
    </div>`;
    html += `<dl class="slot-kv">
      <dt>位置</dt><dd>${edgeText(s.edge)}</dd>
      <dt>模型朝向</dt><dd>${facingText(s.facing)}</dd>
      <dt>模型区</dt><dd>${s.area.w} × ${s.area.h} cm</dd>
      <dt>巡线终点</dt><dd>${s.node}</dd>
      <dt>坐标</dt><dd>${n.xy[0].toFixed(1)}, ${n.xy[1].toFixed(1)} cm</dd>
    </dl>`;

    if (task) {
      html += `<div class="slot-note"><b>${escapeHtml(task.name)}</b> · 基础 ${task.score} 分${task.deliverScore ? ` · 交付 +${task.deliverScore}` : ""}<br>${escapeHtml(task.note || "")}</div>`;
      if (task.id === "T3" && (!activeTask("T2") || !state.pillReturned)) {
        html += `<div class="warn-item danger" style="margin-top:8px">依赖未满足：T2 自动取药未完成/药丸未带回，本任务最多 50 分。</div>`;
      }
      html += `<div class="slot-actions"><button class="mini-btn danger" type="button" data-remove="${task.id}">从该位移除</button></div>`;
    } else {
      html += `<div class="slot-note">这个模型位当前<b>没有任务</b>。比赛时模型位是随机分配的；空位不要当成任务。</div>`;
    }

    if (pending) {
      html += `<div class="slot-actions"><button class="mini-btn primary" type="button" data-assign="${pending.id}">把 ${escapeHtml(pending.name)} 分配到 ${s.id} 号位</button></div>`;
    }
    body.innerHTML = html;
  }

  function renderScore() {
    const sc = computeScore();
    const totalEl = $("#score-total");
    if (totalEl) totalEl.textContent = String(sc.total);
    const mini = $("#mini-score");
    if (mini) mini.textContent = String(sc.total);
    const miniWarn = $("#mini-warning");
    if (miniWarn) {
      const bad = sc.warnings.filter((w) => w.level !== "ok").length;
      miniWarn.textContent = bad ? `⚠ ${bad} 个提醒` : "✓ 分配完整";
      miniWarn.classList.toggle("bad", bad > 0);
    }
    const bar = $("#score-bar");
    if (bar) bar.style.width = Math.min(100, sc.total / sc.max * 100).toFixed(1) + "%";
    const bd = $("#score-breakdown");
    if (bd) {
      bd.innerHTML = `任务 <b>${sc.taskScore}</b> · 出发 <b>${sc.start}</b> · 返回 <b>${sc.ret}</b> · 自主 <b>${sc.autonomy}</b>`;
    }
    const warn = $("#score-warnings");
    if (warn) {
      warn.innerHTML = sc.warnings.map((w) => `<div class="warn-item ${w.level}">${escapeHtml(w.text)}</div>`).join("");
    }
    const detail = $("#score-detail");
    if (detail) {
      let rows = sc.details.map((d) => {
        const t = taskById(d.id);
        const label = d.status === "off" ? "未启用" : (d.status === "unassigned" ? "未分配" : (d.slot + " 号位"));
        return `<tr class="${d.status === "off" ? "off" : ""}"><td>${escapeHtml(d.name)} <span class="muted">· ${label}</span></td><td>${d.score}</td></tr>`;
      }).join("");
      rows += `<tr><td>出发</td><td>${sc.start}</td></tr>`;
      rows += `<tr><td>返回基地</td><td>${sc.ret}</td></tr>`;
      rows += `<tr><td>自主运行奖励（重启 ${state.restarts} 次）</td><td>${sc.autonomy}</td></tr>`;
      rows += `<tr class="total"><td>合计</td><td>${sc.total} / ${sc.max}</td></tr>`;
      detail.innerHTML = `<table><tbody>${rows}</tbody></table>`;
    }
  }

  function renderTaskTable() {
    const body = $("#task-table-body");
    if (!body) return;
    body.innerHTML = state.tasks.map((t) => {
      const status = !t.enabled ? "未启用" : (t.slot ? "已分配" : "未分配");
      const dep = t.requiresText ? escapeHtml(t.requiresText) : (t.deliver ? "完成动作后需回基地交付" : "—");
      return `<tr>
        <td><span class="task-table-name" style="color:${t.color}">● ${escapeHtml(t.name)}</span><span class="task-table-sub">${escapeHtml(t.kind)} · ${escapeHtml(t.note || "")}</span></td>
        <td class="num">${t.score}${t.deliverScore ? " + " + t.deliverScore : ""}</td>
        <td>${t.slot ? t.slot + " 号位" : "—"}</td>
        <td>${status}</td>
        <td>${dep}</td>
        <td><button class="mini-btn" type="button" data-locate="${t.slot || ""}"${t.slot ? "" : " disabled"}>定位</button></td>
      </tr>`;
    }).join("");
  }

  function renderData() {
    const nodeBody = $("#node-table-body");
    if (nodeBody) {
      nodeBody.innerHTML = Object.entries(MAP.nodes).sort((a, b) => a[0].localeCompare(b[0])).map(([id, n]) => {
        const extra = n.type === "slot" ? `模型位 ${n.slot}` : (n.type === "base" ? "基地中心" : "");
        return `<tr><td><b>${escapeHtml(id)}</b></td><td>${typeText(n.type)}</td><td class="num">${n.xy[0].toFixed(2)}</td><td class="num">${n.xy[1].toFixed(2)}</td><td>${escapeHtml(extra)}</td></tr>`;
      }).join("");
    }
    const edgeBody = $("#edge-table-body");
    if (edgeBody) {
      edgeBody.innerHTML = MAP.edges.map((e) => {
        const a = MAP.nodes[e.a], b = MAP.nodes[e.b];
        let len = e.length;
        if (len == null && a && b) len = Math.hypot(a.xy[0] - b.xy[0], a.xy[1] - b.xy[1]);
        const kind = e.kind === "line" ? "引导线" : (e.kind === "free" ? "脱线段" : "基地段");
        return `<tr><td><b>${escapeHtml(e.id)}</b></td><td>${escapeHtml(e.a)} → ${escapeHtml(e.b)}</td><td>${kind}</td><td class="num">${len == null ? "—" : len.toFixed(2)}</td></tr>`;
      }).join("");
    }
    const paramBody = $("#param-table-body");
    if (paramBody) {
      paramBody.innerHTML = PARAMS.map((p) => {
        const diff = p.diff == null ? "—" : (p.diff > 0 ? "+" : "") + p.diff.toFixed(2);
        const val = p.value == null ? "—" : p.value.toFixed(1);
        const spec = p.spec == null ? "—" : p.spec.toFixed(2);
        return `<tr title="${escapeHtml(p.flag || "")}"><td>${p.id}</td><td>${escapeHtml(p.desc)}</td><td class="num">${val}</td><td class="num">${spec}</td><td class="num">${diff}</td><td><span class="pill grade-${escapeHtml(p.grade)}">${escapeHtml(p.grade)}</span></td></tr>`;
      }).join("");
    }
  }

  function renderControls() {
    $$("[data-setting]").forEach((el) => {
      const key = el.dataset.setting;
      const val = key === "pill" ? state.pillReturned : state[key];
      if (el.type === "checkbox") el.checked = !!val;
      else el.value = String(val);
    });
  }

  function renderAll() {
    renderMap();
    renderLegend();
    renderTaskList();
    renderSlotCard();
    renderScore();
    renderTaskTable();
    renderControls();
  }

  function assignSlot(taskId, slot) {
    const task = taskById(taskId);
    if (!task) return;
    if (slot && !slotIds.includes(slot)) return;
    if (!slot) {
      task.slot = null;
    } else {
      const other = taskAtSlot(slot);
      if (other && other.id !== task.id) other.slot = task.slot || null;
      task.slot = slot;
    }
    state.pendingTask = null;
    state.selectedSlot = slot || state.selectedSlot;
    saveState();
    renderAll();
  }

  function selectSlot(slot) {
    if (state.pendingTask) {
      assignSlot(state.pendingTask, slot);
      return;
    }
    state.selectedSlot = state.selectedSlot === slot ? null : slot;
    renderAll();
  }

  function selectTask(id) {
    state.pendingTask = state.pendingTask === id ? null : id;
    const t = taskById(id);
    if (t && t.slot) state.selectedSlot = t.slot;
    renderAll();
  }

  function setTaskEnabled(id, enabled) {
    const t = taskById(id);
    if (!t) return;
    t.enabled = !!enabled;
    saveState();
    renderAll();
  }

  function resetExample() {
    state.tasks = normalizeTasks(clone(BASE_TASKS));
    state.start = true;
    state.returned = true;
    state.restarts = 0;
    state.pillReturned = true;
    state.pendingTask = null;
    state.selectedSlot = null;
    saveState();
    renderAll();
  }

  function clearAssignments() {
    state.tasks.forEach((t) => { t.slot = null; });
    state.pendingTask = null;
    state.selectedSlot = null;
    saveState();
    renderAll();
  }

  function setTab(name) {
    const ok = ["map", "tasks", "rules", "data"].includes(name);
    if (!ok) return;
    $$(".tab").forEach((b) => {
      const active = b.dataset.tab === name;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });
    $$(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === "panel-" + name));
  }

  function download(filename, text, type) {
    const blob = new Blob([text], { type: type || "application/json;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }

  function exportAssignment() {
    const sc = computeScore();
    return {
      schema: "wer-map-assistant/1",
      exportedAt: new Date().toISOString(),
      config: CFG,
      settings: { start: state.start, returned: state.returned, restarts: state.restarts, pillReturned: state.pillReturned },
      tasks: state.tasks.map((t) => ({ id: t.id, name: t.name, slot: t.slot, enabled: t.enabled, score: scoreOfTask(t) })),
      score: { total: sc.total, taskScore: sc.taskScore, start: sc.start, returned: sc.ret, autonomy: sc.autonomy, max: sc.max },
    };
  }

  function initEvents() {
    $$(".tab").forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab)));

    const svg = $("#map-svg");
    svg.addEventListener("click", (e) => {
      const g = e.target.closest("[data-slot]");
      if (g) { selectSlot(g.dataset.slot); return; }
      if (e.target === svg) {
        state.selectedSlot = null;
        state.pendingTask = null;
        renderAll();
      }
    });
    svg.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const g = e.target.closest("[data-slot]");
      if (g) { e.preventDefault(); selectSlot(g.dataset.slot); }
    });
    $("#map-img").addEventListener("click", () => {
      state.selectedSlot = null;
      state.pendingTask = null;
      renderAll();
    });

    $("#task-list").addEventListener("click", (e) => {
      const pick = e.target.closest("[data-pick]");
      if (pick) selectTask(pick.dataset.pick);
    });
    $("#task-list").addEventListener("change", (e) => {
      if (e.target.matches("[data-slot-select]")) {
        assignSlot(e.target.dataset.slotSelect, e.target.value || null);
      } else if (e.target.matches("[data-enable]")) {
        setTaskEnabled(e.target.dataset.enable, e.target.checked);
      }
    });

    $("#task-table-body").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-locate]");
      if (!btn) return;
      setTab("map");
      if (btn.dataset.locate) selectSlot(btn.dataset.locate);
    });

    $("#slot-body").addEventListener("click", (e) => {
      const assign = e.target.closest("[data-assign]");
      if (assign) { assignSlot(assign.dataset.assign, state.selectedSlot); return; }
      const remove = e.target.closest("[data-remove]");
      if (remove) {
        const t = taskById(remove.dataset.remove);
        if (t) { t.slot = null; saveState(); renderAll(); }
      }
    });

    $("#clear-selection").addEventListener("click", () => {
      state.selectedSlot = null;
      state.pendingTask = null;
      renderAll();
    });
    $("#reset-example").addEventListener("click", resetExample);
    $("#clear-assign").addEventListener("click", clearAssignments);

    ["show-lines", "show-free", "show-nodes"].forEach((id) => {
      const el = $("#" + id);
      el.checked = id === "show-lines" ? state.showLines : (id === "show-free" ? state.showFree : state.showNodes);
      el.addEventListener("change", () => {
        if (id === "show-lines") state.showLines = el.checked;
        else if (id === "show-free") state.showFree = el.checked;
        else state.showNodes = el.checked;
        renderMap();
      });
    });

    document.addEventListener("change", (e) => {
      const el = e.target.closest("[data-setting]");
      if (!el) return;
      const key = el.dataset.setting;
      if (key === "restarts") state.restarts = Math.max(0, Math.min(4, Number(el.value) || 0));
      else if (key === "pill") state.pillReturned = el.checked;
      else state[key] = el.checked;
      saveState();
      renderAll();
    });
    document.addEventListener("input", (e) => {
      const el = e.target.closest('[data-setting="restarts"]');
      if (!el) return;
      state.restarts = Math.max(0, Math.min(4, Number(el.value) || 0));
      saveState();
      renderScore();
      renderTaskList();
    });

    $("#download-spec").addEventListener("click", () => download("map_spec.json", JSON.stringify(MAP, null, 2)));
    $("#download-assignment").addEventListener("click", () => download("任务分配_本助手.json", JSON.stringify(exportAssignment(), null, 2)));
  }

  function init() {
    loadState();
    renderAll();
    renderData();
    initEvents();
    const hash = (location.hash || "").replace("#", "");
    if (["map", "tasks", "rules", "data"].includes(hash)) setTab(hash);
  }

  window.__WER_APP__ = {
    state,
    setTab,
    assignSlot,
    selectSlot,
    selectTask,
    setTaskEnabled,
    resetExample,
    clearAssignments,
    computeScore,
    renderAll,
    getState: () => clone(state),
    exportAssignment,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
