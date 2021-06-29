const moment = require('moment');
const fs = require('fs');
const pastas = require('./gerenciador-pastas');

const servicoDados = require('./services/rodada/extrair-json-campeonato');
const servicoTabela = require('./services/rodada/extrair-tabela-rodada-google');

const servicoGerarCard = require('./services/gerar-card');
const servicoGerarFala = require('./services/gerar-fala');
const servicoGerarVideo = require('./services/gerar-video');
const servicoDiscurso = require('./services/gerar-discurso');

(async () => {

    const uniqueId = 'x-teste-rodada';
    const numeroDaRodada = 8;
    const idDoCampeonato = 767;

    const obterArquivoDoWorkflow = () => `${pastas.obterPastaArquivosDoDia()}/${uniqueId}-${idDoCampeonato}-${numeroDaRodada}_workflow-rodadas.json`;
    
    function Workflow(object) {
        this.uniqueId = object?.uniqueId;
        this.idDoCampeonato = object?.idDoCampeonato;
        this.numeroDaRodada = object?.numeroDaRodada;

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

    const obterArquivoDeDados = async () => {

        if (workflow.arquivoDeDados) return workflow.arquivoDeDados; 

        const arquivoDosDados = (await servicoDados(uniqueId, idDoCampeonato, numeroDaRodada)).obterArquivoDeDados();

        if (arquivoDosDados) {
            workflow.arquivoDeDados = arquivoDosDados;
            workflow.arquivoDeDadosProcessado = true;
            fs.writeFileSync(obterArquivoDoWorkflow(), JSON.stringify(workflow));
        }

        return arquivoDosDados;
    }

    const obterArquivoDaTabela = async () => {

        if (workflow.arquivoDaTabela) return workflow.arquivoDaTabela;

        const arquivoDaTabela = (await servicoTabela(uniqueId, numeroDaRodada)).obterArquivoDaTabela();

        if (arquivoDaTabela) {
            workflow.arquivoDaTabela = arquivoDaTabela;
            workflow.arquivoDaTabelaProcessado = true;
            fs.writeFileSync(obterArquivoDoWorkflow(), JSON.stringify(workflow));
        }

        return arquivoDaTabela;
    }

    const obterArquivoDoPost = async (arquivoDaTabela) => {

        if (workflow.arquivoDoPostProcessado) return workflow.arquivoDoPost;

        const arquivoDoPost = (await servicoGerarCard(arquivoDaTabela,
            'Calendário', `Jogos da Rodada ${numeroDaRodada}`, moment().format('DD/MM/yyyy')))
            .obterArquivoPostagem();

        if (arquivoDoPost) {
            workflow.arquivoDoPost = arquivoDoPost;
            workflow.arquivoDoPostProcessado = true;
            fs.writeFileSync(obterArquivoDoWorkflow(), JSON.stringify(workflow));
        }

        return arquivoDoPost;
    }

    const obterDiscurso = async (dadosJson) => {
        if (workflow.arquivoDoDiscursoProcessado)
            return workflow.arquivoDoDiscurso;

        const geradorDiscurso = (await servicoDiscurso(uniqueId));
        const discurso = (await geradorDiscurso.gerarDiscursoJogosDaSemana(dadosJson));
        const arquivoDiscurso = discurso.obterArquivoDiscursoJogosDaRodada();

        if (arquivoDiscurso) {
            workflow.arquivoDoDiscurso = discurso.obterArquivoDiscursoJogosDaRodada();
            workflow.arquivoDoDiscursoProcessado = true;
            fs.writeFileSync(obterArquivoDoWorkflow(), JSON.stringify(workflow));
        }

        return arquivoDiscurso;
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

    const dadosJson = await obterArquivoDeDados();

    const tabelaClassificacao = await obterArquivoDaTabela();

    const arquivoDoPost = await obterArquivoDoPost(tabelaClassificacao);

    const arquivoDoDiscurso = await obterDiscurso(dadosJson);

    const arquivoDeAudio = await obterAudio(arquivoDoDiscurso);

    const video = await obterVideo(arquivoDoPost, arquivoDeAudio);


})();