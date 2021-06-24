const fs = require('fs');
const path = require('path');
const moment = require('moment');
const utils = require('./utils');

require('dotenv').config();
const caminhoPastaSaidaDosArquivos = process.env.caminhoPastaSaidaDosArquivos || './archive/';
const caminhoPastaDownloadPadraoChromium = process.env.caminhoPastaDownloadPadraoChromium || '%USERPROFILE%/Downloads/';

const obterPastaArquivos = () => `${caminhoPastaSaidaDosArquivos}/`;
const obterPastaArquivosDoDia = () => `${caminhoPastaSaidaDosArquivos}/${moment().format('yyyyMMDD')}/`;
const obterPastaDownloadsChrome = () => `${caminhoPastaDownloadPadraoChromium}/`;
const obterPastaDeRecursos = () => `./resources/`;

utils.criarPastaSeNaoExistir(obterPastaArquivos());
utils.criarPastaSeNaoExistir(obterPastaArquivosDoDia());
utils.criarPastaSeNaoExistir(obterPastaDownloadsChrome());
utils.criarPastaSeNaoExistir(obterPastaDeRecursos());

module.exports = {  
    obterPastaArquivos,
    obterPastaArquivosDoDia,
    obterPastaDownloadsChrome,
    obterPastaDeRecursos
}