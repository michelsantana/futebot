const servicoExtrairTabelaGlobo = require('./extrair-json-globo');
const servicoExtrairTabelaGoogle = require('./extrair-tabela-google');
const servicoGerarCard = require('./gerar-card');
const servicoGerarFala = require('./gerar-fala');
const servicoGerarVideo = require('./gerar-video');
const utils = require('./utils');
//const servicoGerarVideo = require('./extrair-tabela-globo');

(async () => {

    const dadosJson = await servicoExtrairTabelaGlobo.Executar();
    const dadosPrint = await servicoExtrairTabelaGoogle.Executar();
    const postagem = await servicoGerarCard.Executar(dadosPrint.arquivos);
    const gerarFala = await servicoGerarFala.Executar(dadosJson.arquivoJson);
    if (gerarFala.arquivoGerado) {
        const gerarVideo = await servicoGerarVideo.Executar(postagem, gerarFala.arquivoAudio);
    }

    //await servicoGerarCard.GerarPlanoDeFundo('./archive/20210615/img/20210615082026.png');
    // await servicoGerarCard.GerarTabela(arquivoGerado);
    // await servicoGerarCard.GerarTabela({ 
    //     cabecalho: './archive/20210617/img/20210617083150_cabecalho.png',
    //     pt1: './archive/20210617/img/20210617083150_pt1.png',
    //     pt2: './archive/20210617/img/20210617083150_pt2.png',
    //     rodape: './archive/20210617/img/20210617083150_rodape.png',
    // });
})();