const fs = require('fs');
const moment = require('moment');
const pastas = require('./../../gerenciador-pastas');
const ano = moment().format('yyyy');

module.exports = function (uniqueId) {

    this.obterArquivoAtributos = () => `${pastas.obterPastaArquivosDoDia()}/${uniqueId}_atributosDoVideo.txt`;
    
    fs.writeFileSync(this.obterArquivoAtributos(), '');
    
    this.obterTituloDoVideo = (serie) => {
        // CLASSIFICAÇÃO #14 - SERIE B - 06/07/2021 - BRASILEIRÃO EM 2021 BRASILEIRÃO ATUALIZADO HOJE
        // CLASSIFICAÇÃO 14/07/2021 SERIE B - BRASILEIRÃO 2021 HOJE - ATUALIZADO #17
        //fs.appendFileSync(this.obterArquivoAtributos(), `[TITULO]\n#${numeroDoVideo} - BRASILEIRÃO ${ano} CLASSIFICAÇÃO HOJE - BRASILEIRÃO ${moment().format('DD/MM/yyyy')} - ATUALIZADO`);
        fs.appendFileSync(this.obterArquivoAtributos(), `[TITULO]\nCLASSIFICAÇÃO ${moment().format('DD/MM/yyyy')} SÉRIE ${serie} - BRASILEIRÃO ${ano} CLASSIFICAÇÃO HOJE`);
        return this;
    }

    this.obterDescricaoDoVideo = (serie) => {
        let mensagem = `\n[DESCRIÇÃO]\nFala meus parças, segue tabela da classificação do Brasileirão ${ano} Série ${serie} atualizada HOJE ${moment().format('DD/MM/yyyy')}`;
        mensagem += '\n\n\n';
        const palavraschave = [
            'BRASILEIRÃO',
            `BRASILEIRÃO SÉRIE ${serie}`,
            'TABELA BRASILEIRÃO',
            'TABELA CLASSIFICAÇÃO',
            'CLASSIFICAÇÃO DO BRASILEIRÃO',
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