/* WER 2026 赛规/地图小助手 —— 任务与计分数据（可手工修改） */
window.WER_CONFIG = {
  title: "WER 2026 普及赛 · 伙伴机器人",
  field: { width: 220, height: 120, lineWidth: 2.5, base: 30 },
  matchSeconds: 180,
  prepSeconds: 5400,
  startScore: 30,
  returnScore: 30,
  autonomyBase: 40,
  restartPenalty: 10,
  maxScore: 700,
  note: "计分按赛规与公开资料整理；出发/返回/自主奖励的判定细节以裁判现场解释为准。"
};

/* score = 基础分；deliverScore = 需要回基地/交付的追加分 */
window.WER_TASKS = [
  {
    id: "T1",
    name: "扶起老人",
    short: "扶老人",
    score: 50,
    slot: "03",
    color: "#f59e0b",
    kind: "预设",
    note: "把倒下的老人模型扶起。",
    requires: null
  },
  {
    id: "T2",
    name: "自动取药",
    short: "取药",
    score: 50,
    deliverScore: 50,
    slot: "05",
    color: "#ef4444",
    kind: "预设",
    deliver: true,
    note: "推杆让药丸掉入药框得 50；把药丸带回基地再得 50。",
    requires: null
  },
  {
    id: "T3",
    name: "用药提醒",
    short: "用药",
    score: 50,
    deliverScore: 50,
    slot: "09",
    color: "#8b5cf6",
    kind: "预设",
    deliver: true,
    requires: "T2",
    note: "开盖 >90° 得 50；把「自动取药」带回基地的药丸放入药盒再得 50。必须先取药并回基地交付。",
    requiresText: "依赖 T2 自动取药，且药丸已带回基地"
  },
  {
    id: "T4",
    name: "活动健身",
    short: "健身",
    score: 50,
    slot: "07",
    color: "#10b981",
    kind: "预设",
    note: "转柄使小人空中旋转 ≥1 圈。",
    requires: null
  },
  {
    id: "S1",
    name: "现场任务 1",
    short: "现场1",
    score: 100,
    slot: "01",
    color: "#3b82f6",
    kind: "现场",
    note: "赛前 90 分钟公布；动作/得分条件以现场公布为准。",
    requires: null
  },
  {
    id: "S2",
    name: "现场任务 2",
    short: "现场2",
    score: 100,
    slot: "04",
    color: "#06b6d4",
    kind: "现场",
    note: "赛前 90 分钟公布；动作/得分条件以现场公布为准。",
    requires: null
  },
  {
    id: "S3",
    name: "现场任务 3",
    short: "现场3",
    score: 100,
    slot: "10",
    color: "#ec4899",
    kind: "现场",
    note: "赛前 90 分钟公布；动作/得分条件以现场公布为准。",
    requires: null
  }
];
