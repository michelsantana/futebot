const axios = require('axios').default;
const fs = require('fs');
const moment = require('moment');
const pastas = require('./../gerenciador-pastas');
const utils = require('./../utils');

//const gerarUrlDadosCalendario = (idDoCampeonato) => `https://footstatsapiapp.azurewebsites.net/campeonatos/${idDoCampeonato}/calendario`;
const gerarUrlDadosPartidas = (idDoCampeonato) => `https://apifutebol.footstats.com.br/3.1/campeonatos/${idDoCampeonato}/partidas`;
const gerarUrlDadosEquipes = (idDoCampeonato) => `https://apifutebol.footstats.com.br/3.1/campeonatos/${idDoCampeonato}/equipes`;

const obterPastaCampeonato = (idDoCampeonato) => `${pastas.obterPastaArquivosDoDia()}/${idDoCampeonato}`;

//const obterArquivoDadosCalendario = () => `${obterPastaCampeonato()}/dados-calendario.json`;
const obterArquivoDadosEquipes = (idDoCampeonato) => `${obterPastaCampeonato(idDoCampeonato)}/dados-equipes.json`
const obterArquivoDadosPartidas = (idDoCampeonato) => `${obterPastaCampeonato(idDoCampeonato)}/dados-partidas.json`;

const token = 'Bearer 72fa6abf-408'
const dicionarioDeEquipes = {};
    
// async function ObterDadosDoCalendario(idDoCampeonato) {
//     if (!fs.existsSync(obterArquivoDadosCalendario())) fs.writeFileSync(`${obterArquivoDadosCalendario()}`, '{}');
//     gerar
//     try {
//         const result = await axios.get(urlCalendario);
//         if (result.data) fs.writeFileSync(`${obterArquivoDadosCalendario()}`, JSON.stringify(result.data));
//     }
//     catch (e) {
//         console.log('Erro ao buscar dados do campeonato', e);
//     }
//     return JSON.parse(fs.readFileSync(obterArquivoDadosCalendario()));
// }

async function ObterDadosUrlSalvarArquivo(url, arquivo) {
    if (fs.existsSync(arquivo)) JSON.parse(fs.readFileSync(arquivo));
    try {
        const result = await axios.get(url, { headers: { "Authorization": token } });
        if (result.data) fs.writeFileSync(`${arquivo}`, JSON.stringify(result.data))
    } catch (e) {
        console.log('Erro ao buscar dados', url, arquivo, e);
    }
    return JSON.parse(fs.readFileSync(arquivo));
}

async function ObterDadosDasEquipes(idDoCampeonato) {
    const url = gerarUrlDadosEquipes(idDoCampeonato);
    const arquivo = obterArquivoDadosEquipes(idDoCampeonato);
    return await ObterDadosUrlSalvarArquivo(url, arquivo);
}


async function ObterDadosDasPartidas(idDoCampeonato) {
    const url = gerarUrlDadosPartidas(idDoCampeonato);
    const arquivo = obterArquivoDadosPartidas(idDoCampeonato);
    return await ObterDadosUrlSalvarArquivo(url, arquivo);
}

async function ObterPartidasDaRodada(partidas) {
    const condicoesEncontrarRodada = (_) => [
        !!_?.dataDaPartida,
        Number(_?.dataDaPartida?.dayOfYear) > 0,
        utils.isToday(new Date(2021, 0, ~~_?.dataDaPartida?.dayOfYear))
    ];

    const rodada = partidas.find(_ => condicoesEncontrarRodada(_).every(_ => _)).rodada;

    const partidasDaRodada = partidas
        .filter(_ => ~~_.rodada == ~~rodada)
        .map(_ => {
            return {
                mandante: dicionarioDeEquipes[_.idEquipeMandante].nome,
                visitante: dicionarioDeEquipes[_.idEquipeVisitante].nome,
                estadio: _.estadio,
                rodada: _.rodada,
                dataDaPartida: _.dataDaPartidaIso
            }
        });
    return partidasDaRodada;
}

async function ObterPartidasDaSemana(partidas) {
    const condicoes = (_) => [
        !!_?.dataDaPartida,
        Number(_?.dataDaPartida?.dayOfYear) > 0,
        utils.isAfterToday(new Date(2021, 0, ~~_?.dataDaPartida?.dayOfYear)),
        utils.isInThisWeek(new Date(2021, 0, ~~_?.dataDaPartida?.dayOfYear))
    ];

    const dados = partidas.data
        .filter(_ => condicoes(_).every(_ => _))
        .map(_ => {
            return {
                mandante: dicionarioDeEquipes[_.idEquipeMandante].nome,
                visitante: dicionarioDeEquipes[_.idEquipeVisitante].nome,
                estadio: _.estadio,
                rodada: _.rodada,
                dataDaPartida: _.dataDaPartidaIso
            }
        });
    return dados;
}

async function Executar(idDoCampeonato = 767) {

    utils.criarPastaSeNaoExistir(obterPastaCampeonato(idDoCampeonato));

    const equipes = await ObterDadosDasEquipes(idDoCampeonato);
    equipes.data.forEach(_ => dicionarioDeEquipes[_.id] = _);
    const partidas = await ObterDadosDasPartidas(idDoCampeonato);

    const dados = await ObterPartidasDaRodada(partidas.data);

    fs.writeFileSync(`${pastas.obterPastaArquivosDoDia()}/jogos-da-semana.json`, JSON.stringify(dados));

    return { arquivoGerado: `${pastas.obterPastaArquivosDoDia()}/jogos-da-semana.json` }
}

module.exports = { Executar }