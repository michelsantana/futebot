const servicoExtrairTabelaGlobo = require('./services/extrair-json-globo');
const servicoExtrairTabelaGoogle = require('./services/extrair-tabela-google');
const servicoGerarCard = require('./services/gerar-card');
const servicoGerarFala = require('./services/gerar-fala');
const servicoGerarVideo = require('./services/gerar-video');
const servicoDiscurso = require('./services/gerar-discurso');

(async () => {

    const dadosJson = await servicoExtrairTabelaGlobo.Executar();
    const dadosPrint = await servicoExtrairTabelaGoogle.Executar();
    const postagem = await servicoGerarCard.Executar(dadosPrint.arquivos);
    const gerarDiscurso = await servicoDiscurso.GerarDiscursoClassificacaoSerieA(dadosJson.arquivoJson);
    const gerarFala = await servicoGerarFala.Executar(gerarDiscurso.arquivoGerado);
    if (gerarFala.arquivoGerado) {
        const gerarVideo = await servicoGerarVideo.Executar(postagem, gerarFala.arquivoAudio);
    }
})();