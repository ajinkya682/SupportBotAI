import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { URL } from 'url';

const MAX_PAGES = parseInt(process.env.SCRAPER_MAX_PAGES) || 8;
const DELAY_MS = parseInt(process.env.SCRAPER_DELAY_MS) || 1000;
const MAX_CHARS = parseInt(process.env.KNOWLEDGE_MAX_CHARS) || 15000;
const USE_PUPPETEER = process.env.SCRAPER_USE_PUPPETEER !== 'false';
const RAW_TEXT_MAX = 20000;
const MIN_CONTENT_LENGTH = 300;
const AXIOS_TIMEOUT_MS = 10000;
const PUPPETEER_TIMEOUT_MS = 30000;
const PUPPETEER_GRACE_MS = 2000;
const DEDUP_SIMILARITY_THRESHOLD = 0.85;
const LINK_LIMIT_PER_PAGE = 15;

const INVALID_EXTENSIONS = new Set([
  'pdf', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'mp4', 'mp3', 'wav', 'doc', 'docx', 'xls', 'xlsx',
]);

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const getChromePath = async () => {
  if (process.env.NODE_ENV === 'production') {
    return await chromium.executablePath();
  }
  const { platform } = process;
  if (platform === 'darwin') return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (platform === 'win32') return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  return '/usr/bin/google-chrome';
};

const cleanText = (rawText) => {
  if (!rawText) return '';
  return rawText
    .replace(/[\n\r\t]+/g, ' ')
    .replace(/\s\s+/g, ' ')
    .replace(/Cookie (Policy|Consent|Settings|Preferences).*?([A-Z]|$)/gi, '')
    .replace(/Accept (all|necessary|cookies).*?([A-Z]|$)/gi, '')
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/g, '')
    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/g, '')
    .trim()
    .substring(0, RAW_TEXT_MAX);
};

const extractLinks = ($, baseUrl) => {
  const links = new Set();
  const baseObj = new URL(baseUrl);

  $('a[href]').each((_, element) => {
    try {
      const href = $(element).attr('href');
      if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      const absoluteUrl = new URL(href, baseUrl);
      absoluteUrl.hash = '';
      const normalized = absoluteUrl.toString().replace(/\/$/, '');
      if (absoluteUrl.origin !== baseObj.origin) return;
      const ext = absoluteUrl.pathname.split('.').pop().toLowerCase();
      if (!INVALID_EXTENSIONS.has(ext)) links.add(normalized);
    } catch {
      // Ignore
    }
  });

  return Array.from(links).slice(0, LINK_LIMIT_PER_PAGE);
};

const fetchWithAxios = async (url) => {
  const response = await axios.get(url, {
    timeout: AXIOS_TIMEOUT_MS,
    headers: { 'User-Agent': USER_AGENT },
  });
  const $ = cheerio.load(response.data);
  $('script, style, noscript, nav, footer, header, aside, form, iframe, svg').remove();
  const text = cleanText($('body').text());
  return text.length > MIN_CONTENT_LENGTH ? { $, text } : null;
};

const fetchWithPuppeteer = async (url, browser) => {
  let page = null;
  try {
    page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    await page.setViewport({ width: 1280, height: 800 });
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'font', 'media'].includes(req.resourceType())) req.abort();
      else req.continue();
    });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PUPPETEER_TIMEOUT_MS });
    await new Promise((r) => setTimeout(r, PUPPETEER_GRACE_MS));
    const content = await page.content();
    const $ = cheerio.load(content);
    $('script, style, noscript, nav, footer, header, aside, form, iframe, svg').remove();
    const text = cleanText($('body').text());
    return { $, text };
  } catch (e) {
    console.error(`[Puppeteer] Failed for ${url}:`, e.message);
    return null;
  } finally {
    if (page) await page.close();
  }
};

const fetchPage = async (url, browser) => {
  try {
    const result = await fetchWithAxios(url);
    if (result) return result;
  } catch {
    // Fall through
  }

  if (browser && USE_PUPPETEER) {
    return fetchWithPuppeteer(url, browser);
  }
  return null;
};

const isDuplicate = (newText, existing) => {
  const w1 = newText.split(' ');
  return existing.some((item) => {
    const w2 = item.text.split(' ');
    const common = w1.filter((w) => w2.includes(w)).length;
    return common > w1.length * DEDUP_SIMILARITY_THRESHOLD;
  });
};

export const scrapeWebsite = async (startUrl) => {
  const normalizedStart = startUrl.replace(/\/$/, '');
  const visited = new Set();
  const results = [];
  const queue = [normalizedStart];

  let browser = null;

  try {
    if (USE_PUPPETEER) {
      const chromePath = await getChromePath();
      const launchOptions = {
        executablePath: chromePath,
        headless: 'new',
        args:
          process.env.NODE_ENV === 'production'
            ? chromium.args
            : ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      };
      browser = await puppeteer.launch(launchOptions);
    }

    while (queue.length > 0 && visited.size < MAX_PAGES) {
      const url = queue.shift();
      if (visited.has(url)) continue;
      visited.add(url);

      const pageResult = await fetchPage(url, browser);

      if (pageResult && !isDuplicate(pageResult.text, results)) {
        results.push({ url, text: pageResult.text });
        if (visited.size < MAX_PAGES) {
          const links = extractLinks(pageResult.$, url);
          for (const link of links) {
            if (!visited.has(link)) queue.push(link);
          }
        }
      }

      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  } catch (error) {
    console.error('Scraper Error:', error);
  } finally {
    if (browser) await browser.close();
  }

  const combinedKnowledge = results
    .map((res) => `=== PAGE: ${res.url} ===\n${res.text}\n\n`)
    .join('')
    .substring(0, MAX_CHARS);

  return {
    pagesScanned: results.length,
    totalChars: combinedKnowledge.length,
    knowledge: combinedKnowledge,
    pagesList: results.map((r) => r.url),
  };
};