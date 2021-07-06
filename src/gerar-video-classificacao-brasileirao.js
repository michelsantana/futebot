const moment = require('moment');
const fs = require('fs');

const servicoExtrairDadosGlobo = require('./services/classificacao/extrair-dados-globo');
const servicoExtrairTabelaGoogle = require('./services/classificacao/extrair-tabela-google');
//const servicoAtributosDoVideo = require('./services/classificacao/gerar-atributos-video');

const servicoGerarCard = require('./services/gerar-card');
const servicoGerarFala = require('./services/gerar-fala');
const servicoGerarVideo = require('./services/gerar-video');
const servicoDiscurso = require('./services/gerar-discurso');

const pastas = require('./gerenciador-pastas');
const utils = require('./utils');

(async () => {
    //const uniqueId = 'teste';
    const uniqueId = `SB-${utils.aleatorio(100000, 1000000)}`;
    const serie = 'B';

    const obterArquivoDoWorkflow = () => `${pastas.obterPastaArquivosDoDia()}/${uniqueId}workflow-brasileirao.json`;
    function Workflow(object) {
        this.uniqueId = object?.uniqueId;

        this.arquivoDeDadosProcessado = object?.arquivoDeDadosProcessado;
        this.arquivoDeDados = object?.arquivoDeDados;

        this.arquivoDaTabelaProcessado = object?.arquivoDaTabelaProcessado;
        this.arquivoDaTabela = object?.arquivoDaTabela;

        this.arquivoDoPostProcessado = object?.arquivoDoPostProcessado;
        this.arquivoDoPost = object?.arquivoDoPost;

        this.arquivoDoDiscursoProcessado = object?.arquivoDoDiscursoProcessado;
        this.arquivoDoDiscurso = object?.arquivoDoDiscurso;

        this.arquivoDeAudioProcessado = object?.arquivoDeAudioProcessado;
        this.arquivoDeAudio = object?.arquivoDeAudio;

        this.arquivoDeVideoProcessado = object?.arquivoDeVideoProcessado;
        this.arquivoDeVideo = object?.arquivoDeVideo;
    }

    let workflow = new Workflow();

    if (fs.existsSync(obterArquivoDoWorkflow()))
        workflow = new Workflow(JSON.parse(fs.readFileSync(obterArquivoDoWorkflow()).toString()));
    else
        workflow = new Workflow({ uniqueId: uniqueId });

    const obterDadosJson = async () => {

        if (workflow.arquivoDeDadosProcessado)
            return workflow.arquivoDeDados;

        const servicoJson = (await servicoExtrairDadosGlobo(uniqueId, serie));
        const arquivoDeDados = servicoJson.obterArquivoJson();

        if (arquivoDeDados) {
            workflow.arquivoDeDados = arquivoDeDados;
            workflow.arquivoDeDadosProcessado = true;
            fs.writeFileSync(obterArquivoDoWorkflow(), JSON.stringify(workflow));
        }

        return arquivoDeDados;
    }

    const obterTabelaClassificacao = async () => {
        if (workflow.arquivoDaTabelaProcessado)
            return workflow.arquivoDaTabela;

        const servicoTabela = (await servicoExtrairTabelaGoogle(uniqueId, serie));
        const tabelaClassificacao = servicoTabela.obterArquivoDaTabela();

        if (tabelaClassificacao) {
            workflow.arquivoDaTabela = tabelaClassificacao;
            workflow.arquivoDaTabelaProcessado = true;
            fs.writeFileSync(obterArquivoDoWorkflow(), JSON.stringify(workflow));
        }

        return tabelaClassificacao;
    }

    const obterArquivoDoPost = async (tabelaClassificacao) => {
        if (workflow.arquivoDoPostProcessado)
            return workflow.arquivoDoPost;

        const arquivoDoPost = (await servicoGerarCard(tabelaClassificacao,
            'Classificação atualizada!', `Brasileirão Série ${serie.toUpperCase()}`, moment().format('DD/MM/yyyy')))
            .obterArquivoPostagem();

        if (arquivoDoPost) {
            workflow.arquivoDoPost = arquivoDoPost;
            workflow.arquivoDoPostProcessado = true;
            fs.writeFileSync(obterArquivoDoWorkflow(), JSON.stringify(workflow));
        }

        return arquivoDoPost;
    }

    const obterDiscurso = async (arquivoDeDados) => {
        if (workflow.arquivoDoDiscursoProcessado)
            return workflow.arquivoDoDiscurso;

        const geradorDiscurso = (await servicoDiscurso(uniqueId));
        const discurso = (await geradorDiscurso.gerarDiscursoClassificacaoSerieA(arquivoDeDados));
        const arquivoDoDiscurso = discurso.obterArquivoDiscursoClassificacaoSerieA();

        if (arquivoDoDiscurso) {
            workflow.arquivoDoDiscurso = discurso.obterArquivoDiscursoClassificacaoSerieA();
            workflow.arquivoDoDiscursoProcessado = true;
            fs.writeFileSync(obterArquivoDoWorkflow(), JSON.stringify(workflow));
        }

        return arquivoDoDiscurso;
    }

    const obterAudio = async (textoDiscurso) => {
        if (workflow.arquivoDeAudioProcessado)
            return workflow.arquivoDeAudio;

        const geradorDeFala = (await servicoGerarFala(uniqueId));
        const arquivoDeAudio = (await geradorDeFala.gerarArquivoDeAudio(textoDiscurso)).obterArquivoDeAudio();

        if (arquivoDeAudio) {
            workflow.arquivoDeAudio = arquivoDeAudio;
            workflow.arquivoDeAudioProcessado = true;
            fs.writeFileSync(obterArquivoDoWorkflow(), JSON.stringify(workflow));
        }

        return arquivoDeAudio;
    }

    const obterVideo = async (arquivoDoPost, arquivoDeAudio) => {
        if (workflow.arquivoDeVideoProcessado)
            return workflow.arquivoDeVideo;

        const geradorVideo = await servicoGerarVideo(uniqueId);
        const video = (await geradorVideo.gerarVideo(arquivoDoPost, arquivoDeAudio)).obterArquivoVideo();
        
        if (video) {
            workflow.arquivoDeVideo = video;
            workflow.arquivoDeVideo = true;
            fs.writeFileSync(obterArquivoDoWorkflow(), JSON.stringify(workflow));
        }

        return video;
    }

    const dadosJson = await obterDadosJson();
    const tabelaClassificacao = await obterTabelaClassificacao();

    const arquivoDoPost = await obterArquivoDoPost(tabelaClassificacao);

    const arquivoDoDiscurso = await obterDiscurso(dadosJson);

    const arquivoDeAudio = await obterAudio(arquivoDoDiscurso);

    const video = await obterVideo(arquivoDoPost, arquivoDeAudio);

})();