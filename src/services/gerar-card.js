const jimp = require('jimp');
const utils = require('./../utils');
const pastas = require('./../gerenciador-pastas');
const moment = require('moment');

const nomeArquivoPostagem = `post.png`;
const obterArquivoPlanosDeFundoAleatorio = () => `${pastas.obterPastaDeRecursos()}/bg-${utils.aleatorio(1, 7)}.png`;
const obterArquivoLogo = () => `${pastas.obterPastaDeRecursos()}/logo-1.png`;
const obterArquivoPostagem = () => `${pastas.obterPastaArquivosDoDia()}${nomeArquivoPostagem}`;

const cardSize = {
    w: 1920,
    h: 1080,
}

async function GerarTabela({ cabecalho, corpo1, corpo2, rodape }) {

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
    const fonts = {
        32: await jimp.loadFont(jimp.FONT_SANS_32_BLACK),
        64: await jimp.loadFont(jimp.FONT_SANS_64_BLACK),
        128: await jimp.loadFont(jimp.FONT_SANS_128_BLACK)
    }

    let wm = await jimp.read(cardSize.w, cardSize.h, '#ffffff00');
    await wm.print(fonts[32], 0, 0,
        { text: 'Tabela extraída de Google.com', alignmentX: jimp.HORIZONTAL_ALIGN_RIGHT, alignmentY: jimp.VERTICAL_ALIGN_BOTTOM },
        cardSize.w, cardSize.h);
    await wm.color([{ apply: 'xor', params: ['#FFFFFF'] }]);
    await wm.shadow({ opacity: 1, size: 1, blur: 1, x: 1, y: 1 });
    await wm.shadow({ opacity: 1, size: 1, blur: 1, x: -1, y: -1 });

    const textHeight = jimp.measureTextHeight(fonts[64], 'Classificação', cardSize.w);
    let tarja = await jimp.read(cardSize.w, cardSize.h, '#ffffff00');
    await tarja
        .print(fonts[64], 0, 0,
            { text: 'Classificação', alignmentX: jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: jimp.VERTICAL_ALIGN_TOP },
            cardSize.w, cardSize.h)
        .print(fonts[128], 0, textHeight,
            { text: 'Brasileirão Série A', alignmentX: jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: jimp.VERTICAL_ALIGN_TOP },
            cardSize.w, cardSize.h)
        .color([{ apply: 'xor', params: ['#F00'] }])
        .shadow({ opacity: 1, size: 1, blur: 1, x: 1, y: 1 })
        .shadow({ opacity: 1, size: 1, blur: 1, x: -1, y: -1 });

    let tarja2 = await jimp.read(cardSize.w, cardSize.h, '#ffffff00');
    await tarja2
        .print(fonts[128], 0, 0,
            { text: moment().format('DD/MM/YYYY'), alignmentX: jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: jimp.VERTICAL_ALIGN_BOTTOM },
            cardSize.w, cardSize.h)
        .color([{ apply: 'xor', params: ['#F00'] }])
        .shadow({ opacity: 1, size: 1, blur: 1, x: 1, y: 1 })
        .shadow({ opacity: 1, size: 1, blur: 1, x: -1, y: -1 });

    tarja = await tarja.blit(tarja2, 0, 0);

    let logoBg = await jimp.read(cardSize.w, cardSize.h, '#ffffff00');
    let logo = await jimp.read(`${obterArquivoLogo()}`);

    await logoBg.blit(logo, (logoBg.getWidth() / 2) - (logo.getWidth() / 2), (logoBg.getHeight() / 2) - (logo.getHeight() / 2))
        .opacity(.2);

    logobg = await logoBg.blit(wm, 0, 0);
    return await logobg.blit(tarja, 0, 0);
}

async function GerarPlanoDeFundo() {

    const tableWidth = 1280;
    const tableHeight = 720;

    const jimpImagem = await jimp.read(`${obterArquivoPlanosDeFundoAleatorio()}`);
    const jimpTabela = await jimp.read(`${obterArquivoPostagem()}`);

    while (jimpImagem.getWidth() < cardSize.w || jimpImagem.getHeight() < cardSize.h)
        jimpImagem.resize(jimpImagem.getWidth() + 100, jimp.AUTO);

    while (jimpTabela.getWidth() < tableWidth && jimpTabela.getHeight() < tableHeight)
        jimpTabela.resize(jimpTabela.getWidth() + 100, jimp.AUTO);

    const espacoHorizontal = (jimpImagem.getWidth() - cardSize.w) / 2;
    const espacoVertical = (jimpImagem.getHeight() - cardSize.h) / 2;
    await jimpImagem
        .crop(espacoHorizontal, espacoVertical, cardSize.w, cardSize.h)
        .blur(40)
        .blit(jimpTabela, (cardSize.w / 2) - (jimpTabela.getWidth() / 2), (cardSize.h / 2) - (jimpTabela.getHeight() / 2));

    const wm = await GerarMarcaDagua();
    await jimpImagem.blit(wm, 0, 0);

    jimpImagem.write(`${obterArquivoPostagem()}`);
}

async function Executar({ cabecalho, corpo1, corpo2, rodape }) {
    await GerarTabela({ cabecalho, corpo1, corpo2, rodape });
    await GerarPlanoDeFundo();
    return obterArquivoPostagem();
}

module.exports = {
    Executar,
    GerarPlanoDeFundo,
    GerarTabela
}