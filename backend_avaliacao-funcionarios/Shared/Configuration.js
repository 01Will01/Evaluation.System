/* importar o módulo do framework express */
const express = require("express");

/* importar o módulo do cors */
var cors = require("cors");

/* importar o módulo do consign */
const consign = require("consign");

const build = express();
build.use(express.json());

build.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    build.use(cors());
    next();
});

consign()
    .include("Infra/Data/Migrations/StartMigration.js")
    .then("App/Controllers")
    .then("Domain/Services")
    .then("Domain/Scheduler")
    .then("Infra/Data/Repositories")
    .into(build);

module.exports = build;