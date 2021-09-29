const gerarVideoClassificacao = require('./gerar-video-classificacao-brasileirao');
const gerarVideoRodadas = require('./gerar-video-rodadas');


(async () => {
    "use strict";

    console.log(process.argv);
    const params = {};
    process.argv.forEach(_ => _.indexOf('=') > -1 ? params[_.split('=')[0]] = _.split('=')[1] : undefined);
    // cmd = [c, r] classficação ou rodada
    // sr = [a, b] letra da serie
    // rd = [1, 99] numero da rodada
    // nrv = [0, 99] numero do video

    const { cmd, sr, rd, nrv = 99 } = params;
    const condicoes = [];
    if(!cmd || !sr) {
        console.error('Faltou parametros');
        return;
    }
    if (cmd == 'r' && !rd) {
        console.error('Rodada sem número');
        return;
    }
    switch(cmd){
        case 'c': await gerarVideoClassificacao(sr, nrv); break;
        case 'r': await gerarVideoRodadas(sr,rd, nrv); break;
    }

 
})();
