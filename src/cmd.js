const path = require('path');
const fs = require('fs');
const pptr = require('puppeteer');
const pastas = require('./gerenciador-pastas');
const servicoFala = require('./services/gerar-fala');
const servicoVideo = require('./services/gerar-video');
const servicoCard = require('./services/gerar-card');
const servicoDiscurso = require('./services/gerar-discurso');
const axios = require('axios').default;
const servicoJsonCampeonato = require('./services/extrair-json-campeonato');
const servicoabelaRodada = require('./services/extrair-tabela-rodada-google');

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

    // const { arquivoGerado } = await servicoJsonCampeonato.Executar(767);
    // const result = await servicoDiscurso.GerarDiscursoJogosDaSemana(arquivoGerado);
    // const fala = await servicoFala.Executar(result.arquivoGerado);

    //await servicoabelaRodada.Executar();

    //console.log(path.('D:/Notebook - Documentos/Workspace/pessoal/futebot/archive/20210625/discurso-classificacao-serie-a.txt'));

    await servicoVideo.Executar('./archive/20210627/post.png','./archive/20210627/IBM_AUDIO.mp3');

})();