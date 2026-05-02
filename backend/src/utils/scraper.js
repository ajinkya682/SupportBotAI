import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { URL } from 'url';
import config from '../config/config.js';


const CONFIG = config.scraper;

const INVALID_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'mp4', 'mp3', 'wav', 'doc', 'docx', 'xls', 'xlsx']);
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';


const getChromePath = async () => {
    if (CONFIG.NODE_ENV === 'production') return await chromium.executablePath();
    const paths = {
        darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        win32: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        linux: '/usr/bin/google-chrome'
    };
    return paths[process.platform] || paths.linux;
};

const cleanText = (rawText) => {
    if (!rawText) return '';
    return rawText
        .replace(/<script\b[^>]*>([\s\S]*?)<\/script>|<style\b[^>]*>([\s\S]*?)<\/style>/gi, '') // Fast script/style removal
        .replace(/[\n\r\t]+/g, ' ')
        .replace(/\s\s+/g, ' ')
        .replace(/(Cookie|Accept|Consent)(.*?)([A-Z]|$)/gi, '') // Generic banner cleaner
        .trim()
        .substring(0, CONFIG.RAW_TEXT_MAX);
};

const extractLinks = ($, baseUrl) => {
    const links = new Set();
    const baseObj = new URL(baseUrl);

    $('a[href]').each((_, el) => {
        try {
            const href = $(el).attr('href');
            if (!href || /^javascript:|mailto:|tel:/.test(href)) return;

            const absUrl = new URL(href, baseUrl);
            absUrl.hash = '';
            const normalized = absUrl.toString().replace(/\/$/, '');

            if (absUrl.origin === baseObj.origin && !INVALID_EXTENSIONS.has(absUrl.pathname.split('.').pop())) {
                links.add(normalized);
            }
        } catch {}
    });
    return Array.from(links).slice(0, CONFIG.LINK_LIMIT);
};


const fetchWithAxios = async (url) => {
    try {
        const { data } = await axios.get(url, {
            timeout: CONFIG.TIMEOUTS.AXIOS,
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(data);
        $('script, style, noscript, nav, footer, header, aside, form, svg').remove();
        const text = cleanText($('body').text());
        return text.length > CONFIG.MIN_CONTENT_LENGTH ? { $, text } : null;
    } catch { return null; }
};

const fetchWithPuppeteer = async (url, browser) => {
    if (!browser) return null;
    const page = await browser.newPage();
    try {
        await page.setUserAgent(USER_AGENT);
        await page.setRequestInterception(true);
        page.on('request', r => ['image', 'font', 'media'].includes(r.resourceType()) ? r.abort() : r.continue());

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: CONFIG.TIMEOUTS.PUPPETEER });
        const content = await page.content();
        const $ = cheerio.load(content);
        $('script, style, noscript, nav, footer, header, aside, form, svg').remove();
        return { $, text: cleanText($('body').text()) };
    } catch { return null; }
    finally { await page.close(); }
};

// --- SCRAPE LOGIC ---
export const scrapeWebsite = async (startUrl) => {
    const visited = new Set();
    const results = [];
    const queue = [startUrl.replace(/\/$/, '')];
    let browser = null;

    try {
        if (CONFIG.USE_PUPPETEER) {
            browser = await puppeteer.launch({
                executablePath: await getChromePath(),
                headless: 'new',
                args: process.env.NODE_ENV === 'production' ? chromium.args : ['--no-sandbox']
            });
        }

        while (queue.length > 0 && visited.size < CONFIG.MAX_PAGES) {
            const url = queue.shift();
            if (visited.has(url)) continue;
            visited.add(url);

            // Attempt Axios first (Fast), then Puppeteer (Reliable)
            let pageResult = await fetchWithAxios(url);
            if (!pageResult && browser) pageResult = await fetchWithPuppeteer(url, browser);

            if (pageResult) {
                // Deduplication check
                const isDup = results.some(r => {
                    const words = pageResult.text.split(' ');
                    const common = words.filter(w => r.text.includes(w)).length;
                    return common > words.length * CONFIG.DEDUP_THRESHOLD;
                });

                if (!isDup) {
                    results.push({ url, text: pageResult.text });
                    extractLinks(pageResult.$, url).forEach(link => {
                        if (!visited.has(link)) queue.push(link);
                    });
                }
            }
            if (queue.length > 0) await new Promise(r => setTimeout(r, CONFIG.DELAY_MS));
        }
    } finally {
        if (browser) await browser.close();
    }

    const combined = results.map(r => `[PAGE: ${r.url}]\n${r.text}`).join('\n\n').substring(0, CONFIG.MAX_CHARS);

    return {
        pagesScanned: results.length,
        totalChars: combined.length,
        knowledge: combined,
        pagesList: results.map(r => r.url)
    };
};