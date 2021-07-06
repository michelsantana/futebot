const axios = require('axios').default;
const fs = require('fs');
const moment = require('moment');
const pastas = require('./../../gerenciador-pastas');
const utils = require('./../../utils');

module.exports = async function (uniqueId, idDoCampeonato, serie, numeroDaRodada) {

    const gerarUrlDadosPartidas = () => `https://apifutebol.footstats.com.br/3.1/campeonatos/${idDoCampeonato}/partidas`;
    const gerarUrlDadosEquipes = () => `https://apifutebol.footstats.com.br/3.1/campeonatos/${idDoCampeonato}/equipes`;

    this.obterPastaCampeonato = () => `${pastas.obterPastaArquivosDoDia()}/${idDoCampeonato}`;
    this.obterArquivoDadosEquipes = () => `${this.obterPastaCampeonato()}/${uniqueId}-${numeroDaRodada}_dados-equipes.json`
    this.obterArquivoDadosPartidas = () => `${this.obterPastaCampeonato()}/${uniqueId}-${numeroDaRodada}_dados-partidas.json`;
    this.obterArquivoDeDados = () => `${this.obterPastaCampeonato()}/${uniqueId}-${numeroDaRodada}_jogos-da-rodada.json`;

    const token = 'Bearer 72fa6abf-408'

    const ObterDadosUrlSalvarArquivo = async (url, arquivo) => {
        if (fs.existsSync(arquivo)) return JSON.parse(fs.readFileSync(arquivo));
        try {
            const result = await axios.get(url, { headers: { "Authorization": token } });
            if (result.data) fs.writeFileSync(`${arquivo}`, JSON.stringify(result.data))
        } catch (e) {
            console.log('Erro ao buscar dados', url, arquivo, e);
        }
        return JSON.parse(fs.readFileSync(arquivo));
    }

    const ObterDadosDasEquipes = async () => {
        const url = gerarUrlDadosEquipes();
        const arquivo = this.obterArquivoDadosEquipes();
        return await ObterDadosUrlSalvarArquivo(url, arquivo);
    }


    const ObterDadosDasPartidas = async () => {
        const url = gerarUrlDadosPartidas();
        const arquivo = this.obterArquivoDadosPartidas();
        return await ObterDadosUrlSalvarArquivo(url, arquivo);
    }

    const ObterPartidasDaRodada = async (partidas, equipes) => {
        const condicoesEncontrarRodada = (_) => [
            !!_?.dataDaPartida,
            Number(_?.dataDaPartida?.dayOfYear) > 0,
            utils.isToday(new Date(2021, 0, ~~_?.dataDaPartida?.dayOfYear))
        ];

        let dicionarioDeEquipes = {};
        equipes.data.forEach(_ => dicionarioDeEquipes[_.id] = _);

        const partidasDaRodada = partidas
            .filter(_ => ~~_.rodada == ~~numeroDaRodada)
            .map(_ => {
                return {
                    mandante: dicionarioDeEquipes[_.idEquipeMandante].nome,
                    mandanteSigla: dicionarioDeEquipes[_.idEquipeMandante].sigla,
                    visitante: dicionarioDeEquipes[_.idEquipeVisitante].nome,
                    visitanteSigla: dicionarioDeEquipes[_.idEquipeVisitante].sigla,
                    estadio: _.estadio,
                    rodada: _.rodada,
                    dataDaPartida: _.dataDaPartidaIso
                }
            });
        return partidasDaRodada;
    }


    utils.criarPastaSeNaoExistir(this.obterPastaCampeonato(idDoCampeonato));

    const equipes = await ObterDadosDasEquipes();
    const partidas = await ObterDadosDasPartidas();
    const partidasDaRodada = await ObterPartidasDaRodada(partidas.data, equipes);

    fs.writeFileSync(this.obterArquivoDeDados(), JSON.stringify({ rodada: numeroDaRodada, serie: serie, partidas: partidasDaRodada }));

    return this;
}

/*
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
    */