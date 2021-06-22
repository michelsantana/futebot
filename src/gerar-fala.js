const fs = require('fs');
const path = require('path');
const moment = require('moment');
const pptr = require('puppeteer');
const utils = require('./utils');
require('dotenv').config();

const caminhoPastaDownloadPadraoChromium = process.env.caminhoPastaDownloadPadraoChromium || '%USERPROFILE%/Downloads/';

const caminhoPastaSaidaDosArquivos = process.env.caminhoPastaSaidaDosArquivos || './archive/'

const obterPasta = () => {
    const hoje = moment().format('yyyyMMDD');
    return `${caminhoPastaSaidaDosArquivos}${hoje}/`;
}

const obterNomeArquivoAudioSemExtensao = () => {
    const hoje = moment().format('yyyyMMDD');
    return `IBM_AUDIO_${hoje}`;
}

const obterNomeArquivoAudio = () => `${obterNomeArquivoAudioSemExtensao()}.mp3`;

const obterCaminhoArquivoAudio = () => `${obterPasta()}${obterNomeArquivoAudio()}`;

async function EsperarfinalizacaoDownload() {

    await utils.sleep(10);
    const quantidadeTentativasMaxima = 10;
    let result = false;
    let tentativaAtual = 1;
    while (tentativaAtual++ < quantidadeTentativasMaxima) {
        let arquivos = fs.readdirSync(caminhoPastaDownloadPadraoChromium);

        try {
            for (var a of arquivos) {
                if (a == obterNomeArquivoAudio() || a == obterNomeArquivoAudioSemExtensao()) {
                    if (path.extname(a) == '.mp3' || path.extname(a) == 'mp3') {
                        tentativaAtual = 99;
                        result = true;
                        fs.copyFileSync(`${caminhoPastaDownloadPadraoChromium}${a}`, `${obterCaminhoArquivoAudio()}`);
                        break;
                    }
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

async function GerarFala(arquivoDadosTabela) {
    //const browser = await pptr.launch({ });
    const scriptFala = await GerarTexto(arquivoDadosTabela);

    const browser = await pptr.launch({
        headless: false,
        args: [
            '--use-fake-ui-for-media-stream',
        ],
        ignoreDefaultArgs: ['--mute-audio'],
    });

    const page = await browser.newPage();
    //await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: 'D:/Git/tools/text-to-speech/archive'});
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

        audio.onended = function(){
            let link = document.createElement('a');
            link.innerHTML = 'IndicadorDeFinalização';
            link.setAttribute(`href`, '#');
            link.setAttribute('id', 'dwlend');
            link.setAttribute('style', `position:absolute;top:100px;left:0;z-index:99999999999999;font-size:50px;background:#000;width:100%;`);
            document.body.append(link);
        }

    }, obterNomeArquivoAudio());

    await page.click('.play-btn.bx--btn');
    await page.waitForSelector('audio[src]');

    await page.waitForSelector('#dwl', { timeout: 60000 });
    await page.click('#dwl');

    await page.waitForSelector('#dwlend', { timeout: 60000 * 5 }); // espera até 5 minutos

    const downloadConcluidoComSucesso = await EsperarfinalizacaoDownload();
    await page.close();
    await browser.close();

    return { arquivoAudio: `${obterPasta()}${obterNomeArquivoAudio()}`, arquivoBaixado: obterCaminhoArquivoAudio(), arquivoGerado: downloadConcluidoComSucesso }
}

async function GerarTexto(arquivo) {
    const mensagem = [];

    function Classificacao({ classificacao, time, variacao, pontos, jogos, vitorias, empates, derrotas, golPro, golContra, saldoGols, percentual, ultimosJogo }) {
        return {
            classificacao: classificacao, time: time, variacao: variacao, pontos: pontos, jogos: jogos, vitorias: vitorias, empates: empates,
            derrotas: derrotas, golPro: golPro, golContra: golContra, saldoGols: saldoGols, percentual: percentual, ultimosJogo: ultimosJogo
        }
    }

    function add(m) {
        mensagem.push(m)
    }

    function traduzirMomeTime(time) {
        var nome = time;
        if (time.indexOf('-') > -1) {
            var textoCortado = time.split('-');
            nome = textoCortado[0].trim();

            switch (textoCortado[1]) {
                case 'MG': nome += ` Mineiro`; break;
                case 'PR': nome += ` Paranaense`; break;
                case 'GO': nome += ` Goianiense`; break;
                case 'SC': nome += ` `; break;
            }
        }
        return nome;
    }

    add(`Fala torcedôr e torcedôra: Como vocês estão? Espero que estejam todos bem: `);
    add(`Vamos ver a classificação do Brasileirão 2021 série "Ahh": `);
    add(`Lembrando que essa é, a classificação no dia de hoje, ${moment().locale("pt-BR").format('DD [de] MMMM [de] YYYY')}: `);
    add(`Vamos la: `);

    let lstClassificacoes = [];
    const json = JSON.parse(fs.readFileSync(arquivo));
    json.forEach(_ => lstClassificacoes.push(new Classificacao(_)));
    add('Ô ')
    lstClassificacoes.forEach(_ => {
        var c = Classificacao(_);
        add(`${c.classificacao}º colocado é, ${traduzirMomeTime(c.time)}, com ${c.pontos} pontos, em ${c.jogos} jogos: `);

        if (~~c.classificacao == 10) {
            add('Meus parças, me ajudem a continuar com o canal: Deixa aquela deedáda no laique pra fortalecer e se inscrévi no canal: trarei novidades em breve: Então: Continuando: Ô ');
        }
    });

    add('Gostaria de agradecer a todos que assistiram até aqui: Muitíssimo obrigado: tenham uma ótima semana:');
    const mensagemResolvida = mensagem.join('');
    fs.writeFileSync(`${obterPasta()}texto.txt`, mensagemResolvida);
    return mensagemResolvida;
}

//console.log(await GerarTexto(`./archive/20210618/20210618080330.json`));
//await GerarFala(`./archive/20210618/20210618080330.json`)

async function Executar(arquivoJson) {
    return await GerarFala(arquivoJson);
}

module.exports = {
    Executar,
    GerarTexto,
    EsperarfinalizacaoDownload
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