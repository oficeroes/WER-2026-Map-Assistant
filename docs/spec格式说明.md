# 地图规格文件（map_spec.json）格式说明 v1

> 本文件是**全场唯一真值源**。地图编辑器负责读写它；路线生成器只读它。
> 单位统一为 **cm**；坐标系为**场地左下角 (0,0)，x 向右，y 向上**（数学坐标，不是图片坐标）。

## 1. 顶层字段

| 字段 | 说明 |
|---|---|
| `schema` | 固定 `"wer-map/1"` |
| `meta` | 名称、版本、来源、备注（自由文本，编辑器可改） |
| `field` | `{width, height, line_width, border_width}` 场地尺寸、引导线宽、边框线宽 |
| `base` | 基地：`{id, center:[x,y], size:[w,h], entry:[x,y], entry_facing}` |
| `nodes` | 点表 `{id: {xy:[x,y], type, slot?}}`；`type ∈ slot / junction / dead_end / base` |
| `edges` | 边表：`{id, a, b, kind, group?, length?, note?}`；`kind ∈ line / free / base` |
| `slots` | 10 个模型位：`{id, node, edge, facing, area:{cx,cy,w,h}, mark:[x,y]}` |
| `params` | 用户实测的 23 个地图参数 + 特征绑定，用于校验（见 §4） |

## 2. 节点 / 边

- **引导线网络**用 `nodes` + `edges(kind="line")` 表示：边两端是节点，几何为两点直线段。
  路线生成器按节点坐标算长度；**节点坐标就是准星**，改坐标 = 改所有相关长度。
- **脱线段**（机器人不开巡线、靠编码器直行）用 `kind="free"`，两端可为 `BASEC` 与某个 slot 节点。
  可写 `length` 字段覆盖几何长度（用于写上车实测值）。
- **基地内部**用 `kind="base"`（BASEC↔BTOP）。
- `group` 仅用于编辑器和图例分组（同一条物理线上的几段给同一个 group，如 `"H1"`）。

## 3. 槽位（模型区）

每个模型位 = 线端点 + 模型区 + 朝向：
- `node`：引导线末端的节点（机器人巡线到此、模型就在附近）。
- `edge`：该模型位贴在场地哪条边：`top / bottom / left / right`。
- `facing`：**模型正面朝向**（规则里红色箭头方向），角度制：0=+x(右)，90=+y(上)，180=-x，270=-y。
- `area`：模型区外框（细线十字中的 16×8 或 8×16 矩形），`cx,cy` 中心、`w,h` 尺寸。
- `mark`：图上红色小箭头的位置（仅渲染用）。

模型区在图上由细线画成 "十" 字：**贴边的 16×8（或 8×16）矩形 = 模型区**，另一条 8×16（或 16×8）是机器人接近通道。

## 4. params（23 个实测参数）

```json
{"id": 1, "value": 50.0, "desc": "…", "feature": {"kind": "dist", "from": "border.left", "to": "S08.area.left"}}
```

`feature` 描述这条实测值对应图上哪段几何，编辑器据此实时算出 `spec` 并对比：

- `{"kind":"dist","from":X,"to":Y}`：两点距离。X/Y 可写
  - 节点 id（如 `"S09"`, `"J03"`）
  - `border.left / border.right / border.top / border.bottom`
  - `BASE.left / BASE.right / BASE.top / BASE.bottom`（基地框边）
  - `<槽位id>.area.left / .right / .top / .bottom`（模型区外框边）
  - `<槽位id>`（= 该槽位 node 坐标）
- `{"kind":"field","axis":"width"|"height"}`：场地尺寸
- `null`：含义未确认，编辑器只显示"待确认"

**差异等级**：`|value-spec| <= 1.5cm` 正常；`<= 3cm` 警告；`> 3cm` 错误，需要用户核对。
（实测值来自用户，写死了不要自动改；`spec` 才是随几何变化的预计值。）

## 5. 约定

- 数值保留 1-2 位小数，坐标不要出现负数（除刻意拖出场地）。
- 编辑器导出时保持字段名与结构不变（可增加字段，不要改名）。
- 修改 `field.width/height` 时，编辑器按比例缩放所有节点/槽位坐标，并询问是否保留线宽。
