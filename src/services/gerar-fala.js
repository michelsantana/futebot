const path = require('path');
const fs = require('fs');
const pptr = require('puppeteer');
const moment = require('moment');
const utils = require('./../utils');
const pastas = require('./../gerenciador-pastas');

module.exports = async function (uniqueId) {

    this.obterNomeArquivoAudioSemExtensao = () => `${uniqueId}_IBM_AUDIO`;
    this.obterNomeArquivoAudio = () => `${this.obterNomeArquivoAudioSemExtensao()}.mp3`;
    this.obterArquivoDeAudio = () => `${pastas.obterPastaArquivosDoDia()}/${this.obterNomeArquivoAudio()}`;
    this.obterArquivoDeAudioBaixado = () => `${pastas.obterPastaDownloadsChrome()}/${this.obterNomeArquivoAudio()}`;
    this.obterPastaDeDownloads = () => pastas.obterPastaDownloadsChrome();


    this.gerarArquivoDeAudio = async (arquivoDoDiscurso) => {
        const EsperarfinalizacaoDownload = async () => {

            await utils.sleep(1);
            const quantidadeTentativasMaxima = 10;
            let result = false;
            let tentativaAtual = 1;
            while (tentativaAtual++ < quantidadeTentativasMaxima) {
                let arquivos = fs.readdirSync(this.obterPastaDeDownloads());

                try {
                    for (var a of arquivos) {
                        if (a == this.obterNomeArquivoAudio()) {
                            tentativaAtual = 99;
                            result = true;
                            fs.copyFileSync(`${this.obterArquivoDeAudioBaixado()}`, `${this.obterArquivoDeAudio()}`);
                            break;
                        }
                    }
                } catch (e) {
                    console.log(e, tentativaAtual);
                }
                if (result) break;
                await utils.sleep(tentativaAtual);
            }

            return result;
        }

        if (fs.existsSync(this.obterArquivoDeAudio())) return this;

        if (fs.existsSync(this.obterArquivoDeAudioBaixado())) {
            await EsperarfinalizacaoDownload();
            return this;
        }

        const scriptFala = fs.readFileSync(arquivoDoDiscurso).toString();

        const browser = await pptr.launch({
            headless: false,
            args: ['--use-fake-ui-for-media-stream'],
            ignoreDefaultArgs: ['--mute-audio'],
        });

        const page = await browser.newPage();

        await page.setViewport({ width: 1280, height: 720 });
        await page.goto('https://www.ibm.com/demos/live/tts-demo/self-service/home', { waitUntil: 'networkidle2' });

        await page.waitForSelector('audio');

        await page.evaluate(() => document.querySelector('#text-area').value = '');

        await page.type('#text-area', scriptFala);
        await page.waitForTimeout(720);

        await page.click('#slider');
        await page.waitForTimeout(720);
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(720);
        await page.keyboard.press('ArrowLeft');

        await page.click('#downshift-3-toggle-button');
        await page.waitForTimeout(720);

        await page.evaluate((nomeDoArquivoDownload) => {

            var audio = document.querySelector('audio');
            audio.onplay = function () {

                let link = document.createElement('a');
                link.innerHTML = 'IndicadorDeInicialização';
                link.setAttribute(`href`, audio.src);
                link.setAttribute(`download`, nomeDoArquivoDownload);
                link.setAttribute('id', 'dwl');
                link.setAttribute('style', `position:absolute;top:50px;left:0;z-index:99999999999999;font-size:50px;background:#000;width:100%;`);
                document.body.append(link);
            }

            audio.onended = function () {
                let link = document.createElement('a');
                link.innerHTML = 'IndicadorDeFinalização';
                link.setAttribute(`href`, '#');
                link.setAttribute('id', 'dwlend');
                link.setAttribute('style', `position:absolute;top:100px;left:0;z-index:99999999999999;font-size:50px;background:#000;width:100%;`);
                document.body.append(link);
            }

        }, this.obterNomeArquivoAudio());

        await page.click('.play-btn.bx--btn');
        await page.waitForSelector('audio[src]');

        await page.waitForSelector('#dwl', { timeout: 60000 });
        await page.click('#dwl');

        await page.waitForSelector('#dwlend', { timeout: 60000 * 5 }); // espera até 5 minutos

        await EsperarfinalizacaoDownload();

        await page.close();
        await browser.close();
        return this;
    }

    return this;
}

/*

function descricaoColocacao(n) {
            switch (~~n) {
                case 1 : return 'primeiro';
                case 2 : return 'segundo';
                case 3 : return 'terceiro';
                case 4 : return 'quarto';
                case 5 : return 'quinto';
                case 6 : return 'sexto';
                case 7 : return 'primeiro';
                case 8 : return 'primeiro';
                case 9 : return 'primeiro';
                case 10 : return 'primeiro';
                case 11 : return 'primeiro';
                case 12 : return 'primeiro';
                case 13 : return 'primeiro';
                case 14 : return 'primeiro';
                case 15 : return 'primeiro';
                case 16 : return 'primeiro';
                case 17 : return 'primeiro';
                case 18 : return 'primeiro';
                case 19 : return 'primeiro';
                case 20 : return 'primeiro';
            }
        }
*/