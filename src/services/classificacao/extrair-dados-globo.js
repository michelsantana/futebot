const pptr = require('puppeteer');
const cheerio = require('cheerio');
const utils = require('./../../utils');
const pastas = require('./../../gerenciador-pastas');


module.exports = async function (uniqueId, serie) {

    this.dadosJson = null;
    const nomeDoJson = `classificacao-serie-${serie}.json`;
    this.obterArquivoJson = () => `${pastas.obterPastaArquivosDoDia()}${uniqueId}_${nomeDoJson}`;
    this.obterDadosJson = () => this.dadosJson;

    const url = `https://ge.globo.com/futebol/brasileirao-serie-${serie.toLowerCase()}/`;

    const browser = await pptr.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1550, height: 5000 });

    this.navegarParaPagina = async () => {
        try { await page.goto(url, { waitUntil: 'networkidle2' }); }
        catch (e) { await page.goto(url, { waitUntil: 'networkidle2' }); }
    }

    this.esperarCarregar = async () => {
        await page.waitForSelector('.tabela__futebol');
        await utils.sleep(1);
    }

    this.extrairDadosJson = async () => {
        const html = await page.evaluate(() => window.$('.tabela__futebol').html());
        const $ = cheerio.load(html);

        const linhasTabelaEquipe = await $('table').eq(0).find('tbody tr').get();
        const linhasTabelaPontos = await $('table').eq(1).find('tbody tr').get();
        const colunasEquipe = {
            classificacao: 0,
            time: 1,
            variacao: 2
        };
        const colunasPontos = {
            pontos: 0,
            jogos: 1,
            vitorias: 2,
            empates: 3,
            derrotas: 4,
            golPro: 5,
            golContra: 6,
            saldoGols: 7,
            percentual: 8,
            ultimosJogos: 9,
        }

        const resultado = [];
        const objetoTabela = function (
            classificacao,
            time,
            sigla,
            variacao,
            pontos,
            jogos,
            vitorias,
            empates,
            derrotas,
            golPro,
            golContra,
            saldoGols,
            percentual,
            ultimosJogos
        ) {
            this.classificacao = classificacao;
            this.time = time;
            this.sigla = sigla;
            this.variacao = variacao;
            this.pontos = pontos;
            this.jogos = jogos;
            this.vitorias = vitorias;
            this.empates = empates;
            this.derrotas = derrotas;
            this.golPro = golPro;
            this.golContra = golContra;
            this.saldoGols = saldoGols;
            this.percentual = percentual;
            this.ultimosJogo = ultimosJogos;
            return this;
        }

        const extrairTime = (el) => {
            const td = $(el).find('td').eq(colunasEquipe.time);

            const nmTime = td.find('strong').text();
            const siglaTime = td.find('span').text();

            return [`${nmTime}`, `${siglaTime}`];
        }

        const extrairVariacao = (el) => {
            const td = $(el).find('td').eq(colunasEquipe.variacao);
            const valorVariacao = ~~td.text();
            if (td.find('.classificacao__icone--negativa').length > 0)
                return -valorVariacao;
            return valorVariacao;
        }

        const extrairHistorico = (el) => {
            const historico = [];
            const td = $(el).find('td').eq(colunasPontos.ultimosJogos);
            td.find('span').get().forEach((e) => {
                if ($(e).is('.classificacao__ultimos_jogos--v')) historico.push('vitória');
                if ($(e).is('.classificacao__ultimos_jogos--e')) historico.push('empate');
                if ($(e).is('.classificacao__ultimos_jogos--d')) historico.push('derrota');
            });
            return historico;
        }

        linhasTabelaEquipe.forEach((_, tr) => {
            const linhaEquipe = linhasTabelaEquipe[tr];
            const linhaPontos = linhasTabelaPontos[tr];
            const time = extrairTime(linhaEquipe);
            resultado.push(
                new objetoTabela(
                    $(linhaEquipe).find('td').eq(colunasEquipe.classificacao).text(),
                    time[0],
                    time[1],
                    extrairVariacao(linhaEquipe),
                    $(linhaPontos).find('td').eq(colunasPontos.pontos).text(),
                    $(linhaPontos).find('td').eq(colunasPontos.jogos).text(),
                    $(linhaPontos).find('td').eq(colunasPontos.vitorias).text(),
                    $(linhaPontos).find('td').eq(colunasPontos.empates).text(),
                    $(linhaPontos).find('td').eq(colunasPontos.derrotas).text(),
                    $(linhaPontos).find('td').eq(colunasPontos.golPro).text(),
                    $(linhaPontos).find('td').eq(colunasPontos.golContra).text(),
                    $(linhaPontos).find('td').eq(colunasPontos.saldoGols).text(),
                    $(linhaPontos).find('td').eq(colunasPontos.percentual).text(),
                    extrairHistorico(linhaPontos)
                )
            );
            console.log();
        });

        return resultado;
    }

    await navegarParaPagina();
    await esperarCarregar();
    this.dadosJson = await extrairDadosJson();
    utils.escreverArquivo(this.obterArquivoJson(), { serie: serie, classificacao: this.dadosJson });

    browser.close();

    return this;
}
