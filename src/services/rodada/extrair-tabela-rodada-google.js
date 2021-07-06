const pptr = require('puppeteer');
const jimp = require('jimp');
const utils = require('./../../utils');
const pastas = require('./../../gerenciador-pastas');

const url = {
    A: 'https://www.google.com/search?q=brasileirao#sie=lg;/g/11llkbvms0;2;/m/0fnk7q;mt;fp;1;;',
    B: 'https://www.google.com/search?q=brasileirao#sie=lg;/g/11qqj9rdw7;2;/m/0fnkb5;mt;fp;1;;'
};

module.exports = async function (uniqueId, serie, numeroDaRodada) {

    this.obterArquivoDaTabela = () => `${pastas.obterPastaArquivosDoDia()}/${uniqueId}_tabela-rodada.png`;

    const browser = await pptr.launch({ headless: false });
    const page = await browser.newPage();
    page.setViewport({ width: 1550, height: 5000 });

    const abrirPagina = async () => {
        try { await page.goto(url[serie], { waitUntil: 'networkidle2' }); }
        catch (e) { await page.goto(url[serie], { waitUntil: 'networkidle2' }); }
    }

    const esperarCarregar = async () => {
        await page.waitForSelector('.OcbAbf');
        await utils.sleep(1);
    }

    const tirarPrint = async () => {
        await page.screenshot({ path: this.obterArquivoDaTabela() });
    }

    const aplicarModificacoesDeEstilo = async () => {

        await page.evaluate(() => {
            const css =
                `.OcbAbf .GVj7ae {
                        font-size: 20px !important;
                        font-weight: 900;
                    }
                    
                    .OcbAbf table {
                        font-size: 20px !important;
                        font-weight: 900; !important;
                    }
                    
                    .OcbAbf table * {
                        font-weight: 900; !important;
                    }
                    
                    .OcbAbf table .BbrjBe {
                        display: none; !important;
                    }`;
            const style = document.createElement('style');
            style.innerHTML = css;
            document.body.append(style);
        });

        await utils.sleep(1);
    }

    const cortarImagem = async () => {

        await page.evaluate(() => window.scrollTo(0, 0));

        function Caixa(x, y, w, h) {
            return { x: x, y: y, width: w, height: h, }
        }

        let card = await page.evaluate((r) => {
            const y = Array.from(document.querySelectorAll('.OcbAbf')).find(_ => {
                if (Array.from(_.children).find(el => el.textContent.indexOf(`Rodada ${r}`) > -1))
                    return _;
            });
            return JSON.stringify(y.getBoundingClientRect());
        }, numeroDaRodada);
        card = JSON.parse(card);

        const cardBound = new Caixa(card.x, card.y, card.width, card.height);

        let arquivo = await jimp.read(this.obterArquivoDaTabela());
        arquivo = await arquivo
            .crop(cardBound.x, cardBound.y, cardBound.width, cardBound.height)
            .write(this.obterArquivoDaTabela());

    }

    await abrirPagina();
    await esperarCarregar();
    await aplicarModificacoesDeEstilo();
    await tirarPrint();
    await cortarImagem();
    await browser.close();

    return this;
}
