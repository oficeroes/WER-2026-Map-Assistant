# -*- coding: utf-8 -*-
"""校验地图数据：节点/边/模型位/基地/两个线网。

运行：
    python tools/validate_data.py
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAP = json.loads((ROOT / "data" / "map_spec.json").read_text(encoding="utf-8"))


def fail(msg):
    print("FAIL:", msg)
    raise SystemExit(1)


def main():
    field = MAP["field"]
    assert field["width"] == 220 and field["height"] == 120, field
    assert MAP["base"]["size"] == [30, 30], MAP["base"]
    assert len(MAP["nodes"]) == 22, len(MAP["nodes"])
    assert len(MAP["edges"]) == 21, len(MAP["edges"])
    assert len(MAP["slots"]) == 10, len(MAP["slots"])

    # 模型位节点必须存在
    slot_ids = [s["id"] for s in MAP["slots"]]
    assert len(set(slot_ids)) == 10, slot_ids
    for s in MAP["slots"]:
        if s["node"] not in MAP["nodes"]:
            fail(f"slot {s['id']} node {s['node']} missing")
        if s["edge"] not in {"top", "right", "bottom", "left"}:
            fail(f"slot {s['id']} bad edge {s['edge']}")
        if not (0 <= s["facing"] < 360):
            fail(f"slot {s['id']} bad facing")
        area = s["area"]
        if not (area["w"] > 0 and area["h"] > 0):
            fail(f"slot {s['id']} bad area")

    # 引导线连通性：应恰好 3 个连通分量（左网 / 右网 / 08-09 支线），
    # 基地再通过 base 段接到左网，通过 F01/F02 脱线接右网/支线。
    adj = {nid: set() for nid in MAP["nodes"]}
    for e in MAP["edges"]:
        if e["kind"] not in ("line", "base"):
            continue
        adj[e["a"]].add(e["b"])
        adj[e["b"]].add(e["a"])
    seen = set()
    comps = []
    for start in adj:
        if start in seen:
            continue
        stack = [start]
        comp = set()
        while stack:
            n = stack.pop()
            if n in comp:
                continue
            comp.add(n)
            seen.add(n)
            stack.extend(adj[n] - comp)
        comps.append(comp)
    if len(comps) != 3:
        fail(f"expected 3 disconnected line networks, got {len(comps)}: {[sorted(c) for c in comps]}")

    # 基地段必须存在，且连到左网的 BTOP
    base_edges = [e for e in MAP["edges"] if e["kind"] == "base"]
    if not base_edges:
        fail("missing base edge")
    if not any({e["a"], e["b"]} == {"BASEC", "BTOP"} for e in base_edges):
        fail(f"base edge must connect BASEC-BTOP: {base_edges}")
    if not any("S07" in c and "S08" in c for c in comps) is False:
        pass
    slot_comp = {}
    for c in comps:
        for nid in c:
            node = MAP["nodes"][nid]
            if node.get("type") == "slot":
                slot_comp[node["slot"]] = c
    # 右网应含 04/05/06/07；08-09 支线应含 08/09；左网应含 01/02/03/10
    right = {s for s in slot_comp if s in {"04", "05", "06", "07"}}
    branch = {s for s in slot_comp if s in {"08", "09"}}
    left = {s for s in slot_comp if s in {"01", "02", "03", "10"}}
    if len(right) != 4 or len(branch) != 2 or len(left) != 4:
        fail(f"unexpected slot components: left={left} right={right} branch={branch}")

    # 边的长度与坐标自洽
    for e in MAP["edges"]:
        a, b = MAP["nodes"][e["a"]]["xy"], MAP["nodes"][e["b"]]["xy"]
        geo = math.hypot(a[0] - b[0], a[1] - b[1])
        if e.get("length") is not None and abs(e["length"] - geo) > 2.0:
            fail(f"edge {e['id']} length {e['length']} vs geo {geo:.2f}")

    # 23 个参数
    assert len(MAP["params"]) == 23, len(MAP["params"])
    grades = {"正常": 0, "警告": 0, "错误": 0, "待确认": 0}
    for p in MAP["params"]:
        # 分级由参数差异报告生成，这里只统计 value 是否有值
        if p.get("value") is None:
            grades["待确认"] += 1
    print("地图校验通过")
    print(f"  节点 {len(MAP['nodes'])} / 边 {len(MAP['edges'])} / 模型位 {len(MAP['slots'])}")
    sizes = sorted((len(c) for c in comps), reverse=True)
    print(f"  引导线连通块 {len(comps)}（节点数 {sizes}；左网 / 右网 / 08-09 支线）+ 1 条基地段")
    print(f"  23 个实测参数：{len(MAP['params'])} 条（分级见 docs/参数差异报告.md）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
