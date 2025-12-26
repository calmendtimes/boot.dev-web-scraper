import { describe, test, expect, beforeAll } from "vitest";
import * as crawl from "./crawl"

describe("normalizeURL", () => {

    test("formats correctly", async () => {
        const url1 = "https://BLOG.boot.dev/path/";
        const url2 = "https://blog.BOOT.dev/path";
        const url3 = "http://blog.boot.DEV/path/";
        const url4 = "http://blog.boot.dev/path";
        const url_expected = "blog.boot.dev/path";

        expect(crawl.normalizeURL(url1)).toBe(url_expected);
        expect(crawl.normalizeURL(url2)).toBe(url_expected);
        expect(crawl.normalizeURL(url3)).toBe(url_expected);
        expect(crawl.normalizeURL(url4)).toBe(url_expected);
    });
});


test("getH1FromHTML returns empty string", () => {
    const inputBody = `<html> <body> </body> </html>`;
    const actual = crawl.getH1FromHTML(inputBody);
    const expected = "";
    expect(actual).toEqual(expected);
});


test("getH1FromHTML returns first h1", () => {
    const inputBody = `
    <html>
        <body>
            <h1>Test Title</h1>
            <h1>Second h1</h1>
        </body>
    </html>`;
    const actual = crawl.getH1FromHTML(inputBody);
    const expected = "Test Title";
    expect(actual).toEqual(expected);
});


test("getFirstParagraphFromHTML empty string", () => {
    const inputBody = `<html> <body> </body> </html>`;
    const actual = crawl.getFirstParagraphFromHTML(inputBody);
    const expected = "";
    expect(actual).toEqual(expected);
});


test("getFirstParagraphFromHTML main priority", () => {
    const inputBody = `
    <html>
        <body>
            <p>Outside paragraph.</p>
            <main>
                <p>Main paragraph.</p>
            </main>
        </body>
    </html>`;
    const actual = crawl.getFirstParagraphFromHTML(inputBody);
    const expected = "Main paragraph.";
    expect(actual).toEqual(expected);
});


test("getFirstParagraphFromHTML first paragraph", () => {
    const inputBody = `
    <html>
        <body>
            <p>First paragraph.</p>
            <p>Second paragraph.</p>
        </body>
    </html>`;
    const actual = crawl.getFirstParagraphFromHTML(inputBody);
    const expected = "First paragraph.";
    expect(actual).toEqual(expected);
});


test("getURLsFromHTML empty", () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `<html> <body> </body> </html>`;
    const actual = crawl.getURLsFromHTML(inputBody, inputURL);
    const expected: string[] = [];

    expect(actual).toEqual(expected);
});


test("getURLsFromHTML absolute", () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `
    <html>
        <body>
            <a href="https://blog.boot.dev"><span>Boot.dev</span></a>
            <a href="https://asdf.zxcv"><span>Boot.dev</span></a>
        </body>
    </html>`;

    const actual = crawl.getURLsFromHTML(inputBody, inputURL);
    const expected = ["https://blog.boot.dev/", "https://asdf.zxcv/"];

    expect(actual).toEqual(expected);
});


test("getURLsFromHTML relative", () => {
    const inputURL = "https://asdf.zxcv";
    const inputBody = `
    <html>
        <body>
            <a href="/qqq/www"><span>Boot.dev</span></a>
            <a href="/333/444"><span>Boot.dev</span></a>
        </body>
    </html>`;

    const actual = crawl.getURLsFromHTML(inputBody, inputURL);
    const expected = ["https://asdf.zxcv/qqq/www", "https://asdf.zxcv/333/444"];

    expect(actual).toEqual(expected);
});


test("getImagesFromHTML empty", () => {
    const inputURL = "https://address.com";
    const inputBody = `<html><body> </body></html>`;
    const actual = crawl.getImagesFromHTML(inputBody, inputURL);
    const expected: string[] = [];
    expect(actual).toEqual(expected);
});


test("getImagesFromHTML multiple", () => {
    const inputURL = "https://address.com";
    const inputBody = `
        <html><body>
        <img src="/logo.png" alt="Logo">
        <img src="https://cdn.address.com/image.jpg">
        </body></html>`;
    const actual = crawl.getImagesFromHTML(inputBody, inputURL);
    const expected = [
        "https://address.com/logo.png",
        "https://cdn.address.com/image.jpg",
    ];
    expect(actual).toEqual(expected);
});


test("extractPageData basic", () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `
    <html><body>
        <h1>Test Title</h1>
        <p>This is the first paragraph.</p>
        <a href="/link1">Link 1</a>
        <img src="/image1.jpg" alt="Image 1">
    </body></html>`;

    const actual = crawl.extractPageData(inputBody, inputURL);
    const expected = {
        url: "https://blog.boot.dev",
        h1: "Test Title",
        first_paragraph: "This is the first paragraph.",
        outgoing_links: ["https://blog.boot.dev/link1"],
        image_urls: ["https://blog.boot.dev/image1.jpg"],
    };

    expect(actual).toEqual(expected);
});