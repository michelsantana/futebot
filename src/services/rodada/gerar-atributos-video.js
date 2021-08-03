const fs = require('fs');
const moment = require('moment');
const pastas = require('./../../gerenciador-pastas');
const ano = moment().format('yyyy');

module.exports = function (uniqueId) {

    this.obterArquivoAtributos = () => `${pastas.obterPastaArquivosDoDia()}/${uniqueId}_atributosDoVideo.txt`;
    
    fs.writeFileSync(this.obterArquivoAtributos(), '');
    
    this.obterTituloDoVideo = (numeroDoVideo, rodada, serie) => {
        //PROGRAMAÇÃO #5 - 10ª RODADA - SERIE B - 04/07/2021 - BRASILEIRÃO EM 2021 ATUALIZADO HOJE
        //fs.appendFileSync(this.obterArquivoAtributos(), `[TITULO]\nPROGRAMAÇÃO #${numeroDoVideo} - ${rodada}ª RODADA - SERIE ${serie} - ${moment().format('DD/MM/yyyy')} - BRASILEIRÃO EM ${ano} ATUALIZADO HOJE`);
        fs.appendFileSync(this.obterArquivoAtributos(), `[TITULO]\nPROGRAMAÇÃO ${rodada}ª RODADA - SERIE ${serie} - ${moment().format('DD/MM/yyyy')} - BRASILEIRÃO EM ${ano} ATUALIZADO HOJE #${numeroDoVideo}`);
        return this;
    }

    this.obterDescricaoDoVideo = (serie, rodada) => {
        let mensagem = `\n[DESCRIÇÃO]\nFala meus parças, segue tabela dos jogos da ${rodada}ª rodada do Brasileirão ${ano} Série ${serie} atualizada HOJE ${moment().format('DD/MM/yyyy')}`;
        mensagem += '\n\n\n';
        const palavraschave = [
            'BRASILEIRÃO',
            `BRASILEIRÃO SÉRIE ${serie}`,
            'RODADAS BRASILEIRÃO',
            `RODADA ${rodada} BRASILEIRÃO`,
            'CAMPEONATO BRASILEIRO',
            `CAMPEONATO BRASILEIRO SÉRIE ${serie}`,
        ];
        palavraschave.forEach(_ => {
            const acento = (a) => a.replace(/[Ã]/g, 'A').replace(/[Ç]/g, 'C').replace(/[É]/g, 'E');
            const concatAno = (a) => `${a} ${ano}`;
            const hashtag = (a) => '#' + a.replace(/\s/g, '').replace(/[Ã]/g, 'A').replace(/[Ç]/g, 'C').replace(/[É]/g, 'E');

            mensagem += _;
            mensagem += '\n';

            mensagem += concatAno(_);
            mensagem += '\n';

            mensagem += acento(_);
            mensagem += '\n';

            mensagem += acento(concatAno(_));
            mensagem += '\n';

            mensagem += hashtag(_);
            mensagem += '\n';

            mensagem += hashtag(concatAno(_));
            mensagem += '\n';
        })
        fs.appendFileSync(this.obterArquivoAtributos(), mensagem);
        return this;
    }

    return this;
}