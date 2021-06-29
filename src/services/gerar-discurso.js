const fs = require('fs');
const moment = require('moment');
const pastas = require('./../gerenciador-pastas');

function traduzirNomeTime(time) {
    var nome = time;
    if (time.indexOf('-') > -1) {
        var textoCortado = time.split('-');
        nome = textoCortado[0].trim();

        switch (textoCortado[1]) {
            case 'MG': nome += ` Mineiro`; break;
            case 'PR': nome += ` Paranaense`; break;
            case 'GO': nome += ` Goianiense`; break;
            case 'SC': nome += ` `; break;
        }
    }
    return nome;
}

module.exports = async function (uniqueId) {

    this.discurso = '';
    this.obterArquivoDiscursoClassificacaoSerieA = () => `${pastas.obterPastaArquivosDoDia()}/${uniqueId}_discurso-classificacao-serie-a.txt`;
    this.obterArquivoDiscursoJogosDaRodada = () => `${pastas.obterPastaArquivosDoDia()}/${uniqueId}_discurso-jogos-da-semana.txt`;
    this.obterDiscurso = () => this.discurso;
    this.gerarDiscursoClassificacaoSerieA = async (arquivoDeDados) => {
        const mensagem = [];

        function Classificacao({ classificacao, time, variacao, pontos, jogos, vitorias, empates, derrotas, golPro, golContra, saldoGols, percentual, ultimosJogo }) {
            return {
                classificacao: classificacao, time: time, variacao: variacao, pontos: pontos, jogos: jogos, vitorias: vitorias, empates: empates,
                derrotas: derrotas, golPro: golPro, golContra: golContra, saldoGols: saldoGols, percentual: percentual, ultimosJogo: ultimosJogo
            }
        }

        function add(m) {
            mensagem.push(m)
        }

        add(`Fala torcedôr e torcedôra: Como vocês estão? Espero que estejam todos bem: `);
        add(`Vamos ver a classificação do Brasileirão 2021 série "Ahh": `);
        add(`Lembrando que essa é, a classificação no dia de hoje, ${moment().locale("pt-BR").format('DD [de] MMMM [de] YYYY')}: `);
        add(`Vamos la: `);

        let lstClassificacoes = [];

        const json = JSON.parse(fs.readFileSync(arquivoDeDados));

        json.forEach(_ => lstClassificacoes.push(new Classificacao(_)));
        add('Ô ')
        lstClassificacoes.forEach(_ => {
            var c = Classificacao(_);
            add(`${c.classificacao}º colocado é, ${traduzirNomeTime(c.time)}, com ${c.pontos} pontos, em ${c.jogos} jogos: `);

            if (~~c.classificacao == 10) {
                add('Meus parças, me ajudem a continuar com o canal: Deixa aquela deedáda no laique pra fortalecer e se inscrévi no canal: trarei novidades em breve: Então: Continuando: Ô ');
            }
        });

        add('Gostaria de agradecer a todos que assistiram até aqui: Muitíssimo obrigado: tenham uma ótima semana:');

        const mensagemResolvida = mensagem.join('');
        fs.writeFileSync(`${this.obterArquivoDiscursoClassificacaoSerieA()}`, mensagemResolvida);
        this.discurso = mensagemResolvida;

        return this;
    }

    this.gerarDiscursoJogosDaSemana = async (arquivoDeDados) => {
        const mensagem = [];
        const classicos = JSON.parse(fs.readFileSync(`${pastas.obterPastaArquivos()}/classicos-do-futebol-brasileiro.json`).toString());

        function Programacao(objetoDeProgramacao) {
            return {
                mandante: objetoDeProgramacao.mandante,
                visitante: objetoDeProgramacao.visitante,
                estadio: objetoDeProgramacao.estadio,
                rodada: objetoDeProgramacao.rodada,
                dataDaPartida: new Date(objetoDeProgramacao.dataDaPartida),
            }
        }

        function add(m) { mensagem.push(m) }


        function traduzirDiaDaSemana(data) { return moment(data).locale('pt-BR').format('dddd'); }

        function traduzirHoras(data) {
            const hora = moment(data).format('HH');
            const min = moment(data).format('mm');
            if (~~min > 0) return `${hora} e ${min}`;
            return `${hora} horas`
        }

        function traduzirTempoVerbal(data, mensagem) {

            switch (mensagem) {
                case 'ser':
                    if (moment().isAfter(data))
                        return 'foi';
                    else if (moment().isBefore(data))
                        return 'será'
                    break;
            }
            return mensagem;
        }

        function jogoClassico(sigla1, sigla2) {
            const classicoEncontrado = classicos.filter(_ => _.atalho.indexOf(sigla1) > -1 && _.atalho.indexOf(sigla2) > -1);
            if (classicoEncontrado.length > 0) return true;
            return false;
        }

        

        let programacaoDaSemana = [];

        const json = JSON.parse(fs.readFileSync(arquivoDeDados));
        const numeroDaRodada = json.rodada;
        json.partidas.forEach(_ => programacaoDaSemana.push(new Programacao(_)));
        programacaoDaSemana = programacaoDaSemana.sort(_ => _.dataDaPartida);

        add(`Fala torcedôr e torcedôra: Vamos ver como estão programados os jogos da ${numeroDaRodada}º rodada do Brasileirão Série "Ahh": `);

        add(`Bom, Ô `);
        programacaoDaSemana.forEach((_, i) => {
            var p = new Programacao(_);
            add(`${i + 1}º jogo `)
            add(`${traduzirTempoVerbal(moment(p.dataDaPartida), 'ser')}: `);

            if (jogoClassico(p.mandanteSigla, p.visitanteSigla))
                add(` Um clássico do futebol brasileiro: `);

            add(`${traduzirDiaDaSemana(p.dataDaPartida)}: `);
            add(`às ${traduzirHoras(p.dataDaPartida)}: `)
            add(`${traduzirNomeTime(p.mandante)} e ${traduzirNomeTime(p.visitante)}: `);
            add(`no estádio, ${p.estadio}: `);


        });

        const mensagemResolvida = mensagem.join('');
        fs.writeFileSync(`${this.obterArquivoDiscursoJogosDaRodada()}`, mensagemResolvida);
        this.discurso = mensagemResolvida;

        return this;
    }

    return this;
}