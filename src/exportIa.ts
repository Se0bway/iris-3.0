import * as XLSX from "xlsx";
import { screenNotes } from "./data";
import { iaTree, screenCatalog, type IaNode } from "./ia";

export interface IaRow {
  번호: string;
  레벨: number;
  대분류: string;
  중분류: string;
  소분류: string;
  세부분류: string;
  메뉴명: string;
  유형: string;
  ScreenId: string;
  설명: string;
  진입경로: string;
  비고: string;
}

function flattenIa(nodes: IaNode[], ancestors: string[] = [], prefix = ""): IaRow[] {
  const rows: IaRow[] = [];
  nodes.forEach((node, i) => {
    const num = prefix ? `${prefix}.${i + 1}` : `${i + 1}`;
    const path = [...ancestors, node.label];
    rows.push({
      번호: num,
      레벨: path.length,
      대분류: path[0] ?? "",
      중분류: path[1] ?? "",
      소분류: path[2] ?? "",
      세부분류: path[3] ?? "",
      메뉴명: node.label,
      유형: node.type,
      ScreenId: node.screenId ?? "",
      설명: node.desc,
      진입경로: node.entry ?? "",
      비고: node.note ?? "",
    });
    if (node.children?.length) {
      rows.push(...flattenIa(node.children, path, num));
    }
  });
  return rows;
}

function todayStamp() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function autoWidth(rows: object[], headers: string[]) {
  return headers.map((key) => {
    const max = rows.reduce((n, row) => {
      const v = String((row as Record<string, unknown>)[key] ?? "");
      return Math.max(n, v.length);
    }, key.length);
    return { wch: Math.min(Math.max(max + 2, 10), 56) };
  });
}

export function downloadIaExcel() {
  const menuRows = flattenIa(iaTree);
  const screenRows = screenCatalog.map((s) => ({
    ScreenId: s.screenId,
    화면명: s.name,
    소속대메뉴: s.group,
    설명: screenNotes[s.screenId] ?? "",
    주요진입점: s.entry,
  }));

  const menuHeaders = [
    "번호",
    "레벨",
    "대분류",
    "중분류",
    "소분류",
    "세부분류",
    "메뉴명",
    "유형",
    "ScreenId",
    "설명",
    "진입경로",
    "비고",
  ];
  const screenHeaders = ["ScreenId", "화면명", "소속대메뉴", "설명", "주요진입점"];

  const menuSheet = XLSX.utils.json_to_sheet(menuRows, { header: menuHeaders });
  const screenSheet = XLSX.utils.json_to_sheet(screenRows, { header: screenHeaders });
  menuSheet["!cols"] = autoWidth(menuRows, menuHeaders);
  screenSheet["!cols"] = autoWidth(screenRows, screenHeaders);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, menuSheet, "메뉴구조도");
  XLSX.utils.book_append_sheet(wb, screenSheet, "화면목록");
  XLSX.writeFile(wb, `IRIS3.0_메뉴구조도_${todayStamp()}.xlsx`);
}
