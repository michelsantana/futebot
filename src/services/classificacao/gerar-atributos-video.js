const fs = require('fs');
const moment = require('moment');
const pastas = require('./../../gerenciador-pastas');
const ano = moment().format('yyyy');

module.exports = function (uniqueId) {

    this.obterArquivoAtributos = () => `${pastas.obterPastaArquivosDoDia()}/${uniqueId}_atributosDoVideo.txt`;
    fs.writeFileSync(this.obterArquivoAtributos());
    this.obterTituloDoVideo = (idDoVideo) => {
        fs.appendFileSync(this.obterArquivoAtributos(), `[TITULO]\n#${idDoVideo} - BRASILEIRÃO ${ano} CLASSIFICAÇÃO HOJE - BRASILEIRÃO ${moment().format('DD/MM/yyyy')} - ATUALIZADO`);
    }

    this.obterDescricaoDoVideo = (serie) => {
        let mensagem = `\n[DESCRIÇÃO]\nFala meus parças, segue tabela da classificação do Brasileirão ${ano} Séria A atualizada HOJE ${moment().format('DD/MM/yyyy')}`;
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
            mensagem += _;
            mensagem += '\n';
            mensagem += _ + ` ${ano}`;
            mensagem += '\n';
            mensagem += _.replace('/[Ã]/g', 'A').replace('/[Ç]/g', 'C').replace('/[É]/g', 'E');
            mensagem += '\n';
            mensagem += _.replace('/[Ã]/g', 'A').replace('/[Ç]/g', 'C').replace('/[É]/g', 'E') + ` ${ano}`;
            mensagem += '\n';
            mensagem += '#' + _.replace(/\s/g, '');
            mensagem += '\n';
            mensagem += '#' + _.replace(/\s/g, '') + `${ano}`;
            mensagem += '\n';
        })
        fs.appendFileSync(this.obterArquivoAtributos(), mensagem);
    }

    return this;
}