const fs = require('fs');
const jimp = require('jimp');
const crypto = require('crypto');
const moment = require('moment');
const { promisify } = require('util');

module.exports = {
    criarPastaSeNaoExistir(pasta) {
        if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });
    },
    cortarImagem(imagem, { x, y, width, height }, enchimento = 0) {
        jimp.read(imagem).then(_ => _
            .crop(~~x - enchimento, ~~y - enchimento, ~~width + enchimento * 2, ~~height + enchimento * 2)
            .write(imagem)
        );
    },
    aleatorio(min = 0, max = 0) {
        if (min || max) return Math.floor(Math.random() * (max - min)) + min;
        return moment().format('yyyyMMDDhhmmss');
    },
    hoje(format = 'yyyyMMDDhhmmss') {
        return moment().format(format);
    },
    sleep: async (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000)),
    escreverArquivo(arquivo, objeto) {
        fs.writeFileSync(arquivo, JSON.stringify(objeto))
    }
}