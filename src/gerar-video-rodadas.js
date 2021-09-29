const moment = require('moment');
const fs = require('fs');

const servicoDados = require('./services/rodada/extrair-json-campeonato');
const servicoTabela = require('./services/rodada/extrair-tabela-rodada-google');
const servicoAtributosDoVideo = require('./services/rodada/gerar-atributos-video');

const servicoGerarCard = require('./services/gerar-card');
const servicoGerarFala = require('./services/gerar-fala');
const servicoGerarVideo = require('./services/gerar-video');
const servicoDiscurso = require('./services/gerar-discurso');

const pastas = require('./gerenciador-pastas');
const utils = require('./utils');

const campeonatosConfig = {
    A: {
        idDoCampeonato: 767,
        serie: 'A',
    },
    B: {
        idDoCampeonato: 769,
        serie: 'B',
    },
};

module.exports = async function (serie = 'a', numeroDaRodada = 14, numeroDoVideo = 99) {
    //(async() => {
    serie = serie.toUpperCase();

    let uniqueId = utils.aleatorio(1, 10);
    uniqueId = `${serie}-SRV-RODADA-${utils.hoje('DDMM')}`;

    const config = campeonatosConfig[serie];
    const idDoCampeonato = config.idDoCampeonato;

    const obterArquivoDoWorkflow = () => `${pastas.obterPastaArquivosDoDia()}/${uniqueId}-${idDoCampeonato}-${numeroDaRodada}_workflow-rodadas.json`;

    function Workflow(object) {
        object = object || {};
        this.uniqueId = object.uniqueId;
        this.idDoCampeonato = object.idDoCampeonato;
        this.numeroDaRodada = object.numeroDaRodada;

        this.arquivoDeDadosProcessado = object.arquivoDeDadosProcessado;
        this.arquivoDeDados = object.arquivoDeDados;

        this.arquivoDaTabelaProcessado = object.arquivoDaTabelaProcessado;
        this.arquivoDaTabela = object.arquivoDaTabela;

        this.arquivoDoPostProcessado = object.arquivoDoPostProcessado;
        this.arquivoDoPost = object.arquivoDoPost;

        this.arquivoDoDiscursoProcessado = object.arquivoDoDiscursoProcessado;
        this.arquivoDoDiscurso = object.arquivoDoDiscurso;

        this.arquivoDeAudioProcessado = object.arquivoDeAudioProcessado;
        this.arquivoDeAudio = object.arquivoDeAudio;

        this.arquivoDeVideoProcessado = object.arquivoDeVideoProcessado;
        this.arquivoDeVideo = object.arquivoDeVideo;
    }

    let workflow = new Workflow();

    if (fs.existsSync(obterArquivoDoWorkflow())) workflow = new Workflow(JSON.parse(fs.readFileSync(obterArquivoDoWorkflow()).toString()));
    else workflow = new Workflow({ uniqueId: uniqueId });

    const obterArquivoDeDados = async () => {
        if (workflow.arquivoDeDados) return workflow.arquivoDeDados;

        const arquivoDosDados = (await servicoDados(uniqueId, idDoCampeonato, serie, numeroDaRodada)).obterArquivoDeDados();

        if (arquivoDosDados) {
            workflow.arquivoDeDados = arquivoDosDados;
            workflow.arquivoDeDadosProcessado = true;
            fs.writeFileSync(obterArquivoDoWorkflow(), JSON.stringify(workflow));
        }

        return arquivoDosDados;
    };

    const obterArquivoDaTabela = async () => {
        if (workflow.arquivoDaTabela) return workflow.arquivoDaTabela;

        const arquivoDaTabela = (await servicoTabela(uniqueId, serie, numeroDaRodada)).obterArquivoDaTabela();

        if (arquivoDaTabela) {
            workflow.arquivoDaTabela = arquivoDaTabela;
            workflow.arquivoDaTabelaProcessado = true;
            fs.writeFileSync(obterArquivoDoWorkflow(), JSON.stringify(workflow));
        }

        return arquivoDaTabela;
    };

    const obterArquivoDoPost = async (arquivoDaTabela) => {
        if (workflow.arquivoDoPostProcessado) return workflow.arquivoDoPost;

        const arquivoDoPost = (
            await servicoGerarCard(arquivoDaTabela, 'Calendário', `Jogos da ${numeroDaRodada}º Rodada - Serie ${serie}`, moment().format('DD/MM/yyyy'))
        ).obterArquivoPostagem();

        if (arquivoDoPost) {
            workflow.arquivoDoPost = arquivoDoPost;
            workflow.arquivoDoPostProcessado = true;
            fs.writeFileSync(obterArquivoDoWorkflow(), JSON.stringify(workflow));
        }

        return arquivoDoPost;
    };

    const obterDiscurso = async (dadosJson) => {
        if (workflow.arquivoDoDiscursoProcessado) return workflow.arquivoDoDiscurso;

        const geradorDiscurso = await servicoDiscurso(uniqueId);
        const discurso = await geradorDiscurso.gerarDiscursoJogosDaSemana(dadosJson);
        const arquivoDiscurso = discurso.obterArquivoDiscursoJogosDaRodada();

        if (arquivoDiscurso) {
            workflow.arquivoDoDiscurso = discurso.obterArquivoDiscursoJogosDaRodada();
            workflow.arquivoDoDiscursoProcessado = true;
            fs.writeFileSync(obterArquivoDoWorkflow(), JSON.stringify(workflow));
        }

        return arquivoDiscurso;
    };

    const obterAudio = async (textoDiscurso) => {
        // if (workflow.arquivoDeAudioProcessado) return workflow.arquivoDeAudio;

        // const geradorDeFala = await servicoGerarFala(uniqueId);
        // const arquivoDeAudio = (await geradorDeFala.gerarArquivoDeAudio(textoDiscurso)).obterArquivoDeAudio();

        // if (arquivoDeAudio) {
        //     workflow.arquivoDeAudio = arquivoDeAudio;
        //     workflow.arquivoDeAudioProcessado = true;
        //     fs.writeFileSync(obterArquivoDoWorkflow(), JSON.stringify(workflow));
        // }

        // return arquivoDeAudio;

        if (workflow.arquivoDeAudioProcessado) return workflow.arquivoDeAudio;

        const geradorDeFala = await servicoGerarFala(uniqueId)
            .SalvarEm(pastas.obterPastaArquivosDoDia(), `${uniqueId}_IBMAUDIO_RODADA`)
            .DefinirDiscurso(fs.readFileSync(arquivoDoDiscurso).toString())
            .ExecutarRobo();

        if (geradorDeFala.obterArquivoDestino()) {
            workflow.arquivoDeAudio = geradorDeFala.obterArquivoDestino();
            workflow.arquivoDeAudioProcessado = true;
            fs.writeFileSync(obterArquivoDoWorkflow(), JSON.stringify(workflow));
        }

        return geradorDeFala.obterArquivoDestino();
    };

    const obterVideo = async (arquivoDoPost, arquivoDeAudio) => {
        if (workflow.arquivoDeVideoProcessado) return workflow.arquivoDeVideo;

        const geradorVideo = await servicoGerarVideo(uniqueId);
        const video = (await geradorVideo.gerarVideo(arquivoDoPost, arquivoDeAudio)).obterArquivoVideo();

        if (video) {
            workflow.arquivoDeVideo = video;
            workflow.arquivoDeVideo = true;
            fs.writeFileSync(obterArquivoDoWorkflow(), JSON.stringify(workflow));
        }

        return video;
    };

    const dadosJson = await obterArquivoDeDados();

    const tabelaClassificacao = await obterArquivoDaTabela();

    const arquivoDoPost = await obterArquivoDoPost(tabelaClassificacao);

    const arquivoDoDiscurso = await obterDiscurso(dadosJson);

    const arquivoDeAudio = await obterAudio(arquivoDoDiscurso);

    const video = await obterVideo(arquivoDoPost, arquivoDeAudio);

    servicoAtributosDoVideo(uniqueId).obterTituloDoVideo(numeroDoVideo, numeroDaRodada, serie).obterDescricaoDoVideo(serie, numeroDaRodada);

    //})();
};
