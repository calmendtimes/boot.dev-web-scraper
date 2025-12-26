import { JSDOM } from 'jsdom'


type ExtractedPageData = {
    url: string, 
    h1: string, 
    first_paragraph: string, 
    outgoing_links: string[], 
    image_urls: string[]
}


export function extractPageData(html: string, pageURL: string): ExtractedPageData {
    const data: ExtractedPageData = {
        url: pageURL,
        h1: getH1FromHTML(html),
        first_paragraph: getFirstParagraphFromHTML(html),
        outgoing_links: getURLsFromHTML(html, pageURL),
        image_urls: getImagesFromHTML(html, pageURL)
    }
    return data;
}


export function normalizeURL(url: string): string {
    const urlObj = new URL(url);
    let path = `${urlObj.host}${urlObj.pathname}`;
    if (path.slice(-1) === "/") {
        path = path.slice(0, -1);
    }
    return path;
}


function getJSDOM(html: string): any {
    try {
        return new JSDOM(html, { contentType: "text/html" });
    } catch (err) {
        console.log(`Error while parsing html ${err}`);
    }
}


export function getH1FromHTML(html: string): string {
    let jsdom = getJSDOM(html);
    const h1 = jsdom.window.document.querySelector('h1')
    return h1 ? h1.innerHTML : "";
}


export function getFirstParagraphFromHTML(html: string): string {
    let jsdom = getJSDOM(html);
    const main_p = jsdom.window.document.querySelector('main p')
    if (main_p) return main_p.innerHTML;
    const first_p = jsdom.window.document.querySelector('p')
    return first_p ? first_p.innerHTML : "";
}


export function getURLsFromHTML(html: string, baseURL: string): string[] {
    let jsdom = getJSDOM(html);
    const anchors = jsdom.window.document.querySelectorAll('a');
    const urls: string[] = [];

    anchors.forEach(e => {
        const href = e.getAttribute("href");
        if (!href) return;
        try {
            urls.push(new URL(href, baseURL).toString());
        } catch (err) {
            console.log(`Error while processing href ${err}`);
        }
    });

    return urls;
}


export function getImagesFromHTML(html: string, baseURL: string): string[] {
    let jsdom = getJSDOM(html);
    const anchors = jsdom.window.document.querySelectorAll('img');
    const urls: string[] = [];

    anchors.forEach(e => {
        const src = e.getAttribute("src");
        if (!src) return;
        try {
            urls.push(new URL(src, baseURL).toString());
        } catch (err) {
            console.log(`Error while processing src url ${err}`);
        }
    });

    return urls;
}