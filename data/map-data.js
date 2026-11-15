/* 自动生成，勿手改：python tools/build_data.py */
window.WER_MAP = {
  "schema": "wer-map/1",
  "meta": {
    "name": "2026 WER 普级赛 · 医院/伙伴机器人 场地",
    "version": "0.1.0",
    "units": "cm",
    "origin": "场地左下角为 (0,0)，x 向右，y 向上",
    "source": "2026年赛规.pdf + 地图.jpg 标定（5.641 px/cm，边界 x11..1252 / y8..685）",
    "rules": "地膜 120x220cm；引导线宽 2-3cm（图上 2.4cm）；30x30cm 基地在底部中央；模型初始位置 1-10，红色箭头=模型正面朝向",
    "note": "本文件是全场唯一真值源。params 中 23 个实测参数与图上几何有差异的项需在编辑器里核对；改尺寸请用 地图编辑器.html 保存回本文件。",
    "calibration_note": "几何按 地图.jpg 像素标定（5.641px/cm，边界x11..1252/y8..685），已由 校验/像素测量.py 复核：11条粗线中心、13节点、场地220x120、线宽2.30~2.48、基地外沿29.6~29.7(=30x30)、10个模型区16x8/8x16 与图差均<=0.2cm，坐标无需修正。23个实测参数与几何的偏差来自尺量方式（从粗线内边缘量会少约2.5cm；#21/#22 疑按旧版200x100量），故规划一律以几何为准。基地 27.4cm 说法=黑框中心线间距(27.39)，黑框外沿才是30cm，base 保持30x30。slots 01-04 的 facing=270 是按红标记位于模型区靠场内一侧推断（图上红箭头仅约1.5cm无法判读箭头方向），现场以实物为准。"
  },
  "field": {
    "width": 220.0,
    "height": 120.0,
    "line_width": 2.5,
    "border_width": 1.0
  },
  "base": {
    "id": "BASEC",
    "center": [
      108.3,
      15.5
    ],
    "size": [
      30.0,
      30.0
    ],
    "entry": [
      108.3,
      29.2
    ],
    "entry_facing": 90
  },
  "nodes": {
    "S01": {
      "xy": [
        39.98,
        111.14
      ],
      "type": "slot",
      "slot": "01"
    },
    "S02": {
      "xy": [
        82.79,
        111.14
      ],
      "type": "slot",
      "slot": "02"
    },
    "S03": {
      "xy": [
        125.42,
        111.14
      ],
      "type": "slot",
      "slot": "03"
    },
    "S04": {
      "xy": [
        170.1,
        111.14
      ],
      "type": "slot",
      "slot": "04"
    },
    "S05": {
      "xy": [
        211.31,
        74.18
      ],
      "type": "slot",
      "slot": "05"
    },
    "S06": {
      "xy": [
        211.31,
        35.98
      ],
      "type": "slot",
      "slot": "06"
    },
    "S07": {
      "xy": [
        170.1,
        8.69
      ],
      "type": "slot",
      "slot": "07"
    },
    "S08": {
      "xy": [
        58.5,
        8.69
      ],
      "type": "slot",
      "slot": "08"
    },
    "S09": {
      "xy": [
        8.69,
        36.07
      ],
      "type": "slot",
      "slot": "09"
    },
    "S10": {
      "xy": [
        8.69,
        74.18
      ],
      "type": "slot",
      "slot": "10"
    },
    "J01": {
      "xy": [
        39.98,
        74.18
      ],
      "type": "junction"
    },
    "J02": {
      "xy": [
        82.79,
        74.18
      ],
      "type": "junction"
    },
    "J03": {
      "xy": [
        125.42,
        74.18
      ],
      "type": "junction"
    },
    "V1E": {
      "xy": [
        39.98,
        53.71
      ],
      "type": "dead_end"
    },
    "JH5": {
      "xy": [
        125.42,
        53.53
      ],
      "type": "junction"
    },
    "JV6": {
      "xy": [
        108.32,
        53.53
      ],
      "type": "junction"
    },
    "H5E": {
      "xy": [
        149.09,
        53.53
      ],
      "type": "dead_end"
    },
    "BTOP": {
      "xy": [
        108.32,
        29.16
      ],
      "type": "junction"
    },
    "J09": {
      "xy": [
        58.5,
        36.07
      ],
      "type": "junction"
    },
    "J05": {
      "xy": [
        170.1,
        74.18
      ],
      "type": "junction"
    },
    "J06": {
      "xy": [
        170.1,
        35.98
      ],
      "type": "junction"
    },
    "BASEC": {
      "xy": [
        108.3,
        15.5
      ],
      "type": "base"
    }
  },
  "edges": [
    {
      "id": "L01",
      "a": "S10",
      "b": "J01",
      "kind": "line",
      "group": "H1"
    },
    {
      "id": "L02",
      "a": "J01",
      "b": "J02",
      "kind": "line",
      "group": "H1"
    },
    {
      "id": "L03",
      "a": "J02",
      "b": "J03",
      "kind": "line",
      "group": "H1"
    },
    {
      "id": "L04",
      "a": "J03",
      "b": "S03",
      "kind": "line",
      "group": "V3"
    },
    {
      "id": "L05",
      "a": "J01",
      "b": "S01",
      "kind": "line",
      "group": "V1"
    },
    {
      "id": "L06",
      "a": "J01",
      "b": "V1E",
      "kind": "line",
      "group": "V1"
    },
    {
      "id": "L07",
      "a": "J02",
      "b": "S02",
      "kind": "line",
      "group": "V2"
    },
    {
      "id": "L08",
      "a": "J03",
      "b": "JH5",
      "kind": "line",
      "group": "V3"
    },
    {
      "id": "L09",
      "a": "JV6",
      "b": "JH5",
      "kind": "line",
      "group": "H5"
    },
    {
      "id": "L10",
      "a": "JH5",
      "b": "H5E",
      "kind": "line",
      "group": "H5"
    },
    {
      "id": "L11",
      "a": "BTOP",
      "b": "JV6",
      "kind": "line",
      "group": "V6"
    },
    {
      "id": "L12",
      "a": "S09",
      "b": "J09",
      "kind": "line",
      "group": "H3"
    },
    {
      "id": "L13",
      "a": "J09",
      "b": "S08",
      "kind": "line",
      "group": "V5"
    },
    {
      "id": "L14",
      "a": "S04",
      "b": "J05",
      "kind": "line",
      "group": "V4"
    },
    {
      "id": "L15",
      "a": "J05",
      "b": "S05",
      "kind": "line",
      "group": "H2"
    },
    {
      "id": "L16",
      "a": "J05",
      "b": "J06",
      "kind": "line",
      "group": "V4"
    },
    {
      "id": "L17",
      "a": "J06",
      "b": "S06",
      "kind": "line",
      "group": "H4"
    },
    {
      "id": "L18",
      "a": "J06",
      "b": "S07",
      "kind": "line",
      "group": "V4"
    },
    {
      "id": "L19",
      "a": "BTOP",
      "b": "BASEC",
      "kind": "base"
    },
    {
      "id": "F01",
      "a": "BASEC",
      "b": "S07",
      "kind": "free",
      "length": 62.0,
      "note": "脱线：基地→07。几何 62.0；实测参数14=基地右缘到07模型区左缘39cm，编码器实际值需上车标定"
    },
    {
      "id": "F02",
      "a": "BASEC",
      "b": "S08",
      "kind": "free",
      "length": 50.3,
      "note": "脱线：基地→08。几何 50.3；实测参数13=08模型区右缘到基地左缘27cm，编码器实际值需上车标定"
    }
  ],
  "slots": [
    {
      "id": "01",
      "node": "S01",
      "edge": "top",
      "facing": 270,
      "area": {
        "cx": 39.98,
        "cy": 116.0,
        "w": 16,
        "h": 8
      },
      "mark": [
        39.98,
        112.6
      ]
    },
    {
      "id": "02",
      "node": "S02",
      "edge": "top",
      "facing": 270,
      "area": {
        "cx": 82.79,
        "cy": 116.0,
        "w": 16,
        "h": 8
      },
      "mark": [
        82.79,
        112.6
      ]
    },
    {
      "id": "03",
      "node": "S03",
      "edge": "top",
      "facing": 270,
      "area": {
        "cx": 125.42,
        "cy": 116.0,
        "w": 16,
        "h": 8
      },
      "mark": [
        125.42,
        112.6
      ]
    },
    {
      "id": "04",
      "node": "S04",
      "edge": "top",
      "facing": 270,
      "area": {
        "cx": 170.1,
        "cy": 116.0,
        "w": 16,
        "h": 8
      },
      "mark": [
        170.1,
        112.6
      ]
    },
    {
      "id": "05",
      "node": "S05",
      "edge": "right",
      "facing": 180,
      "area": {
        "cx": 216.0,
        "cy": 74.18,
        "w": 8,
        "h": 16
      },
      "mark": [
        212.3,
        74.18
      ]
    },
    {
      "id": "06",
      "node": "S06",
      "edge": "right",
      "facing": 180,
      "area": {
        "cx": 216.0,
        "cy": 35.98,
        "w": 8,
        "h": 16
      },
      "mark": [
        212.3,
        35.98
      ]
    },
    {
      "id": "07",
      "node": "S07",
      "edge": "bottom",
      "facing": 90,
      "area": {
        "cx": 170.1,
        "cy": 4.0,
        "w": 16,
        "h": 8
      },
      "mark": [
        170.1,
        7.4
      ]
    },
    {
      "id": "08",
      "node": "S08",
      "edge": "bottom",
      "facing": 90,
      "area": {
        "cx": 58.5,
        "cy": 4.0,
        "w": 16,
        "h": 8
      },
      "mark": [
        58.5,
        7.4
      ]
    },
    {
      "id": "09",
      "node": "S09",
      "edge": "left",
      "facing": 0,
      "area": {
        "cx": 4.0,
        "cy": 36.07,
        "w": 8,
        "h": 16
      },
      "mark": [
        7.3,
        36.07
      ]
    },
    {
      "id": "10",
      "node": "S10",
      "edge": "left",
      "facing": 0,
      "area": {
        "cx": 4.0,
        "cy": 74.18,
        "w": 8,
        "h": 16
      },
      "mark": [
        7.3,
        74.18
      ]
    }
  ],
  "params": [
    {
      "id": 1,
      "value": 50.0,
      "desc": "场地左边界→08模型区左缘",
      "feature": {
        "kind": "dist",
        "from": "border.left",
        "to": "S08.area.left"
      }
    },
    {
      "id": 2,
      "value": 28.5,
      "desc": "08线竖直（J09→08）",
      "feature": {
        "kind": "dist",
        "from": "J09",
        "to": "S08"
      }
    },
    {
      "id": 3,
      "value": 51.0,
      "desc": "09线水平（09→J09）",
      "feature": {
        "kind": "dist",
        "from": "S09",
        "to": "J09"
      }
    },
    {
      "id": 4,
      "value": 8.0,
      "desc": "场地左边界→09线端点",
      "feature": {
        "kind": "dist",
        "from": "border.left",
        "to": "S09"
      }
    },
    {
      "id": 5,
      "value": 108.0,
      "desc": "10→03路口 主横线全长（待确认）",
      "feature": {
        "kind": "dist",
        "from": "S10",
        "to": "J03"
      },
      "flag": "尺量偏差：几何116.7；规划用几何",
      "value_note": "value 108 偏小：图上与几何均为116.7(±0.1)，疑为端点/分段量错；规划用几何值"
    },
    {
      "id": 6,
      "value": 32.2,
      "desc": "10→01路口",
      "feature": {
        "kind": "dist",
        "from": "S10",
        "to": "J01"
      }
    },
    {
      "id": 7,
      "value": 40.0,
      "desc": "01路口→02路口",
      "feature": {
        "kind": "dist",
        "from": "J01",
        "to": "J02"
      },
      "value_note": "value 从粗线内边缘量（少约2.5cm≈一条线宽），几何42.8"
    },
    {
      "id": 8,
      "value": 40.0,
      "desc": "02路口→03路口",
      "feature": {
        "kind": "dist",
        "from": "J02",
        "to": "J03"
      },
      "value_note": "value 从粗线内边缘量（少约2.5cm≈一条线宽），几何42.6"
    },
    {
      "id": 9,
      "value": 42.0,
      "desc": "中部横线H5全长",
      "feature": {
        "kind": "dist",
        "from": "JV6",
        "to": "H5E"
      }
    },
    {
      "id": 10,
      "value": 7.2,
      "desc": "待确认（图上为V6→V3水平约17cm）",
      "feature": null,
      "flag": "含义待确认；疑为 V6→JH5 水平17.1cm",
      "value_note": "value 7.2 含义未确认；标注图上该箭头段实测为 V6→JH5 水平17.1cm，若确认可改 feature"
    },
    {
      "id": 11,
      "value": 35.0,
      "desc": "03路口→03模型区",
      "feature": {
        "kind": "dist",
        "from": "J03",
        "to": "S03"
      },
      "value_note": "value 从粗线内边缘量（少约1.9cm），几何37.0"
    },
    {
      "id": 12,
      "value": 21.3,
      "desc": "基地顶→中部横线（V6）",
      "feature": {
        "kind": "dist",
        "from": "BTOP",
        "to": "JV6"
      },
      "value_note": "value 偏小3.1，疑端点取错；几何(BTOP→JV6)24.4"
    },
    {
      "id": 13,
      "value": 27.0,
      "desc": "08模型区右缘→基地左缘",
      "feature": {
        "kind": "dist",
        "from": "S08.area.right",
        "to": "BASE.left"
      }
    },
    {
      "id": 14,
      "value": 39.0,
      "desc": "基地右缘→07模型区左缘",
      "feature": {
        "kind": "dist",
        "from": "BASE.right",
        "to": "S07.area.left"
      }
    },
    {
      "id": 15,
      "value": 41.0,
      "desc": "07模型区右缘→场地右边界",
      "feature": {
        "kind": "dist",
        "from": "S07.area.right",
        "to": "border.right"
      }
    },
    {
      "id": 16,
      "value": 102.0,
      "desc": "04→07 整条竖线",
      "feature": {
        "kind": "dist",
        "from": "S04",
        "to": "S07"
      }
    },
    {
      "id": 17,
      "value": 35.5,
      "desc": "04→05路口",
      "feature": {
        "kind": "dist",
        "from": "S04",
        "to": "J05"
      }
    },
    {
      "id": 18,
      "value": 35.5,
      "desc": "05路口→06路口",
      "feature": {
        "kind": "dist",
        "from": "J05",
        "to": "J06"
      },
      "value_note": "value 从粗线内边缘量（少约2.5cm≈一条线宽），几何38.2"
    },
    {
      "id": 19,
      "value": 26.0,
      "desc": "06路口→07",
      "feature": {
        "kind": "dist",
        "from": "J06",
        "to": "S07"
      }
    },
    {
      "id": 20,
      "value": 40.0,
      "desc": "05线（05路口→05）",
      "feature": {
        "kind": "dist",
        "from": "J05",
        "to": "S05"
      }
    },
    {
      "id": 21,
      "value": 200.0,
      "desc": "场地总宽（赛规220）",
      "feature": {
        "kind": "field",
        "axis": "width"
      },
      "flag": "疑按旧版200x100量；赛规/图上220",
      "value_note": "value 200 疑按旧版 200x100 地膜量；赛规与图上均为 220cm"
    },
    {
      "id": 22,
      "value": 100.0,
      "desc": "场地总高（赛规120）",
      "feature": {
        "kind": "field",
        "axis": "height"
      },
      "flag": "疑按旧版200x100量；赛规/图上120",
      "value_note": "value 100 疑按旧版 200x100 地膜量；赛规与图上均为 120cm"
    },
    {
      "id": 23,
      "value": 35.0,
      "desc": "01→01路口",
      "feature": {
        "kind": "dist",
        "from": "S01",
        "to": "J01"
      },
      "value_note": "value 从粗线内边缘量（少约1.9cm），几何37.0"
    }
  ]
};
