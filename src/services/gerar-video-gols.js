const pptr = require('puppeteer');
const cheerio = require('cheerio');
const utils = require('./../utils');
const pastas = require('./../gerenciador-pastas');
const { record } = require('puppeteer-recorder');

(async () => {
    const browser = await pptr.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1550, height: 5000 });
    await page.goto('https://ge.globo.com/futebol/brasileirao-serie-a/playlist/veja-lances-e-gols-da-14-rodada-do-brasileirao-2021.ghtml');

    await record({
        browser: browser, // Optional: a puppeteer Browser instance,
        page, // Optional: a puppeteer Page instance,
        output: './output.webm',
        fps: 60,
        frames: 60 * 5, // 5 seconds at 60 fps,
        prepare: function () {}, // <-- add this line
        render: function () {}, // <-- add this line
    });
})();
