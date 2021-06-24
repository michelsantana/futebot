const pptr = require('puppeteer');
const jimp = require('jimp');
const utils = require('./../utils');
const pastas = require('./../gerenciador-pastas');

const nomeDosPrints = {
    print: 'screenshot.png',
    cabecalho: 'header.png',
    corpo1: 'corpo1.png',
    corpo2: 'corpo2.png',
    rodape: 'rodape.png',
};

const obterArquivoPrint = () => `${pastas.obterPastaArquivosDoDia()}${nomeDosPrints.print}`;
const obterArquivoCabecalho = () => `${pastas.obterPastaArquivosDoDia()}${nomeDosPrints.cabecalho}`;
const obterArquivoCorpo1 = () => `${pastas.obterPastaArquivosDoDia()}${nomeDosPrints.corpo1}`;
const obterArquivoCorpo2 = () => `${pastas.obterPastaArquivosDoDia()}${nomeDosPrints.corpo2}`;
const obterArquivoRodape = () => `${pastas.obterPastaArquivosDoDia()}${nomeDosPrints.rodape}`;

const url = 'https://www.google.com/search?q=brasileirao#sie=lg;/g/11llkbvms0;2;/m/0fnk7q;st;fp;1;;';

async function Executar() {

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
        await page.screenshot({ path: obterArquivoPrint() });
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


        jimp.read(obterArquivoPrint()).then(_ => _
            .crop(cabecalho.x, cabecalho.y, cabecalho.width, cabecalho.height)
            .write(obterArquivoCabecalho())
        );

        jimp.read(obterArquivoPrint()).then(_ => _
            .crop(clubesPt1.x, clubesPt1.y, clubesPt1.width, clubesPt1.height)
            .write(obterArquivoCorpo1())
        );

        jimp.read(obterArquivoPrint()).then(_ => _
            .crop(clubesPt2.x, clubesPt2.y, clubesPt2.width, clubesPt2.height)
            .write(obterArquivoCorpo2())
        );

        jimp.read(obterArquivoPrint()).then(_ => _
            .crop(rodape.x, rodape.y, rodape.width, rodape.height)
            .write(obterArquivoRodape())
        );

        //utils.cortarImagem(caminhoDoArquivo, [dimensoes], 0);
        arquivosGerados = {
            print: obterArquivoPrint(),
            cabecalho: obterArquivoCabecalho(),
            corpo1: obterArquivoCorpo1(),
            corpo2: obterArquivoCorpo2(),
            rodape: obterArquivoRodape(),
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
