import { argv } from 'node:process'
import { crawlPage, getHTML } from './crawl';
import { ConcurrentCrawler } from './concurrent_crawler'
import { log } from './log'

async function main() {
    if (argv.length >= 3 && argv.length <= 5) {
        console.log(`Crawler received URL '${argv[2]}' to crawl`);
        const maxConcurrency = Number(argv[3]);
        const maxPages = Number(argv[4]);
        const paramsLog1 = maxConcurrency ? `  max concurrency: ${maxConcurrency}` : ``;
        const paramsLog2 = maxPages ? `  max pages: ${maxPages}` : ``;
        console.log(paramsLog1, paramsLog2);
        await crawlSiteAsync(argv[2], maxConcurrency, maxPages);
    } else {
        console.log(`expecting 1 command line argument <URL> to crawl.`);
        process.exit(1);
    }
}

async function crawlSiteAsync (url: string, maxConcurrency: number|undefined, maxPages:number|undefined) {
    const cc = new ConcurrentCrawler(url, maxConcurrency, maxPages);
    const pages = await cc.crawl();
    log("==========================================");
    console.log(`CRAWLED ${url}`);
    log("==========================================");
}


await main();