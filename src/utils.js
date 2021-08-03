const fs = require('fs');
const jimp = require('jimp');
const crypto = require('crypto');
const moment = require('moment');
const axios = require('axios');

module.exports = {
    criarPastaSeNaoExistir(pasta) {
        if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });
    },
    cortarImagem(imagem, { x, y, width, height }, enchimento = 0) {
        jimp.read(imagem).then((_) => _.crop(~~x - enchimento, ~~y - enchimento, ~~width + enchimento * 2, ~~height + enchimento * 2).write(imagem));
    },
    aleatorio(min = 0, max = 0) {
        if (min || max) return Math.floor(Math.random() * (max - min)) + min;
        return moment().format('yyyyMMDDhhmmss');
    },
    hoje(format = 'yyyyMMDDhhmmss') {
        return moment().format(format);
    },
    sleep: async (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000)),
    escreverArquivo(arquivo, objeto) {
        fs.writeFileSync(arquivo, JSON.stringify(objeto));
    },
    isToday(referencia) {
        return moment(referencia).isSame(moment(), 'day');
    },
    isInThisWeek(referencia) {
        const domingo = moment().weekday(0).hour(0).minute(0).second(0);
        const sabado = moment().weekday(7).hour(23).minute(59).second(59);
        return moment(referencia).isBetween(domingo, sabado);
    },
    isAfterToday(referencia) {
        return moment(referencia).isAfter(moment());
    },
    existeArquivo(arquivo) {
        return fs.existsSync(arquivo);
    },
    async baixarArquivo(url, pasta) {
        const writer = fs.createWriteStream(pasta);

        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    },
};

// function x() {

//     var names = [];

//     var arr = ['mi', 'chel', 'che', 'ch', 'he', 'hel', 'el', 'sa', 'san', 'ta', 'na', 'oli', 'li', 'vei', 've', 'ei', 'ra', 'sam', 'pa', 'io', 'paio'];

//     arr.forEach(a => {
//         arr.forEach(b => {
//             var ab = `${a}${b}`;
//             if (names.indexOf(ab) == -1 && a != b) names.push(ab);

//             if (a != b) {
//                 arr.forEach(c => {
//                     var abc = `${a}${b}${c}`;
//                     if (names.indexOf(abc) == -1) names.push(abc);
//                     if (b != c) {
//                         arr.forEach(d => {
//                             var abcd = `${a}${b}${c}${d}`;
//                             if (names.indexOf(abcd) == -1) names.push(abcd);
//                         });
//                     }
//                 });
//             }

//         });
//     });

// }
