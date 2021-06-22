const jimp = require('jimp');
const utils = require('./utils');
const moment = require('moment');

const caminhoPastaSaidaDosArquivos = process.env.caminhoPastaSaidaDosArquivos || './archive/'
const caminhoPastaRecursos = './resources/';
const nomePastaPlanosDeFundo = `planosdefundo/`;
const nomeArquivoPostagem = `post.png`;

const obterPasta = () => `${caminhoPastaSaidaDosArquivos}${moment().format('yyyyMMDD')}/`;

const obterPastaRecursos = () => caminhoPastaRecursos;

const obterArquivoPlanosDeFundoAleatorio = () => `${obterPastaRecursos()}/${nomePastaPlanosDeFundo}/${utils.aleatorio(1,7)}.png`;
const obterArquivoLogo = () => `${obterPastaRecursos()}/logo-1.png`;
const obterArquivoPostagem = () => `${obterPasta()}${nomeArquivoPostagem}`;


async function GerarTabela({ cabecalho, corpo1, corpo2, rodape }) {

    utils.criarPastaSeNaoExistir(obterPasta());

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

const GerarMarcaDagua = async (width, height) => {
    const font = await jimp.loadFont(jimp.FONT_SANS_32_BLACK);
    let wm = await jimp.read(width, height, '#ffffff00');
    await wm.print(font,
        0,
        0,
        {
            text: 'Tabela extraída de Google.com',
            alignmentX: jimp.HORIZONTAL_ALIGN_RIGHT,
            alignmentY: jimp.VERTICAL_ALIGN_BOTTOM
        },
        width,
        height
    )
    .color([{ apply: 'xor', params: ['#00C043'] }])
    .shadow({ opacity: 1, size: 1, blur: 1, x: 1, y: 1 })
    .shadow({ opacity: 1, size: 1, blur: 1, x: -1, y: -1 });

    let logoBg = await jimp.read(width, height, '#ffffff00');
    let logo = await jimp.read(`${obterArquivoLogo()}`);

    await logoBg.blit(logo, (logoBg.getWidth() / 2) - (logo.getWidth() / 2), (logoBg.getHeight() / 2) -  (logo.getHeight() / 2))
    .opacity(.2);

    return await logoBg.blit(wm, 0, 0);
}

async function GerarPlanoDeFundo() {

    utils.criarPastaSeNaoExistir(obterPasta());

    const width = 1920;
    const height = 1080;

    const jimpImagem = await jimp.read(`${obterArquivoPlanosDeFundoAleatorio()}`);
    const jimpTabela = await jimp.read(`${obterArquivoPostagem()}`);

    while (jimpImagem.getWidth() < width || jimpImagem.getHeight() < height)
        jimpImagem.resize(jimpImagem.getWidth() + 100, jimp.AUTO);

    const espacoHorizontal = (jimpImagem.getWidth() - width) / 2;
    const espacoVertical = (jimpImagem.getHeight() - height) / 2;
    await jimpImagem
        .crop(espacoHorizontal, espacoVertical, width, height)
        .blur(40)
        .blit(jimpTabela, (width / 2) - (jimpTabela.getWidth() / 2), (height / 2) - (jimpTabela.getHeight() / 2));

    const wm = await GerarMarcaDagua(width, height);
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