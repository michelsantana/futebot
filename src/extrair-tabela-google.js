const pptr = require('puppeteer');
const jimp = require('jimp');
const moment = require('moment');
const utils = require('./utils');
require('dotenv').config();

const caminhoPastaSaidaDosArquivos = process.env.caminhoPastaSaidaDosArquivos || './archive/'
const nomeDosPrints = {
    print: 'screenshot.png',
    cabecalho: 'header.png',
    corpo1: 'corpo1.png',
    corpo2: 'corpo2.png',
    rodape: 'rodape.png',
};

const obterPasta = () => `${caminhoPastaSaidaDosArquivos}${moment().format('yyyyMMDD')}/`;
const obterNomeArquivoPrint = () => `${obterPasta()}${nomeDosPrints.print}`;
const obterNomeArquivoCabecalho = () => `${obterPasta()}${nomeDosPrints.cabecalho}`;
const obterNomeArquivoCorpo1 = () => `${obterPasta()}${nomeDosPrints.corpo1}`;
const obterNomeArquivoCorpo2 = () => `${obterPasta()}${nomeDosPrints.corpo2}`;
const obterNomeArquivoRodape = () => `${obterPasta()}${nomeDosPrints.rodape}`;

const url = 'https://www.google.com/search?q=brasileirao#sie=lg;/g/11llkbvms0;2;/m/0fnk7q;st;fp;1;;';

async function Executar() {

    utils.criarPastaSeNaoExistir(obterPasta());

    const browser = await pptr.launch({ headless: false });
    const page = await browser.newPage();
    page.setViewport({ width: 1550, height: 5000 });

    const abrirPagina = async () => {
        try { await page.goto(url, { waitUntil: 'networkidle2' }); }
        catch (e) { await page.goto(url, { waitUntil: 'networkidle2' }); }
    }

    const esperarCarregar = async () => {
        await page.waitForSelector('.XUWU3c');
        await utils.sleep(1);
    }

    const tirarPrint = async () => {
        await page.screenshot({ path: obterNomeArquivoPrint() });
    }

    const aplicarModificacoesDeEstilo = async () => {

        await page.evaluate(() => {
            const css =
                `
                .XUWU3c table tr:nth-child(1) th {
                    padding: 10px !important;
                }
                
                .XUWU3c table td {
                    font-size: 21px !important;
                    font-weight: 700 !important;
                }
                
                .ellipsisize {
                    width: 100%
                }

                .tcwpB {
                    width: auto !important;
                }`;
            const style = document.createElement('style');
            style.innerHTML = css;
            document.body.append(style);
        });
        await utils.sleep(1);
    }

    const cortarImagem = async () => {

        await page.evaluate(() => window.scrollTo(0, 0));
        const card = await page.$('[data-unq-id="tab-1-3"] .XUWU3c table');
        const dTabela = await card.boundingBox();

        function Caixa(x, y, w, h) {
            return {
                x: x,
                y: y,
                width: w,
                height: h,
            }
        }

        const cabecalhoDimensaoCorte = async () => {
            const primeiraLinhaClube = await page.$(`[data-unq-id="tab-1-3"] .XUWU3c table tr:nth-child(1)`);
            const d = await primeiraLinhaClube.boundingBox();
            return new Caixa(
                d.x,
                d.y,
                d.width,
                d.height
            )
        }

        const cabecalho = await cabecalhoDimensaoCorte();

        const rodaPeDimensaoCorte = async () => {
            const rodape = await page.$(`[data-unq-id="tab-1-3"] .cyFc6e`);
            const d = await rodape.boundingBox();
            return new Caixa(
                dTabela.x,
                d.y,
                dTabela.width,
                d.height
            )
        }

        const rodape = await rodaPeDimensaoCorte();


        const clubesPt1DimensaoCorte = async () => {
            const linhas = await page.evaluate(() => document.querySelectorAll('[data-unq-id="tab-1-3"] .XUWU3c table tr').length);

            const index = Math.floor(linhas / 2) + 1;
            const linhaDoMeio = await page.$(`[data-unq-id="tab-1-3"] .XUWU3c table tr:nth-child(${index})`);

            const dimensoesLinhaDoMeio = await linhaDoMeio.boundingBox();

            return new Caixa(
                dTabela.x,
                dTabela.y + cabecalho.height,
                dTabela.width,
                (dimensoesLinhaDoMeio.y + dimensoesLinhaDoMeio.height) - dTabela.y - cabecalho.height,
            );
        }

        const clubesPt1 = await clubesPt1DimensaoCorte();

        const clubesPt2DimensaoCorte = async () => {
            const linhas = await page.evaluate(() => document.querySelectorAll('[data-unq-id="tab-1-3"] .XUWU3c table tr').length);

            const index = Math.floor(linhas / 2) + 1;
            const linhaDoMeio = await page.$(`[data-unq-id="tab-1-3"] .XUWU3c table tr:nth-child(${index})`);

            const dimensoesLinhaDoMeio = await linhaDoMeio.boundingBox();

            return new Caixa(
                dTabela.x,
                dimensoesLinhaDoMeio.y + dimensoesLinhaDoMeio.height,
                dTabela.width,
                dTabela.height - clubesPt1.height
            );
        }

        const clubesPt2 = await clubesPt2DimensaoCorte();


        jimp.read(obterNomeArquivoPrint()).then(_ => _
            .crop(cabecalho.x, cabecalho.y, cabecalho.width, cabecalho.height)
            .write(obterNomeArquivoCabecalho())
        );

        jimp.read(obterNomeArquivoPrint()).then(_ => _
            .crop(clubesPt1.x, clubesPt1.y, clubesPt1.width, clubesPt1.height)
            .write(obterNomeArquivoCorpo1())
        );

        jimp.read(obterNomeArquivoPrint()).then(_ => _
            .crop(clubesPt2.x, clubesPt2.y, clubesPt2.width, clubesPt2.height)
            .write(obterNomeArquivoCorpo2())
        );

        jimp.read(obterNomeArquivoPrint()).then(_ => _
            .crop(rodape.x, rodape.y, rodape.width, rodape.height)
            .write(obterNomeArquivoRodape())
        );

        //utils.cortarImagem(caminhoDoArquivo, [dimensoes], 0);
        arquivosGerados = {
            print: obterNomeArquivoPrint(),
            cabecalho: obterNomeArquivoCabecalho(),
            corpo1: obterNomeArquivoCorpo1(),
            corpo2: obterNomeArquivoCorpo2(),
            rodape: obterNomeArquivoRodape(),
        }
    }

    await abrirPagina();
    await esperarCarregar();
    await aplicarModificacoesDeEstilo();
    await tirarPrint();
    await cortarImagem();
    await browser.close();

    return { arquivos: arquivosGerados };
}

module.exports = { Executar }
