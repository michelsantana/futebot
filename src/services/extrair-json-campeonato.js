const axios = require('axios').default;
const fs = require('fs');
const moment = require('moment');
const pastas = require('./../gerenciador-pastas');
const utils = require('./../utils');

const gerarUrlDadosCampeonato = (idCampeonato) => `https://footstatsapiapp.azurewebsites.net/campeonatos/${idCampeonato}/calendario`;
const gerarUrlDadosRodada = (idCampeonato, rodada) => `https://apifutebol.footstats.com.br/3.1/campeonatos/${idCampeonato}/partidas/rodada/${rodada}`;

const obterPastaCampeonato = () => `${pastas.obterPastaArquivos()}/brasileiraoseriea`;
const obterArquivoDadosCampeonato = () => `${obterPastaCampeonato()}/dados-campeonato.json`;
const obterArquivoDadosRodada = (rodada) => `${obterPastaCampeonato()}/dados-rodada=${rodada}.json`;

const token = 'Bearer 72fa6abf-408'

async function Executar() {
    const idCampeonato = 767;
    const idRodada = 6;

    const urlCampeonato = gerarUrlDadosCampeonato(idCampeonato);
    const urlRodada = gerarUrlDadosRodada(idCampeonato, idRodada);

    utils.criarPastaSeNaoExistir(obterPastaCampeonato());

    if (!fs.existsSync(obterArquivoDadosCampeonato())) fs.writeFileSync(`${obterArquivoDadosCampeonato()}`, '{}');

    const tentaBuscarAtualizarDadosDoCampeonato = async () => {
        try {
            const result = await axios.get(urlCampeonato);
            if (result.data) fs.writeFileSync(`${obterArquivoDadosCampeonato()}`, JSON.stringify(result.data));
        }
        catch (e) {
            console.log('Erro ao buscar dados do campeonato');
            console.log(e);
        }
    }

    const lerArquivoDeDadosDoCampeonato = async () => {
        return JSON.parse(fs.readFileSync(obterArquivoDadosCampeonato()));
    }

    const extrairDadosDaRodada = async () => {
        try {
            const result = await axios.get(urlRodada, { headers: { "Authorization": token } });
            if (result.data) fs.writeFileSync(`${pastas.obterArquivoDadosRodada(idRodada)}`, JSON.stringify(result.data))
        } catch (e) {
            console.log('Erro ao buscar dados da rodada');
            console.error(e);
        }
    }

    await tentaBuscarAtualizarDadosDoCampeonato();
    const campeonato = await lerArquivoDeDadosDoCampeonato();
    const rodadasDoCampeonato = await extrairDadosDaRodada();
    const dados = campeonato.data.filter(_ =>
        _.dataDaPartida
        && ~~_.dataDaPartida.dayOfYear > 0
        && utils.isInThisWeek(new Date(2021, 0, ~~_.dataDaPartida.dayOfYear))
    );
    fs.writeFileSync(`${pastas.obterPastaArquivosDoDia()}/jogos-da-semana.json`, JSON.stringify(dados));
}

Executar();

module.exports = { Executar }