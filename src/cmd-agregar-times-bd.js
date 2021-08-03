const repositorio = require('./database/repository');
const servicoDeDados = require('./services/dados-footstats/obter-dados-equipes');
const TimeModel = require('./services/dados-footstats/time-model');
const pastas = require('./gerenciador-pastas');
const utils = require('./utils');
const repositorioTimes = repositorio('times');

(async () => {
    const listaDeCampeonatos = [767, 769, 763, 754, 753, 752, 755];

    for (const campeonato of listaDeCampeonatos) {
        const obterPastaLogosDeTimes = () => `${pastas.obterPastaDeRecursos()}/logos/`;

        async function obterDadosDaAPI() {
            return await servicoDeDados(campeonato).obterDados();
        }

        async function salvarDados(listaDeTimes) {
            const resultados = {
                adicionados: [],
                atualizados: [],
            };
            for (const model of listaDeTimes) {
                const dbResult = await repositorioTimes.First({
                    ext_id: model.ext_id,
                });
                if (dbResult) {
                    const encontrado = new TimeModel(dbResult);
                    encontrado.alteracao = new Date();
                    const updateResult = await repositorioTimes.Update(encontrado.id, encontrado);
                    resultados.atualizados.push(updateResult);
                } else {
                    const addResult = await repositorioTimes.Add(model);
                    resultados.adicionados.push(addResult);
                }
            }
            return resultados;
        }

        async function salvarLogoTipos(listaDeTimes) {
            utils.criarPastaSeNaoExistir(obterPastaLogosDeTimes());
            for (const t of listaDeTimes) {
                const time = new TimeModel(t);

                time.caminhoLogoLocal = `${obterPastaLogosDeTimes()}/LOGO_${time.sigla}.png`;

                if (time.caminhoLogoLocal && utils.existeArquivo(time.caminhoLogoLocal)) continue;

                await utils.baixarArquivo(time.urlLogo, time.caminhoLogoLocal);
                await repositorioTimes.Update(time.id, time);
            }
        }

        async function obterTodosOsTimes() {
            return await repositorioTimes.All();
        }

        const resultadoDosDados = await obterDadosDaAPI();

        const resultadoSalvarDados = await salvarDados(resultadoDosDados.modelList());

        const todosOsTimes = await obterTodosOsTimes();

        await salvarLogoTipos(todosOsTimes);
    }
})();
