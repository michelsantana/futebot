module.exports = function (linhaDoBanco) {
    this.id = linhaDoBanco?.id;
    this.criacao = linhaDoBanco?.criacao || new Date();
    this.alteracao = linhaDoBanco?.alteracao || new Date();
    
    this.url = linhaDoBanco?.url;
    this.metodo = linhaDoBanco?.metodo;
    this.request = linhaDoBanco?.request;
    this.response = linhaDoBanco?.response;
    this.sucesso = linhaDoBanco?.sucesso;
    this.erro = linhaDoBanco?.erro;
    return this;
};
