// const pptr = require('puppeteer');
// const pastas = require('./gerenciador-pastas');
// const utils = require('./utils');
// const axios = require('axios').default;
// const $c = require('cheerio');
// const fs = require('fs');

// var url = 'https://ge.globo.com/futebol/brasileirao-serie-a/playlist/veja-lances-e-gols-da-14-rodada-do-brasileirao-2021.ghtml';
// (async () => {
//     const fases = [2];

//     if (fases.indexOf(1) > -1) {
//         var browser = await pptr.launch({
//             executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
//             headless: false,
//             defaultViewport: null,
//             devtools: true,
//             //args: ['--window-size=1920,1170','--window-position=0,0']
//             args: ['--window-size=1920,1080', '--window-position=720,50'],
//         });
//         var page = await browser.newPage();
//         await page.goto(url);
//         await page.evaluate(() => {
//             window.__INJ__ = [];
//             window.__RES__ = [];
//             let baseXmlHttpRequest = window.XMLHttpRequest.prototype.open;
//             window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
//                 this.addEventListener('load', function () {
//                     if (url.indexOf('.ts') > -1) window.__INJ__.push(url);
//                     window.__RES__.push(url);
//                 });
//                 return baseXmlHttpRequest.apply(this, arguments);
//             };
//         });

//         await page.waitForSelector('video');

//         await page.waitForTimeout(5000);

//         await page.evaluate(() => {
//             var getVideo = () => document.querySelectorAll('video');
//             var exit = () => {
//                 var span = document.createElement('span');
//                 span.id = '__end__';
//                 document.querySelector('body').append(span);
//             };
//             const InsertPlayStop = () => {
//                 for (const vd of getVideo()) {
//                     vd.onplay = function () {
//                         console.log('===================================================== video playing', vd.src);
//                     };
//                     vd.onended = function () {
//                         console.log('===================================================== video ended. Duration: ', vd.duration);
//                         if (vd.duration > 120) {
//                             exit();
//                         }
//                     };
//                 }
//             };

//             const RemoverExcedentes = () => {
//                 getVideo().forEach((_) => {
//                     if (!_.id) _.remove();
//                 });
//             };

//             RemoverExcedentes();
//             InsertPlayStop();

//             document.addEventListener('DOMNodeInserted', function (event) {
//                 if (event.relatedNode.id == 'wp3-player-1') {
//                     console.log('===================================================== video inserted');
//                     RemoverExcedentes();
//                     InsertPlayStop();
//                 }
//             });
//         });

//         var waitingReadstateVideo = null;
//         while (!waitingReadstateVideo) {
//             console.log('waiting', waitingReadstateVideo);

//             waitingReadstateVideo = await page.evaluate(() => {
//                 var getVideo = () => document.querySelectorAll('video');
//                 const RemoverExcedentes = () => {
//                     getVideo().forEach((_) => {
//                         if (!_.id) _.remove();
//                     });
//                 };
//                 RemoverExcedentes();
//                 if (getVideo()[0].readyState == 4) {
//                     console.log('===================================================== Ohh yeah, pause the video!');
//                     getVideo()[0].pause();
//                     setTimeout(() => getVideo()[0].play(), 3000);
//                     return true;
//                 }
//                 return null;
//             });
//         }

//         await page.waitForSelector('#__end__', { timeout: 1000 * 120 });
//         var data = await page.evaluate(() => {
//             return {
//                 inj: window.__INJ__,
//                 res: window.__RES__,
//             };
//         });

//         try {
//             fs.writeFileSync('./a.json', JSON.stringify(data));
//         } catch (ex) {
//             fs.writeFileSync('./a.json', data);
//         }

//         await browser.close();
//     }

//     var linksTS = [];
//     var links = JSON.parse(fs.readFileSync('./a.json').toString());
//     links.inj.forEach((_) => linksTS.push(_));
//     if (linksTS.length > 0) {
//         const range = linksTS.map((_) => {
//             const splited = _.split('-');
//             return splited[splited.length - 1].replace('.ts', '');
//         });

//         var ultimoVideo = range.sort((a, b) => ~~b - ~~a)[0];

//         for (var x = 0; x <= ~~ultimoVideo; x++) {
//             var link = linksTS[linksTS.length - 1].replace(`-${ultimoVideo}.ts`, `-${x}.ts`);

//             await page.evaluate((link) => {
//                 document.querySelector('#dlw').remove();
//                 var a = document.createElement('a');
//                 a.style = `
//                     position: fixed;
//                     top: 0px;
//                     left: 0px;
//                     width: 100%;
//                     background: #f00;
//                     font-size: 26px;
//                     z-index: 9999999999999;
//                 `;
//                 a.download = 'download';
//                 a.href = link;
//                 a.id = 'dlw';
//                 a.target = '_blank';
//                 a.innerHTML = 'DOWNLOAD';
//                 document.querySelector('body').append(a);
//             }, link);

//             await page.waitForSelector('#dlw');
//             await page.click('#dwl');
//             await page.evaluate(() => document.querySelector('#dlw').remove());
//         }
//     }
// })();
