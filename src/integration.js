(async () => {
    "use strict";

    console.log(process.argv);
    const params = {};
    process.argv.forEach(_ => _.indexOf('=') > -1 ? params[_.split('=')[0]] = _.split('=')[1] : undefined);
    // cmd = [c, r] classficação ou rodada
    // sr = [a, b] letra da serie
    // rd = [1, 99] numero da rodada
    // nrv = [0, 99] numero do video

    console.log(params);
 
})();
