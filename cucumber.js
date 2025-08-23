// cucumber.js
module.exports = {
  default: {
    requireModule: ["ts-node/register"], // habilita TS sin loader
    require: ["tests/features/steps/**/*.ts"], // carga steps
    paths: ["tests/features/**/*.feature"], // busca features
    format: ["progress"],
  },
};
