module.exports = function (linhaDoBanco) {
    this.id = linhaDoBanco?.id;
    this.criacao = linhaDoBanco?.criacao;
    this.alteracao = linhaDoBanco?.alteracao;
    this.selecao = linhaDoBanco?.selecao;
    this.torcedorNoSingular = linhaDoBanco?.torcedorNoSingular;
    this.torcedorNoPlural = linhaDoBanco?.torcedorNoPlural;
    this.timeFantasia = linhaDoBanco?.timeFantasia;
    this.nome = linhaDoBanco?.nome;
    this.cidade = linhaDoBanco?.cidade;
    this.estado = linhaDoBanco?.estado;
    this.pais = linhaDoBanco?.pais;
    this.grupo = linhaDoBanco?.grupo;
    this.isTimeGrande = linhaDoBanco?.isTimeGrande;
    this.hasScout = linhaDoBanco?.hasScout;
    this.urlLogo = linhaDoBanco?.urlLogo;
    this.sigla = linhaDoBanco?.sigla;
    this.idTecnico = linhaDoBanco?.idTecnico;
    this.tecnico = linhaDoBanco?.tecnico;
    this.origemDado = linhaDoBanco?.origemDado;
    this.ext_equipe_id = linhaDoBanco?.ext_equipe_id;
    this.ext_id = linhaDoBanco?.ext_id;

    this.caminhoLogoLocal = linhaDoBanco.caminhoLogoLocal;
    this.nomeAdaptadoWatson = linhaDoBanco.nomeAdaptadoWatson;

    return this;
};
