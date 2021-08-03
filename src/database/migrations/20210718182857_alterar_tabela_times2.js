exports.up = function (knex) {
    return knex.schema.table("times", function (table) {
        table.string("caminhoLogoLocal");
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable("times", function (table) {
        table.dropColumn("caminhoLogoLocal");
    });
};
