const pptr = require('puppeteer');
const servicoFala = require('./../gerar-fala');
const servicoVideo = require('./../gerar-video');
const servicoCard = require('./../gerar-card');

// Arquivo que uso para debuggar os passos quando necessário.
// Remover após criação dos testes automatizados

(async () => {

    // console.log(await servicoFala.GerarTexto('./archive/20210619/classificacao.json'));
    // console.log(await servicoCard.Executar({
    //     cabecalho: './archive/20210619/header.png',
    //     corpo1: './archive/20210619/corpo1.png',
    //     corpo2: './archive/20210619/corpo2.png',
    //     rodape: './archive/20210619/rodape.png'
    // }));
    //console.log(await servicoFala.EsperarfinalizacaoDownload());
    //await servicoVideo.Executar(`./archive/20210619/post.png`, `./archive/20210619/IBM_AUDIO_20210619.mp3`);

})();