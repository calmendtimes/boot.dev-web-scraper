import pLimit from 'p-limit';
import * as crawl from "./crawl"
import { log } from './log'

export class ConcurrentCrawler {

    baseURL: string;
    pages: Record<string, number>;
    limit: Function;
    maxPages: number;
    shouldStop: boolean;
    allTasks: Set<Promise<void>>;
    abortController: AbortController;


    constructor(baseURL: string, maxConcurrency: number = 1, maxPages: number = 1000) {
        this.baseURL = baseURL;
        this.pages = {};
        this.limit = pLimit(maxConcurrency);
        this.maxPages = maxPages;
        this.shouldStop = false;
        this.allTasks = new Set();
        this.abortController = new AbortController();
    }

    public async crawl() {
        await this.crawlPage(this.baseURL);
        await Promise.all(this.allTasks);   
        return this.pages;
    }

    private addPageVisit(normalizedURL: string): boolean {
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
            if(this.addPageVisit(currentURL)) {
                const html = await this.getHTML(currentURL) ?? "";
                const urls = crawl.getURLsFromHTML(html, this.baseURL);
                
                for (const u of urls) {
                    const p = this.crawlPage(u);
                    p.finally(() => { this.allTasks.delete(p); });
                    this.allTasks.add(p);
                }

                //await Promise.all(urls.map(u => this.crawlPage(u)));
            } else {
                log(`  '${normalizedURL}' already crawled, stopping.`);
            }

        } catch (err) {
            log();
            log(`Error in crawlPage('${this.baseURL}', ${currentURL}): ${err}`);
        }
    }
}