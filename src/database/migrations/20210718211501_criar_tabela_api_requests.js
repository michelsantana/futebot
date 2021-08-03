
exports.up = function(knex) {
    return knex.schema.createTable('httprequests', (table) => {

        table.string('id').primary();
        table.datetime('criacao').notNullable();
        table.datetime('alteracao').notNullable();

        table.string('url').notNullable();
        table.string('metodo').notNullable();
        table.string('request');
        table.string('response');
        table.boolean('sucesso').notNullable();
        table.string('erro').notNullable(); 
    });
};

exports.down = function(knex) {
  
};
