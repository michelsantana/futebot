const fs = require('fs');
const moment = require('moment');
const pastas = require('./../gerenciador-pastas');

const obterArquivoDiscursoClassificacaoSerieA = () => `${pastas.obterPastaArquivosDoDia()}/discurso-classificacao-serie-a.txt`;
const obterArquivoDiscursoJogosDaSemana = () => `${pastas.obterPastaArquivosDoDia()}/discurso-jogos-da-semana.txt`;

function traduzirMomeTime(time) {
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

async function GerarDiscursoClassificacaoSerieA(arquivoDadosClassificacaoSerieA) {
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
    const json = JSON.parse(fs.readFileSync(arquivoDadosClassificacaoSerieA));
    json.forEach(_ => lstClassificacoes.push(new Classificacao(_)));
    add('Ô ')
    lstClassificacoes.forEach(_ => {
        var c = Classificacao(_);
        add(`${c.classificacao}º colocado é, ${traduzirMomeTime(c.time)}, com ${c.pontos} pontos, em ${c.jogos} jogos: `);

        if (~~c.classificacao == 10) {
            add('Meus parças, me ajudem a continuar com o canal: Deixa aquela deedáda no laique pra fortalecer e se inscrévi no canal: trarei novidades em breve: Então: Continuando: Ô ');
        }
    });

    add('Gostaria de agradecer a todos que assistiram até aqui: Muitíssimo obrigado: tenham uma ótima semana:');
    
    const mensagemResolvida = mensagem.join('');
    fs.writeFileSync(`${obterArquivoDiscursoClassificacaoSerieA()}`, mensagemResolvida);

    return { arquivoGerado: `${obterArquivoDiscursoClassificacaoSerieA()}` };
}

async function GerarDiscursoJogosDaSemana(arquivoDadosDaProgramacaoDaSemana) {
    const mensagem = [];

    function Programacao(objetoDeProgramacao) {
        this.mandante = objetoDeProgramacao.mandante;
        this.visitante = objetoDeProgramacao.visitante;
        this.estadio = objetoDeProgramacao.estadio;
        this.rodada = objetoDeProgramacao.rodada;
        this.dataDaPartida = new Date(objetoDeProgramacao.dataDaPartida);
        return this;
    }

    function add(m) {
        mensagem.push(m)
    }

    
    function traduzirDiaDaSemana(data){
        return moment(data).locale('pt-BR').format('dddd');
    }

    function traduzirHoras(data){
        const hora = moment(data).format('HH');
        const min = moment(data).format('mm');
        if(~~min > 0) return `${hora} e ${min}`;
        return `${hora} horas`
    }

    add(`Fala torcedôr e torcedôra: Vamos ver como estão programados os jogos dessa semana?: `);

    let programacaoDaSemana = [];
    const json = JSON.parse(fs.readFileSync(arquivoDadosDaProgramacaoDaSemana));
    json.forEach(_ => programacaoDaSemana.push(new Programacao(_)));
    programacaoDaSemana = programacaoDaSemana.sort(_ => _.dataDaPartida);
    add(`Bom, ô`);
    programacaoDaSemana.forEach((_, i) => {
        var p = new Programacao(_);
        add(`${i + 1}º jogo será ${traduzirDiaDaSemana(p.dataDaPartida)}, às ${traduzirHoras(p.dataDaPartida)}: `) 
        add(`${traduzirMomeTime(p.mandante)}, contra ${traduzirMomeTime(p.visitante)}: `); 
        add(` o jogo acontecerah no ${p.estadio}: `);
    });

    const mensagemResolvida = mensagem.join('');
    fs.writeFileSync(`${obterArquivoDiscursoJogosDaSemana()}`, mensagemResolvida);

    return { arquivoGerado: obterArquivoDiscursoJogosDaSemana() }
}

module.exports = {
    GerarDiscursoClassificacaoSerieA,
    GerarDiscursoJogosDaSemana
}