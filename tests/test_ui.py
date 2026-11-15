# -*- coding: utf-8 -*-
"""无服务器 UI 测试：直接用 file:// 打开 index.html，验证地图、分配、计分与数据。

运行：
    python tests/test_ui.py

依赖：playwright（已安装 Chromium）。如果没装：
    python -m pip install playwright
    python -m playwright install chromium
"""
from __future__ import annotations

import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = (ROOT / "index.html").as_uri()
SHOTS = ROOT / "docs" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)


def main() -> int:
    errors: list[str] = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
        page = context.new_page()
        page.on("console", lambda m: errors.append("console: " + m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append("pageerror: " + str(e)))

        page.goto(URL, wait_until="load", timeout=30000)
        page.wait_for_timeout(500)

        assert "WER 2026" in page.title(), page.title()
        assert page.eval_on_selector("#map-img", "img => img.naturalWidth") > 0, "map image not loaded"
        assert page.locator("g[data-slot]").count() == 10, "expected 10 slot badges"
        assert page.locator("#score-total").inner_text().strip() == "700", "default example should be 700"

        # 点击 03 号位 -> 详情
        page.locator('g[data-slot="03"]').click()
        body = page.locator("#slot-body").inner_text()
        assert "03 号位" in body and "扶起老人" in body, body

        # 任务名选中 -> 点 02 号位分配
        page.locator('button[data-pick="T1"]').click()
        page.locator('g[data-slot="02"]').click()
        state = page.evaluate("window.__WER_APP__.getState()")
        t1 = next(t for t in state["tasks"] if t["id"] == "T1")
        assert t1["slot"] == "02", t1
        assert page.locator("#score-total").inner_text().strip() == "700"

        # 关掉 T2：T2 少 100，T3 变 50 -> 550
        page.uncheck('input[data-enable="T2"]')
        assert page.locator("#score-total").inner_text().strip() == "550"
        assert "最多 50 分" in page.locator("#score-warnings").inner_text()

        page.check('input[data-enable="T2"]')
        assert page.locator("#score-total").inner_text().strip() == "700"

        # 取消“药丸已带回”：T2 -50、T3 -50 -> 600
        page.uncheck('input[data-setting="pill"]')
        assert page.locator("#score-total").inner_text().strip() == "600"
        page.check('input[data-setting="pill"]')
        assert page.locator("#score-total").inner_text().strip() == "700"

        # 任务页 / 数据页
        page.locator('button[data-tab="tasks"]').click()
        assert page.locator("#task-table-body tr").count() == 7
        page.locator('button[data-tab="data"]').click()
        assert page.locator("#node-table-body tr").count() == 22
        assert page.locator("#edge-table-body tr").count() == 21
        assert page.locator("#param-table-body tr").count() == 23

        # 截图（先恢复示例分配，保证截图是 700 分）
        page.evaluate("window.__WER_APP__.resetExample()")
        page.wait_for_timeout(250)
        assert page.locator("#score-total").inner_text().strip() == "700"
        page.locator('button[data-tab="map"]').click()
        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(350)
        page.screenshot(path=str(SHOTS / "map.png"), full_page=False)

        page.locator('button[data-tab="tasks"]').click()
        page.wait_for_timeout(350)
        page.screenshot(path=str(SHOTS / "tasks.png"), full_page=False)

        page.locator('button[data-tab="data"]').click()
        page.wait_for_timeout(350)
        page.screenshot(path=str(SHOTS / "data.png"), full_page=False)

        browser.close()

    if errors:
        print("ERRORS:")
        for e in errors:
            print(" ", e)
        return 1
    print("UI OK: 10 slots / 700 default / assign / dependency / 7 tasks / 22 nodes / 21 edges / 23 params")
    print("screenshots:", SHOTS)
    return 0


if __name__ == "__main__":
    sys.exit(main())
