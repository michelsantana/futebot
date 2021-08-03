
exports.up = function (knex) {
    return knex.schema.table('times', function (table) {

        table.string('nomeAdaptadoWatson');

    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('times', function (table) {

        table.dropColumn('nomeAdaptadoWatson');

    });
};
