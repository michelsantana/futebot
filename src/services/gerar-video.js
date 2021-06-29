const fs = require('fs');
const videoshow = require('../../lib/videoshow');
const mp3Duration = require('mp3-duration');
const pastas = require('./../gerenciador-pastas');


module.exports = async function (uniqueId) {
    this.obterArquivoVideo = () => `${pastas.obterPastaArquivosDoDia()}/${uniqueId}_video.mp4`;

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

    this.gerarVideo = async (arquivoDoPost, arquivoDeAudio) => {
        const currentSettings = Object.assign(videoOptions, {});
        await mp3Duration(arquivoDeAudio, function (err, duration) {
            if (err) return console.log(err.message);
            console.log('Your file is ' + duration + ' seconds long');
            currentSettings.loop = duration;
        });

        await videoshow([`${arquivoDoPost}`], currentSettings)
            .audio(arquivoDeAudio)
            .save(this.obterArquivoVideo())
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
        return this;
    }


    return this;
}