import pLimit from 'p-limit';
import * as crawl from "./crawl"
import { log } from './log'
import { writeCSVReport } from "./report"

export class ConcurrentCrawler {

    baseURL: string;
    pages: Record<string, number>;
    pageData: Record<string, crawl.ExtractedPageData>;
    limit: Function;
    maxPages: number;
    shouldStop: boolean;
    allTasks: Set<Promise<void>>;
    abortController: AbortController;


    constructor(baseURL: string, maxConcurrency: number = 1, maxPages: number = 1000) {
        this.baseURL = baseURL;
        this.pages = {};
        this.pageData = {};
        this.limit = pLimit(maxConcurrency);
        this.maxPages = maxPages;
        this.shouldStop = false;
        this.allTasks = new Set();
        this.abortController = new AbortController();
    }

    public async crawl() {
        await this.crawlPage(this.baseURL);
        await Promise.all(this.allTasks);   
        writeCSVReport(this.pageData);
        return this.pageData;
    }

    private shouldVisitPage(normalizedURL: string): boolean {
        if (this.shouldStop) {
            return false;
        }

        if (Object.keys(this.pages).length >= this.maxPages) {
            this.shouldStop = true;
            console.log("Reached maximum number of pages to crawl.")
            this.abortController.abort();
            return false;
        }

        if (normalizedURL in this.pages) {
            this.pages[normalizedURL]++;
            return false;
        } else {
            this.pages[normalizedURL] = 1;
            return true;
        }
    }

    private async getHTML(currentURL: string, signal?: AbortSignal): Promise<string> {
        return await this.limit(async () => {
            return crawl.getHTML(currentURL, signal);
        });
    }

    private async crawlPage(currentURL: string): Promise<void> {
        try {
            if(this.shouldStop) return;

            log(`  Crawling '(${currentURL})' ... `);
            if (new URL(this.baseURL).hostname !== new URL(currentURL).hostname) {
                log(`  '${currentURL}' and '${this.baseURL}' mismatch, stopping.`);
                return;
            }

            const normalizedURL = crawl.normalizeURL(currentURL)
            if(this.shouldVisitPage(currentURL)) {
                const html = await this.getHTML(currentURL) ?? "";
                const page_data = crawl.extractPageData(html, currentURL);
                this.pageData[normalizedURL] = page_data;

                for (const u of page_data.outgoing_links) {
                    const p = this.crawlPage(u);
                    p.finally(() => { this.allTasks.delete(p); });
                    this.allTasks.add(p);
                }

            } else {
                log(`  '${normalizedURL}' already crawled, stopping.`);
            }

        } catch (err) {
            log();
            log(`Error in crawlPage('${this.baseURL}', ${currentURL}): ${err}`);
        }
    }
}