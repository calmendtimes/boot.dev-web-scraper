import { argv } from 'node:process'
import { crawlPage, getHTML } from './crawl';


async function main() {
    if (argv.length == 3) {
        console.log(`Crawler received URL '${argv[2]}' to crawl`);
        await crawlPage(argv[2], argv[2]);
        //const html = await getHTML(argv[2]);
    } else {
        console.log(`expecting 1 command line argument <URL> to crawl.`);
        process.exit(1);
    }
}

await main();