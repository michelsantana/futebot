const fs = require('fs');
const pptr = require('puppeteer');
const pastas = require('./gerenciador-pastas');
const servicoFala = require('./services/gerar-fala');
const servicoVideo = require('./services/gerar-video');
const servicoCard = require('./services/gerar-card');
const axios = require('axios').default;

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

    axios.get('https://apifutebol.footstats.com.br/3.1/campeonatos/767/partidas/rodada/6', {
        headers: {
            "Authorization": 'Bearer 72fa6abf-408'
        }
    }).then(_ => {
        fs.writeFileSync(`${pastas.obterPastaArquivos()}/partidas-rodada-6.json`, JSON.stringify(_.data))
    }).catch(_ => {
        console.log('Erro!');
        console.error(_);
    })

})();