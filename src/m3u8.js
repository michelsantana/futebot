const pptr = require('puppeteer');
const pastas = require('./gerenciador-pastas');
const utils = require('./utils');
const axios = require('axios').default;
const $c = require('cheerio');
const fs = require('fs');

(async () => {
    var rd = 18, time1 = 'red', time2 = 'gre', index = 1;
    //var url = 'https://ge.globo.com/futebol/brasileirao-serie-a/playlist/veja-lances-e-gols-da-14-rodada-do-brasileirao-2021.ghtml';
    var url = 'https://ge.globo.com/playlist/assista-aos-nossos-principais-videos.ghtml';

    var browser = await pptr.launch({
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        headless: false,
        defaultViewport: null,
        devtools: true,
        //args: ['--window-size=1920,1170','--window-position=0,0']
        args: ['--window-size=1920,1080', '--window-position=520,50'],
    });

    var page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.goto(url);

    await page.evaluate(() => {
        window.m3u8 = [];
        let baseXmlHttpRequest = window.XMLHttpRequest.prototype.open;
        window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
            this.addEventListener('load', function (event) {
                if (url.indexOf('.m3u8') > -1 && this.responseText.indexOf('.ts') > -1) {
                    window.m3u8.push({
                        url: url,
                        response: this.responseText,
                    });
                }
            });
            return baseXmlHttpRequest.apply(this, arguments);
        };
    });

    await page.waitForSelector('video[id]', { timeout: 2 * 60 * 1000 });

    // const videoId = await page.evaluate(
    //     (time1, time2) => {
    //         function removeAcento(text) {
    //             text = text.toLowerCase();
    //             text = text.replace(new RegExp('[ÁÀÂÃ]', 'gi'), 'a');
    //             text = text.replace(new RegExp('[ÉÈÊ]', 'gi'), 'e');
    //             text = text.replace(new RegExp('[ÍÌÎ]', 'gi'), 'i');
    //             text = text.replace(new RegExp('[ÓÒÔÕ]', 'gi'), 'o');
    //             text = text.replace(new RegExp('[ÚÙÛ]', 'gi'), 'u');
    //             text = text.replace(new RegExp('[Ç]', 'gi'), 'c');
    //             return text;
    //         }
    //         var contains = (t, f) => {
    //             t = removeAcento(t).toLowerCase();
    //             f = removeAcento(f).toLowerCase();
    //             return [t.indexOf(f) > -1, t.indexOf(f.substr(4))].some((_) => _);
    //         };
    //         var link = Array.from(document.querySelectorAll(`[data-video-title]`)).map((_) => {
    //             var title = _.attributes['data-video-title'].value;
    //             if ((contains(title, time1), contains(title, time2)))
    //                 return {
    //                     title: title,
    //                     sel: _.attributes['data-video-source'].value,
    //                 };
    //         });
    //         return link.filter((_) => !!_)[0].sel;
    //     },
    //     time1,
    //     time2
    // );

    const videoId = await page.evaluate((index)=>{
        return document.querySelector(`[data-video-source]:nth-child(${index})`).attributes['data-video-source'].value;
    }, index)

    await page.click('[data-video-title]:nth-child(1)');
    await page.waitForTimeout(2500);

    await page.click('[data-video-title]:nth-child(2)');
    await page.waitForTimeout(2500);

    await page.click(`[data-video-source="${videoId}"]`);
    await page.waitForTimeout(2500);

    var waitingReadstateVideo = null;
    while (!waitingReadstateVideo) {
        await page.waitForTimeout(1000);
        waitingReadstateVideo = await page.evaluate((videoId) => {
            if (document.querySelector('video[id]').readyState == 4) {
                if (window.m3u8.filter((_) => _.url.indexOf(`${videoId}-`) > -1).length > 0) {
                    return true;
                }
            }
            return false;
        }, videoId);
    }

    var data = await page.evaluate((videoId) => {
        return window.m3u8.filter((_) => _.url.indexOf(`${videoId}-`) > -1)[0];
    }, videoId);

    fs.writeFileSync('./a.json', JSON.stringify(data));

    const ultimoRegistro = data;
    const arquivoM3u8 = {
        url: ultimoRegistro.url,
        response: ultimoRegistro.response,
    };
    const linhasDoArquivo = arquivoM3u8.response.split('\n').filter((_) => _.indexOf('.ts') > -1);
    console.log(linhasDoArquivo);
    var x = 1;
    for (const linha of linhasDoArquivo) {
        const link = arquivoM3u8.url.split('.ism')[0] + '.ism/' + linha;
        console.log(link);
        await page.evaluate(
            (link, x) => {
                var a = document.createElement('a');
                a.style = `
                        position: fixed;
                        top: 0px;
                        left: 0px;
                        width: 100%;
                        background: #f00;
                        font-size: 26px;
                        z-index: 9999999999999;
                    `;
                a.download = `${x}.ts`;
                a.href = link;
                a.id = 'dlw';
                a.target = '_blank';
                a.innerHTML = 'DOWNLOAD';
                document.querySelector('body').append(a);
            },
            link,
            x
        );
        x++;
        await page.waitForSelector('#dlw');
        await page.click('#dlw');

        await page.evaluate(() => document.querySelector('#dlw').remove());
        await page.waitForTimeout(2500);
    }
})();
