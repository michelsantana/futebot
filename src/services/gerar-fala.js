const fs = require('fs');
const pptr = require('puppeteer');
const utils = require('./../utils');
const pastas = require('./../gerenciador-pastas');

module.exports = function (uniqueId) {
    var pastaArquivo = pastas.obterPastaArquivos();
    var nomeDoArquivo = `${uniqueId}.mp3`;

    this.obterArquivoDestino = () => `${pastaArquivo}/${nomeDoArquivo}`;
    this.obterArquivoPastaDownloads = () => `${pastas.obterPastaDownloadsChrome()}/${nomeDoArquivo}`;

    var textoDiscurso = '';

    this.SalvarEm = (pasta, arquivo) => {
        utils.criarPastaSeNaoExistir(pasta);
        pastaArquivo = pasta;
        nomeDoArquivo = `${arquivo}.mp3`;
        return this;
    };

    this.DefinirDiscurso = (texto) => {
        textoDiscurso = texto;
        return this;
    };

    this.ExecutarRobo = async () => {
        var intervaloFinalizacaoDownload = null;
        var tempoMaximoIntervaloFinalizacaoDownload = 20;
        var contadorIntervaloFinalizacaoDownload = 0;

        const browser = await pptr.launch({
            headless: false,
            args: ['--use-fake-ui-for-media-stream'],
            ignoreDefaultArgs: ['--mute-audio'],
        });

        const page = await browser.newPage();

        await page.setViewport({ width: 1280, height: 720 });
        await page.goto('https://www.ibm.com/demos/live/tts-demo/self-service/home', { waitUntil: 'networkidle2' });

        await page.waitForSelector('audio');

        await page.evaluate(() => (document.querySelector('#text-area').value = ''));

        await page.type('#text-area', textoDiscurso);
        await page.waitForTimeout(720);

        await page.click('#slider');
        await page.waitForTimeout(720);

        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(720);

        await page.click('#downshift-3-toggle-button');
        await page.waitForTimeout(720);

        await page.evaluate((nomeDoArquivoDownload) => {
            let endlink = document.createElement('button');
            endlink.innerHTML = 'FinalizarForçado';
            endlink.setAttribute('class', 'dwlend');
            endlink.setAttribute('onclick', 'this.id="dwlend"');
            endlink.setAttribute('style', `position:absolute;top:150px;left:0;z-index:99999999999999;font-size:50px;background:#000;width:100%;`);
            document.body.append(endlink);

            var audio = document.querySelector('audio');
            audio.onplay = function () {
                let link = document.createElement('a');
                link.innerHTML = 'IndicadorDeInicialização';
                link.setAttribute(`href`, audio.src);
                link.setAttribute(`download`, nomeDoArquivoDownload);
                link.setAttribute('id', 'dwl');
                link.setAttribute('style', `position:absolute;top:50px;left:0;z-index:99999999999999;font-size:50px;background:#000;width:100%;`);
                document.body.append(link);
            };

            audio.onended = function () {
                let link = document.createElement('a');
                link.innerHTML = 'IndicadorDeFinalização';
                link.setAttribute(`href`, '#');
                link.setAttribute('id', 'dwlend');
                link.setAttribute('style', `position:absolute;top:100px;left:0;z-index:99999999999999;font-size:50px;background:#000;width:100%;`);
                document.body.append(link);
            };
        }, nomeDoArquivo);

        await page.click('.play-btn.bx--btn');
        await page.waitForSelector('audio[src]');

        await page.waitForSelector('#dwl', { timeout: 60000 });
        await page.click('#dwl');

        const EsperarfinalizacaoDownload = () => {
            return setTimeout(() => {
                if (fs.existsSync(obterArquivoPastaDownloads())) {
                    clearTimeout(intervaloFinalizacaoDownload);
                    page.evaluate(() => {
                        document.querySelector('.dwlend').id = 'dwlend';
                    });
                } else {
                    if (contadorIntervaloFinalizacaoDownload < tempoMaximoIntervaloFinalizacaoDownload)
                        intervaloFinalizacaoDownload = EsperarfinalizacaoDownload();
                    contadorIntervaloFinalizacaoDownload++;
                }
            }, 3000);
        };
        intervaloFinalizacaoDownload = EsperarfinalizacaoDownload();

        await page.waitForSelector('#dwlend', { timeout: 60000 * 5 }); // espera até 5 minutos

        fs.copyFileSync(obterArquivoPastaDownloads(), obterArquivoDestino());

        await page.close();
        await browser.close();
        return this;
    };

    return this;
};

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
