const gTTS = require('gtts');

var speech = 'Olá meus queridos! Segue a tabela do campeonato atualizada hoje! 20/06/2021';
var gtts = new gTTS(speech, 'pt-BR');

gtts.save('Voice.mp3', function (err, result) {
    if (err) { throw new Error(err); }
    console.log("Text to speech converted!");
});
