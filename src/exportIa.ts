import * as XLSX from "xlsx";
import { iaTree, type IaNode } from "./ia";

const headers = [
  "기존/신규",
  "L1",
  "L1명",
  "L2",
  "L2명",
  "L3",
  "L3명",
  "설명",
  "협의 필요 부서",
  "카운셀러 질의응답",
  "기능 특이사항",
  "비고",
  "작성 일정",
] as const;

type Header = (typeof headers)[number];
export type ReqRow = Record<Header, string>;

function flattenIa(nodes: IaNode[], ancestors: string[] = []): ReqRow[] {
  const rows: ReqRow[] = [];
  nodes.forEach((node) => {
    const path = [...ancestors, node.label];
    rows.push({
      "기존/신규": "",
      L1: "",
      L1명: path[0] ?? "",
      L2: "",
      L2명: path[1] ?? "",
      L3: "",
      L3명: path.length >= 3 ? node.label : "",
      설명: node.desc,
      "협의 필요 부서": "",
      "카운셀러 질의응답": "",
      "기능 특이사항": "",
      비고: node.note ?? "",
      "작성 일정": "",
    });
    if (node.children?.length) {
      rows.push(...flattenIa(node.children, path));
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

function autoWidth(rows: ReqRow[]) {
  return headers.map((key) => {
    const max = rows.reduce((n, row) => Math.max(n, row[key].length), key.length);
    return { wch: Math.min(Math.max(max + 2, 10), 56) };
  });
}

export function downloadIaExcel() {
  const rows = flattenIa(iaTree);
  const sheet = XLSX.utils.json_to_sheet(rows, { header: [...headers] });
  sheet["!cols"] = autoWidth(rows);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "요구사항 정의");
  XLSX.writeFile(wb, `IRIS3.0_기능요건정리_${todayStamp()}.xlsx`);
}
