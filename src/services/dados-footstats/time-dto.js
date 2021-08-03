module.exports = function (objetoDaRequisicao) {
    this.selecao = objetoDaRequisicao.selecao;
    this.torcedorNoSingular = objetoDaRequisicao.torcedorNoSingular;
    this.torcedorNoPlural = objetoDaRequisicao.torcedorNoPlural;
    this.timeFantasia = objetoDaRequisicao.timeFantasia;
    this.nome = objetoDaRequisicao.nome;
    this.cidade = objetoDaRequisicao.cidade;
    this.estado = objetoDaRequisicao.estado;
    this.pais = objetoDaRequisicao.pais;
    this.grupo = objetoDaRequisicao.grupo;
    this.isTimeGrande = objetoDaRequisicao.isTimeGrande;
    this.hasScout = objetoDaRequisicao.hasScout;
    this.urlLogo = objetoDaRequisicao.urlLogo;
    this.sigla = objetoDaRequisicao.sigla;
    this.idTecnico = objetoDaRequisicao.idTecnico;
    this.tecnico = objetoDaRequisicao.tecnico;
    this.sde = {
        equipe_id: objetoDaRequisicao.sde.equipe_id
    }
    this.id = objetoDaRequisicao.id;
    return this;
}