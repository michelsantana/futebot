const attrRodada = require('./services/rodada/gerar-atributos-video');
const attrClass = require('./services/classificacao/gerar-atributos-video');
const utils = require('./utils');

(async()=>{

    const serie = 'B';
    const numeroVideo = 27;
    const numeroRodada = 15;

    const uniqueIdRodada = `${serie}-rodada-${utils.hoje()}`;
    const uniqueIdClass = `${serie}-class-${utils.hoje()}`;

    attrRodada(uniqueIdRodada).obterTituloDoVideo(numeroVideo,numeroRodada,serie).obterDescricaoDoVideo(serie, numeroRodada).obterArquivoAtributos();

    attrClass(uniqueIdClass).obterTituloDoVideo(numeroVideo, serie).obterDescricaoDoVideo(serie).obterArquivoAtributos();

})();