const fs = require('fs');
const videoshow = require('../../lib/videoshow');
const mp3Duration = require('mp3-duration');
const pastas = require('./../gerenciador-pastas');

const obterArquivoVideo = () => `${pastas.obterPastaArquivosDoDia()}/video.mp4`;

var videoOptions = {
    loop: 5,
    fps: 25,
    transition: true,
    transitionDuration: 1, // seconds
    videoBitrate: 1024,
    videoCodec: "libx264",
    size: "1080x?",
    audioBitrate: "128k",
    audioChannels: 2,
    format: "mp4",
    pixelFormat: "yuv420p",
};

const Executar = async (postagem, audio) => {

    const currentSettings = Object.assign(videoOptions, {});
    await mp3Duration(audio, function (err, duration) {
        if (err) return console.log(err.message);
        console.log('Your file is ' + duration + ' seconds long');
        currentSettings.loop = duration;
    });

    await videoshow([`${postagem}`], currentSettings)
        .audio(audio)
        .save(obterArquivoVideo())
        .on('start', function (command) {
            console.log('ffmpeg process started:', command);
        })
        .on('error', function (err, stdout, stderr) {
            console.error('Error:', err);
            console.error('ffmpeg stderr:', stderr);
        })
        .on('end', function (output) {
            console.error('Video created in:', output);

        });

}

module.exports = {
    Executar
}