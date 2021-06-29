const jimp = require('jimp');
const utils = require('./../utils');
const pastas = require('./../gerenciador-pastas');
const moment = require('moment');


module.exports = async function (arquivoDoPost, textoLinha1, textoLinha2, textoBaixo) {

    const fonts = {
        'p': await jimp.loadFont(jimp.FONT_SANS_32_BLACK),
        'm': await jimp.loadFont(jimp.FONT_SANS_64_BLACK),
        'g': await jimp.loadFont(jimp.FONT_SANS_128_BLACK),
    };

    const cardSize = {
        w: 1920,
        h: 1080,
    };

    const textoCreditosDaImagem = 'Tabela extraída de Google.com';

    this.obterArquivoPlanosDeFundoAleatorio = () => `${pastas.obterPastaDeRecursos()}/bg-${utils.aleatorio(1, 7)}.png`;
    this.obterArquivoLogo = () => `${pastas.obterPastaDeRecursos()}/logo-1.png`;
    this.obterArquivoPostagem = () => arquivoDoPost;

    const tratativaTextoPadrao = async (jimpObject, cor) => {
        return await jimpObject
            .color([{ apply: 'xor', params: [cor || '#F00'] }])
            .shadow({ opacity: 1, size: 1, blur: 1, x: 1, y: 1 })
            .shadow({ opacity: 1, size: 1, blur: 1, x: -1, y: -1 });
    }

    const obterMarcaDagua = async () => {

        const creditosConfig = { text: textoCreditosDaImagem, alignmentX: jimp.HORIZONTAL_ALIGN_RIGHT, alignmentY: jimp.VERTICAL_ALIGN_BOTTOM };

        let wm = await jimp.read(cardSize.w, cardSize.h, '#ffffff00');
        wm = await wm.print(fonts.p, 0, 0, creditosConfig, cardSize.w, cardSize.h);
        wm = await tratativaTextoPadrao(wm);

        let logo = await jimp.read(`${this.obterArquivoLogo()}`);
        let bgLogo = await jimp.read(cardSize.w, cardSize.h, '#ffffff00');
        bgLogo = await bgLogo
            .blit(logo, (cardSize.w / 2) - (logo.getWidth() / 2), (cardSize.h / 2) - (logo.getHeight() / 2))
            .opacity(.2)
            .blit(wm, 0, 0);
        return bgLogo;
    }

    const obterTarja = async () => {

        const textHeight = jimp.measureTextHeight(await fonts.m, textoLinha1, cardSize.w);
        const axC = jimp.HORIZONTAL_ALIGN_CENTER;
        const ayT = jimp.VERTICAL_ALIGN_TOP;
        const ayB = jimp.VERTICAL_ALIGN_BOTTOM;

        const printConfig = (text, ax, ay) => {
            return { text: text, alignmentX: ax, alignmentY: ay };
        }

        let tarjaSuperior = await jimp.read(cardSize.w, cardSize.h, '#ffffff00');
        tarjaSuperior = await tarjaSuperior
            .print(fonts.m, 0, 0, printConfig(textoLinha1, axC, ayT), cardSize.w, cardSize.h)
            .print(fonts.g, 0, textHeight, printConfig(textoLinha2, axC, ayT), cardSize.w, cardSize.h);

        tarjaSuperior = await tratativaTextoPadrao(tarjaSuperior);

        let tarjaInferior = await jimp.read(cardSize.w, cardSize.h, '#ffffff00');
        tarjaInferior = await tarjaInferior
            .print(fonts.g, 0, 0, printConfig(textoBaixo, axC, ayB), cardSize.w, cardSize.h)

        tarjaInferior = await tratativaTextoPadrao(tarjaInferior);

        return await tarjaSuperior.blit(tarjaInferior, 0, 0);
    }

    const tableWidth = 1280;
    const tableHeight = 720;

    const jimpImagem = await jimp.read(`${this.obterArquivoPlanosDeFundoAleatorio()}`);
    const jimpTabela = await jimp.read(`${this.obterArquivoPostagem()}`);

    while (jimpImagem.getWidth() < cardSize.w || jimpImagem.getHeight() < cardSize.h) jimpImagem.resize(jimpImagem.getWidth() + 100, jimp.AUTO);
    while (jimpTabela.getWidth() < tableWidth && jimpTabela.getHeight() < tableHeight) jimpTabela.resize(jimpTabela.getWidth() + 100, jimp.AUTO);

    const espacoHorizontal = (jimpImagem.getWidth() - cardSize.w) / 2;
    const espacoVertical = (jimpImagem.getHeight() - cardSize.h) / 2;

    await jimpImagem
        .crop(espacoHorizontal, espacoVertical, cardSize.w, cardSize.h)
        .blur(30)
        .blit(jimpTabela, (cardSize.w / 2) - (jimpTabela.getWidth() / 2), (cardSize.h / 2) - (jimpTabela.getHeight() / 2));

    const marcaDagua = await obterMarcaDagua();
    const tarja = await obterTarja();
    await jimpImagem
        .blit(marcaDagua, 0, 0)
        .blit(tarja, 0, 0)
        .write(`${this.obterArquivoPostagem()}`);

    return this;
}



/*

async function GerarTabelaDeRodada(arquivoPrintDaRodada) {

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
    await novaImagem.write(`${obterArquivoPostagem()}`);

    await jimp.read(`${obterArquivoPostagem()}`).then(_ => {
        _.blit(imgCabecalho, 0, 0)
            .blit(imgCabecalho, imgCabecalho.getWidth(), 0)
            .blit(imgcorpo1, 0, imgCabecalho.getHeight())
            .blit(imgcorpo2, imgcorpo1.getWidth(), imgCabecalho.getHeight())
            .blit(imgRodape, 0, imgcorpo1.getHeight() + imgCabecalho.getHeight())
            .write(`${obterArquivoPostagem()}`)
    });
}





const GerarMarcaDagua = async () => {

    let wm = await jimp.read(cardSize.w, cardSize.h, '#ffffff00');
    await wm.print(await fonts(32), 0, 0,
        { text: 'Tabela extraída de Google.com', alignmentX: jimp.HORIZONTAL_ALIGN_RIGHT, alignmentY: jimp.VERTICAL_ALIGN_BOTTOM },
        cardSize.w, cardSize.h);
    wm = await tratativaTextoPadrao(wm);

    let logoBg = await jimp.read(cardSize.w, cardSize.h, '#ffffff00');
    let logo = await jimp.read(`${obterArquivoLogo()}`);

    await logoBg.blit(logo, (logoBg.getWidth() / 2) - (logo.getWidth() / 2), (logoBg.getHeight() / 2) - (logo.getHeight() / 2))
        .opacity(.2);

    return await logoBg.blit(wm, 0, 0);
}

const tratativaTextoPadrao = async (jimpObject, cor) => {
    return await jimpObject
        .color([{ apply: 'xor', params: [cor || '#F00'] }])
        .shadow({ opacity: 1, size: 1, blur: 1, x: 1, y: 1 })
        .shadow({ opacity: 1, size: 1, blur: 1, x: -1, y: -1 });
}

const GerarTarjaThumbnailClassificacao = async () => {
    const textHeight = jimp.measureTextHeight(await fonts(64), 'Classificação', cardSize.w);
    let tarja = await jimp.read(cardSize.w, cardSize.h, '#ffffff00');
    await tarja
        .print(await fonts(64), 0, 0,
            { text: 'Classificação', alignmentX: jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: jimp.VERTICAL_ALIGN_TOP },
            cardSize.w, cardSize.h)
        .print(await fonts(128), 0, textHeight,
            { text: 'Brasileirão Série A', alignmentX: jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: jimp.VERTICAL_ALIGN_TOP },
            cardSize.w, cardSize.h);
    tarja = await tratativaTextoPadrao(tarja);

    let tarja2 = await jimp.read(cardSize.w, cardSize.h, '#ffffff00');
    await tarja2
        .print(await fonts(128), 0, 0,
            { text: moment().format('DD/MM/YYYY'), alignmentX: jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: jimp.VERTICAL_ALIGN_BOTTOM },
            cardSize.w, cardSize.h)
    tarja2 = await tratativaTextoPadrao(tarja2);


    tarja = await tarja.blit(tarja2, 0, 0);
    return tarja;
}


const GerarTarjaThumbnailRodada = async (numeroDaRodada) => {
    const textHeight = jimp.measureTextHeight(await fonts(64), 'Jogos', cardSize.w);
    let tarja = await jimp.read(cardSize.w, cardSize.h, '#ffffff00');
    await tarja
        .print(await fonts(64), 0, 0,
            { text: 'Jogos', alignmentX: jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: jimp.VERTICAL_ALIGN_TOP },
            cardSize.w, cardSize.h)
        .print(await fonts(128), 0, textHeight,
            { text: 'Rodada ' + numeroDaRodada, alignmentX: jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: jimp.VERTICAL_ALIGN_TOP },
            cardSize.w, cardSize.h)
        .color([{ apply: 'xor', params: ['#F00'] }])
        .shadow({ opacity: 1, size: 1, blur: 1, x: 1, y: 1 })
        .shadow({ opacity: 1, size: 1, blur: 1, x: -1, y: -1 });

    let tarja2 = await jimp.read(cardSize.w, cardSize.h, '#ffffff00');
    await tarja2
        .print(await fonts(128), 0, 0,
            { text: moment().format('DD/MM/YYYY'), alignmentX: jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: jimp.VERTICAL_ALIGN_BOTTOM },
            cardSize.w, cardSize.h)
        .color([{ apply: 'xor', params: ['#F00'] }])
        .shadow({ opacity: 1, size: 1, blur: 1, x: 1, y: 1 })
        .shadow({ opacity: 1, size: 1, blur: 1, x: -1, y: -1 });

    tarja = await tarja.blit(tarja2, 0, 0);
    return tarja;
}


async function GerarPlanoDeFundo(tarjasEMarcas) {



}

async function GerarTabelaDoBrasileiraoSerieA({ cabecalho, corpo1, corpo2, rodape }) {
    await GerarTabelaDeClassificacao({ cabecalho, corpo1, corpo2, rodape });

    const marcaDagua = await GerarMarcaDagua();
    const tarja = await GerarTarjaThumbnailClassificacao();

    await GerarPlanoDeFundo([marcaDagua, tarja]);

    return obterArquivoPostagem();
}

async function GerarTabelaRodada(arquivoTabela, numeroDaRodada) {
    await GerarTabela({ cabecalho, corpo1, corpo2, rodape });
    const marcaDagua = await GerarMarcaDagua();
    const tarja = await GerarTarjaThumbnailRodada(numeroDaRodada);
    await GerarPlanoDeFundo([marcaDagua, tarja]);
    return obterArquivoPostagem();
}

*/