const servicoExtrairTabelaGlobo = require('./services/extrair-json-globo');
const servicoExtrairTabelaGoogle = require('./services/extrair-tabela-google');
const servicoGerarCard = require('./services/gerar-card');
const servicoGerarFala = require('./services/gerar-fala');
const servicoGerarVideo = require('./services/gerar-video');

(async () => {

    const dadosJson = await servicoExtrairTabelaGlobo.Executar();
    const dadosPrint = await servicoExtrairTabelaGoogle.Executar();
    const postagem = await servicoGerarCard.Executar(dadosPrint.arquivos);
    const gerarFala = await servicoGerarFala.Executar(dadosJson.arquivoJson);
    if (gerarFala.arquivoGerado) {
        const gerarVideo = await servicoGerarVideo.Executar(postagem, gerarFala.arquivoAudio);
    }
})();