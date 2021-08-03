exports.up = function (knex) {
    return knex.schema.createTable('times', (table) => {

        table.string('id').primary();
        table.datetime('criacao').notNullable();
        table.datetime('alteracao').notNullable();

        table.boolean('selecao'); //: false,
        table.string('torcedorNoSingular'); //: "america",
        table.string('torcedorNoPlural'); //: "americas",
        table.boolean('timeFantasia'); //: false,
        table.string('nome').notNullable(); //: "América-MG",
        table.string('cidade'); //: "Belo Horizonte",
        table.string('estado'); //: "MG",
        table.string('pais'); //: "Brasil",
        table.string('grupo'); //: null,
        table.boolean('isTimeGrande'); //: false,
        table.string('hasScout'); //: true,
        table.string('urlLogo'); //: "https://frontendapiapp.blob.core.windows.net/images/88x88/america-mg.png",
        table.string('sigla'); //: "AMG",
        table.integer('idTecnico'); //: 54,
        table.string('tecnico'); //: "Vágner Mancini",
        
        table.string('origemDado').notNullable();
        table.string('ext_equipe_id').notNullable(); //: 327
        table.string('ext_id').notNullable(); //: 1085
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('times');
};