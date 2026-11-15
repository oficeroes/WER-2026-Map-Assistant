# -*- coding: utf-8 -*-
r"""生成小助手用的静态数据。

输入：
  data/map_spec.json              地图真值源（从 比赛系统/地图/map_spec.json 复制）
  docs/参数差异报告.md            23 个实测参数 vs 几何真值
输出：
  data/map-data.js                window.WER_MAP
  data/params.js                  window.WER_PARAMS

这样双击 index.html（file://）也能工作，不需要本地服务器。
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAP_JSON = ROOT / "data" / "map_spec.json"
PARAM_MD = ROOT / "docs" / "参数差异报告.md"
MAP_JS = ROOT / "data" / "map-data.js"
PARAM_JS = ROOT / "data" / "params.js"


def load_map():
    data = json.loads(MAP_JSON.read_text(encoding="utf-8"))
    keep = ["schema", "meta", "field", "base", "nodes", "edges", "slots", "params"]
    out = {k: data[k] for k in keep if k in data}
    return out


def parse_params():
    text = PARAM_MD.read_text(encoding="utf-8")
    rows = []
    for line in text.splitlines():
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) < 10:
            continue
        if not re.fullmatch(r"\d+", cells[0]):
            continue
        def num(x):
            x = x.strip()
            if x in ("-", "", "—"):
                return None
            try:
                return float(x)
            except ValueError:
                return None
        rows.append({
            "id": int(cells[0]),
            "desc": cells[1],
            "value": num(cells[2]),
            "spec": num(cells[3]),
            "diff": num(cells[4]),
            "grade": cells[5],
            "measured": num(cells[6]),
            "measuredDiff": num(cells[7]),
            "feature": cells[8].strip("`"),
            "flag": cells[9],
        })
    rows.sort(key=lambda r: r["id"])
    return rows


def main():
    data = load_map()
    MAP_JS.write_text(
        "/* 自动生成，勿手改：python tools/build_data.py */\n"
        "window.WER_MAP = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
        newline="\n",
    )
    params = parse_params()
    PARAM_JS.write_text(
        "/* 自动生成，勿手改：python tools/build_data.py */\n"
        "window.WER_PARAMS = " + json.dumps(params, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"map: {len(data['nodes'])} nodes, {len(data['edges'])} edges, {len(data['slots'])} slots")
    print(f"params: {len(params)} rows (13 正常 / 5 警告 / 4 错误 / 1 待确认 expected)")
    grades = {}
    for r in params:
        grades[r["grade"]] = grades.get(r["grade"], 0) + 1
    print("grades:", grades)


if __name__ == "__main__":
    main()
