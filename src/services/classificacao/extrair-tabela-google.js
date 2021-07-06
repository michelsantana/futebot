const pptr = require('puppeteer');
const jimp = require('jimp');
const utils = require('./../../utils');
const pastas = require('./../../gerenciador-pastas');

const url = {
    A: 'https://www.google.com/search?q=brasileirao#sie=lg;/g/11llkbvms0;2;/m/0fnk7q;st;fp;1;;',
    B: 'https://www.google.com/search?q=brasileirao#sie=lg;/g/11qqj9rdw7;2;/m/0fnkb5;st;fp;1;;'
}

module.exports = async function (uniqueId, serie) {

    this.nomeDosArquivos = {
        print: `screenshot-serie-${serie}.png`,
        cabecalho: `header-serie-${serie}.png`,
        corpo1: `corpo1-serie-${serie}.png`,
        corpo2: `corpo2-serie-${serie}.png`,
        rodape: `rodape-serie-${serie}.png`,
        tabela: `tabela-serie-${serie}.png`
    };

    this.obterArquivoPrint = () => `${pastas.obterPastaArquivosDoDia()}/${uniqueId}_${this.nomeDosArquivos.print}`;
    this.obterArquivoCabecalho = () => `${pastas.obterPastaArquivosDoDia()}/${uniqueId}_${this.nomeDosArquivos.cabecalho}`;
    this.obterArquivoCorpo1 = () => `${pastas.obterPastaArquivosDoDia()}/${uniqueId}_${this.nomeDosArquivos.corpo1}`;
    this.obterArquivoCorpo2 = () => `${pastas.obterPastaArquivosDoDia()}/${uniqueId}_${this.nomeDosArquivos.corpo2}`;
    this.obterArquivoRodape = () => `${pastas.obterPastaArquivosDoDia()}/${uniqueId}_${this.nomeDosArquivos.rodape}`;
    this.obterArquivoDaTabela = () => `${pastas.obterPastaArquivosDoDia()}/${uniqueId}_${this.nomeDosArquivos.tabela}`;

    const browser = await pptr.launch({ headless: false });
    const page = await browser.newPage();
    page.setViewport({ width: 1550, height: 5000 });

    const abrirPagina = async () => {
        try { await page.goto(url[serie.toUpperCase()], { waitUntil: 'networkidle2' }); }
        catch (e) { await page.goto(url[serie.toUpperCase()], { waitUntil: 'networkidle2' }); }
    }

    const esperarCarregar = async () => {
        await page.waitForSelector('.XUWU3c');
        await utils.sleep(1);
    }

    const tirarPrint = async () => {
        await page.screenshot({ path: this.obterArquivoPrint() });
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
            return { x: x, y: y, width: w, height: h, }
        }

        const cabecalhoDimensaoCorte = async () => {
            const primeiraLinhaClube = await page.$(`[data-unq-id="tab-1-3"] .XUWU3c table tr:nth-child(1)`);
            const d = await primeiraLinhaClube.boundingBox();
            return new Caixa(d.x, d.y, d.width, d.height);
        }

        const cabecalho = await cabecalhoDimensaoCorte();

        const rodaPeDimensaoCorte = async () => {
            const rodape = await page.$(`[data-unq-id="tab-1-3"] .cyFc6e`);
            const d = await rodape.boundingBox();
            return new Caixa(dTabela.x, d.y, dTabela.width, d.height);
        }

        const rodape = await rodaPeDimensaoCorte();


        const clubesPt1DimensaoCorte = async () => {
            const linhas = await page.evaluate(() => document.querySelectorAll('[data-unq-id="tab-1-3"] .XUWU3c table tr').length);

            const index = Math.floor(linhas / 2) + 1;
            const linhaDoMeio = await page.$(`[data-unq-id="tab-1-3"] .XUWU3c table tr:nth-child(${index})`);

            const dimensoesLinhaDoMeio = await linhaDoMeio.boundingBox();
            const h = (dimensoesLinhaDoMeio.y + dimensoesLinhaDoMeio.height) - dTabela.y - cabecalho.height;
            return new Caixa(dTabela.x, dTabela.y + cabecalho.height, dTabela.width, h);
        }

        const clubesPt1 = await clubesPt1DimensaoCorte();

        const clubesPt2DimensaoCorte = async () => {
            const linhas = await page.evaluate(() => document.querySelectorAll('[data-unq-id="tab-1-3"] .XUWU3c table tr').length);

            const index = Math.floor(linhas / 2) + 1;
            const linhaDoMeio = await page.$(`[data-unq-id="tab-1-3"] .XUWU3c table tr:nth-child(${index})`);

            const dimensoesLinhaDoMeio = await linhaDoMeio.boundingBox();
            const y = dimensoesLinhaDoMeio.y + dimensoesLinhaDoMeio.height;
            return new Caixa(dTabela.x, y, dTabela.width, dTabela.height - clubesPt1.height);
        }

        const clubesPt2 = await clubesPt2DimensaoCorte();

        await jimp.read(this.obterArquivoPrint()).then(_ => _
            .crop(cabecalho.x, cabecalho.y, cabecalho.width, cabecalho.height)
            .write(this.obterArquivoCabecalho())
        );

        await jimp.read(this.obterArquivoPrint()).then(_ => _
            .crop(clubesPt1.x, clubesPt1.y, clubesPt1.width, clubesPt1.height)
            .write(this.obterArquivoCorpo1())
        );

        await jimp.read(this.obterArquivoPrint()).then(_ => _
            .crop(clubesPt2.x, clubesPt2.y, clubesPt2.width, clubesPt2.height)
            .write(this.obterArquivoCorpo2())
        );

        await jimp.read(this.obterArquivoPrint()).then(_ => _
            .crop(rodape.x, rodape.y, rodape.width, rodape.height)
            .write(this.obterArquivoRodape())
        );
    }

    const juntarImagens = async () => {

        const cabecalho = this.obterArquivoCabecalho();
        const corpo1 = this.obterArquivoCorpo1();
        const corpo2 = this.obterArquivoCorpo2();
        const rodape = this.obterArquivoRodape();

        const imgCabecalho = await jimp.read(cabecalho);
        const imgcorpo1 = await jimp.read(corpo1);
        const imgcorpo2 = await jimp.read(corpo2);
        const imgRodape = await jimp.read(rodape);

        await imgRodape.resize(imgRodape.getWidth() * 2, jimp.AUTO);

        const dimensoes = {
            width: imgCabecalho.getWidth() * 2,
            height: imgCabecalho.getHeight() + imgcorpo1.getHeight() + imgRodape.getHeight()
        }

        const novaImagem = await jimp.read(dimensoes.width, dimensoes.height, '#f00');
        await novaImagem.write(`${this.obterArquivoDaTabela()}`);

        await jimp.read(`${this.obterArquivoDaTabela()}`).then(_ => {
            _.blit(imgCabecalho, 0, 0)
                .blit(imgCabecalho, imgCabecalho.getWidth(), 0)
                .blit(imgcorpo1, 0, imgCabecalho.getHeight())
                .blit(imgcorpo2, imgcorpo1.getWidth(), imgCabecalho.getHeight())
                .blit(imgRodape, 0, imgcorpo1.getHeight() + imgCabecalho.getHeight())
                .write(`${this.obterArquivoDaTabela()}`)
        });
    }

    await abrirPagina();
    await esperarCarregar();
    await aplicarModificacoesDeEstilo();
    await tirarPrint();
    await cortarImagem();
    await juntarImagens();
    await browser.close();

    return this;
}
