import * as fs from "node:fs";
import * as path from "node:path";
import * as crawl from "./crawl"

export function writeCSVReport(
    pageData: Record<string, crawl.ExtractedPageData>, 
    filename = "report.csv"): void {

    const filepath = path.resolve(process.cwd(), filename);
    const headers = ["page_url", "h1", "first_paragraph", "outgoing_link_urls", "image_urls"];
    const rows: string[] = [headers.join(",")];

    for (const url in pageData) {
        let row = "";
        row += pageData[url].url + ",";
        row += pageData[url].h1 + ",";
        row += pageData[url].first_paragraph + ",";
        row += pageData[url].outgoing_links.join(";") + ",";
        row += pageData[url].image_urls.join(";");
        rows.push(row);
    }

    fs.writeFileSync(filepath, rows.join("\n"));
}

function csvEscape(field: string) {
  const str = field ?? "";
  const needsQuoting = /[",\n]/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuoting ? `"${escaped}"` : escaped;
}