const fs = require('fs');
const moment = require('moment');
const utils = require('../utils');
const pastas = require('./../gerenciador-pastas');
const linq = require('linqjs');

function traduzirNomeTime(time) {
    var nome = time;
    if (time.indexOf('-') > -1) {
        var textoCortado = time.split('-');
        nome = textoCortado[0].trim();

        switch (textoCortado[1]) {
            case 'MG':
                nome += ` Mineiro`;
                break;
            case 'PR':
                nome += ` Paranaense`;
                break;
            case 'GO':
                nome += ` Goianiense`;
                break;
            case 'SC':
                nome += ` `;
                break;
        }
    }
    return nome;
}

function traduzirDiaDaSemana(data) {
    return moment(data).locale('pt-BR').format('dddd');
}

function traduzirHoras(data) {
    const hora = moment(data).format('HH');
    const min = moment(data).format('mm');
    if (~~min > 0) return `${hora} e ${min}`;
    return `${hora} horas`
}

function traduzirDiaDoMes(data) {
    let dia = moment(data).locale("pt-BR").format('D');
    if (~~dia == 1) dia = 'primeiro';
    return `${dia} de ${moment(data).locale("pt-BR").format('MMMM [de] YYYY')}`;
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

module.exports = async function(uniqueId) {

    this.obterArquivoDiscursoClassificacaoSerieA = () => `${pastas.obterPastaArquivosDoDia()}/${uniqueId}_discurso-classificacao-serie-a.txt`;
    this.obterArquivoDiscursoJogosDaRodada = () => `${pastas.obterPastaArquivosDoDia()}/${uniqueId}_discurso-jogos-da-semana.txt`;

    this.gerarDiscursoClassificacaoSerieA = async(arquivoDeDados) => {
        const mensagem = [];

        function Classificacao({ classificacao, time, variacao, pontos, jogos, vitorias, empates, derrotas, golPro, golContra, saldoGols, percentual, ultimosJogo }) {
            return {
                classificacao: classificacao,
                time: time,
                variacao: variacao,
                pontos: pontos,
                jogos: jogos,
                vitorias: vitorias,
                empates: empates,
                derrotas: derrotas,
                golPro: golPro,
                golContra: golContra,
                saldoGols: saldoGols,
                percentual: percentual,
                ultimosJogo: ultimosJogo
            }
        }

        function add(m) {
            mensagem.push(m)
        }


        let lstClassificacoes = [];
        const json = JSON.parse(fs.readFileSync(arquivoDeDados).toString());
        const serie = json.serie;
        json.classificacao.forEach(_ => lstClassificacoes.push(new Classificacao(_)));

        add(`Fala torcedôr e torcedôra: Bem vindo ao canal Futibox: Espero que estejam bem: `);
        add(`Vamos ver a classificação do Brasileirão 2021 série "${serie.toUpperCase()}": `);
        add(`Lembrando que essa, é a classificação no dia de hoje, ${traduzirDiaDoMes(moment())}: `);
        add(`Bora: `);

        const indicePedirLike = utils.aleatorio(7, lstClassificacoes.length - 2);

        add('Ô ');
        lstClassificacoes.forEach(_ => {
            var c = Classificacao(_);
            add(`${c.classificacao}º colocado é, ${traduzirNomeTime(c.time)}, com ${c.pontos} pontos, em ${c.jogos} jogos: `);

            if (~~c.classificacao == indicePedirLike) {
                add('Meus parças, me ajudem a continuar com o canal: Deixa aquela deedáda no laique pra fortalecer e se inscrévi no canal: trarei novidades em breve: Continuando: Ô ');
            }
        });
        add('Muitíssimo obrigada a todos que assistiram até aqui: Até o próximo vídeo: ');

        const mensagemResolvida = mensagem.join('');
        fs.writeFileSync(`${this.obterArquivoDiscursoClassificacaoSerieA()}`, mensagemResolvida);
        return this;
    }

    this.gerarDiscursoJogosDaSemana = async(arquivoDeDados) => {
        const mensagem = [];
        const classicos = JSON.parse(fs.readFileSync(`${pastas.obterPastaDeRecursos()}/classicos-do-futebol-brasileiro.json`).toString());

        function Programacao(objetoDeProgramacao) {
            return {
                mandante: objetoDeProgramacao.mandante,
                visitante: objetoDeProgramacao.visitante,
                estadio: objetoDeProgramacao.estadio,
                rodada: objetoDeProgramacao.rodada,
                dataDaPartida: new Date(objetoDeProgramacao.dataDaPartida),
            }
        }

        function add(m) {
            mensagem.push(m)
        }

        function jogoClassico(sigla1, sigla2) {
            const classicoEncontrado = classicos.filter(_ => _.atalho.indexOf(sigla1) > -1 && _.atalho.indexOf(sigla2) > -1);
            if (classicoEncontrado.length > 0) return true;
            return false;
        }

        function agrupamentoPor(lista, propriedade) {
            return lista.reduce(function(rv, x) {
                (rv[x[propriedade]] = rv[x[propriedade]] || []).push(x);
                return rv;
            }, {});
        };


        let programacaoDaSemana = [];
        const json = JSON.parse(fs.readFileSync(arquivoDeDados).toString());
        const numeroDaRodada = json.rodada;
        const serie = json.serie;
        json.partidas.forEach(_ => programacaoDaSemana.push(new Programacao(_)));

        programacaoDaSemana.forEach(_ => {
            const d = moment(_.dataDaPartida);
            _.diaDaSemana = traduzirDiaDaSemana(_.dataDaPartida);
            _.numeroDiaMes = d.format('DD');
            _.codigoSemanaDia = `${d.week()}${d.day()}`;
        });

        programacaoDaSemana = programacaoDaSemana.sort(_ => _.diaDaSemanaNumerico);

        const agrupadoPorDiaDaSemana = agrupamentoPor(programacaoDaSemana, 'codigoSemanaDia');

        const diasDaSemana = Object.keys(agrupadoPorDiaDaSemana).map(_ => ~~_).filter(_ => _ > 0).sort();

        add(`Fala torcedôr e torcedôra: Bem vindo ao canal Futibox: Vamos ver como estão programados os jogos da ${numeroDaRodada}ª rodada do Brasileirão Série "${serie}": `);
        add(`Bora: `);
        for (const diaDaSemana of diasDaSemana) {
            const lista = agrupadoPorDiaDaSemana[diaDaSemana];
            const primeiraLinha = lista[0];

            add(`${primeiraLinha.diaDaSemana}, dia ${~~primeiraLinha.numeroDiaMes}: `);

            lista.forEach((_, i) => {
                var p = new Programacao(_);

                add(`${traduzirNomeTime(p.mandante)} e ${traduzirNomeTime(p.visitante)}: `);

                if (jogoClassico(p.mandanteSigla, p.visitanteSigla)) add(` Um clássico do futebol brasileiro: `);

                add(`às ${traduzirHoras(p.dataDaPartida)}: `)
                add(`no estádio, ${p.estadio}: `);
            });
        }
        // programacaoDaSemana.forEach((_, i) => {
        //     var p = new Programacao(_);
        //     add(`${i + 1}º jogo `)
        //     add(`${traduzirTempoVerbal(moment(p.dataDaPartida), 'ser')}: `);

        //     if (jogoClassico(p.mandanteSigla, p.visitanteSigla))
        //         add(` Um clássico do futebol brasileiro: `);

        //     add(`${traduzirDiaDaSemana(p.dataDaPartida)}: `);
        //     add(`às ${traduzirHoras(p.dataDaPartida)}: `)
        //     add(`${traduzirNomeTime(p.mandante)} e ${traduzirNomeTime(p.visitante)}: `);
        //     add(`no estádio, ${p.estadio}: `);
        // });
        add('Muitíssimo obrigada a todos que assistiram até aqui: até o próximo vídeo: ');

        const mensagemResolvida = mensagem.join('');
        fs.writeFileSync(`${this.obterArquivoDiscursoJogosDaRodada()}`, mensagemResolvida);
        return this;
    }

    return this;
}