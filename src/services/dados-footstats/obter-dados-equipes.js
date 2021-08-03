const axios = require('axios').default;
const fs = require('fs');
const moment = require('moment');
const pastas = require('./../../gerenciador-pastas');
const utils = require('./../../utils');
const TimeDTO = require('./time-dto');
const TimeModel = require('./time-model');
const HttpRequestModel = require('./http-requests-model');
const respositorioRequests = require('./../../database/repository')('httprequests');
const token = 'Bearer 72fa6abf-408';

module.exports = function (idDoCampeonato) {
    const gerarUrlDadosEquipes = () => `https://apifutebol.footstats.com.br/3.1/campeonatos/${idDoCampeonato}/equipes`;

    function converterDTOParaModel(dto) {
        const model = new TimeModel({});
        model.id = undefined;
        model.criacao = new Date();
        model.alteracao = new Date();

        model.selecao = dto?.selecao;
        model.torcedorNoSingular = dto?.torcedorNoSingular;
        model.torcedorNoPlural = dto?.torcedorNoPlural;
        model.timeFantasia = dto?.timeFantasia;
        model.nome = dto?.nome;
        model.cidade = dto?.cidade;
        model.estado = dto?.estado;
        model.pais = dto?.pais;
        model.grupo = dto?.grupo;
        model.isTimeGrande = dto?.isTimeGrande;
        model.hasScout = dto?.hasScout;
        model.urlLogo = dto?.urlLogo;
        model.sigla = dto?.sigla;
        model.idTecnico = dto?.idTecnico;
        model.tecnico = dto?.tecnico;

        model.origemDado = 'footstats';
        model.ext_equipe_id = dto?.sde?.equipe_id;
        model.ext_id = dto?.id;

        model.nomeAdaptadoWatson = dto?.nomeAdaptadoWatson;
        model.caminhoLogoLocal = dto?.caminhoLogoLocal;

        return model;
    }

    this.dto = [];
    this.model = [];

    this.dtoList = () => Array.from(dto).map((_) => new TimeDTO(_));
    this.modelList = () => Array.from(model).map((_) => new TimeModel(_));

    this.obterDados = async () => {
        const httpTrack = new HttpRequestModel({});
        httpTrack.url = gerarUrlDadosEquipes();
        httpTrack.request = JSON.stringify({ headers: { Authorization: token }, body: null });
        httpTrack.metodo = 'GET';

        const tryGet = async (fn) => {
            let response = { data: [] };
            try {
                response = await fn();
                httpTrack.response = JSON.stringify(response.data);
                httpTrack.erro = '';
                httpTrack.sucesso = true;
            } catch (ex) {
                httpTrack.erro = JSON.stringify(ex);
                httpTrack.sucesso = true;
            }
            await respositorioRequests.Add(httpTrack);
            return response;
        };
        const resultadoReq = await tryGet(() => axios.get(gerarUrlDadosEquipes(), { headers: { Authorization: token } }));

        const dados = resultadoReq.data.data;

        Array.from(dados).forEach((_) => {
            try {
                const d = new TimeDTO(_);
                if (!d.timeFantasia) {
                    this.dto.push(d);

                    const m = new TimeModel(converterDTOParaModel(d));
                    this.model.push(m);
                }
            } catch (ex) {
                console.log(ex);
            }
        });

        return this;
    };

    return this;
};
