var spawn = require('child_process').spawn;
const fs = require('fs');
const fluent_ffmpeg = require('fluent-ffmpeg');

const pasta = './archive/20210813/clips2/';
let files = fs.readdirSync(pasta);

console.log(files);
console.log(files.map((_) => `${pasta}/${_}`));

let newFiles = files.map(_ => {
    const splited = _.split('-');
    const newName = splited[splited.length - 1];
    fs.copyFileSync(`${pasta}/${_}`, `${pasta}/${newName}`);
    fs.rmSync(`${pasta}/${_}`);
    return newName;
})
files = newFiles;

const sortedFiles = files.sort((a, b) => ~~a.replace('.ts', '') - ~~b.replace('.ts', ''));
console.log(sortedFiles);

const mergedVideo = fluent_ffmpeg();

for (var f of sortedFiles) {
    mergedVideo.mergeAdd(`${pasta}/${f}`);
}

mergedVideo.mergeToFile(`${pasta}./mergedVideo.mp4`)
.on('error', function(err) {
    console.log('Error ' + err.message);
})
.on('end', function() {
    console.log('Finished!');
});

// let newFiles = files.map(_ => {
//     const splited = _.split('-');
//     const newName = splited[splited.length - 1];
//     fs.copyFileSync(`${pasta}/${_}`, `${pasta}/${newName}`);
//     fs.rmSync(`${pasta}/${_}`);
//     return newName;
// })
// newFiles = newFiles.sort((a,b) => ~~b.replace('.ts', '') - ~~a.replace('.ts', ''));

// return;

// var cmd = 'ffmpeg';

// var args = [
//     '-i',
//     `"concat:${fil}"`
// ];

// var proc = spawn(cmd, args);

// proc.stdout.on('data', function(data) {
//     console.log(data);
// });

// proc.stderr.setEncoding("utf8")
// proc.stderr.on('data', function(data) {
//     console.log(data);
// });

// proc.on('close', function() {
//     console.log('finished');
// });
