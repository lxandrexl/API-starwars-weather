// CJS para evitar dramas de ESM/loaders
const path = require("path");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const open = require("open");

const PORT = process.env.DOCS_PORT || 8080;
const SPEC_PATH = path.resolve(__dirname, "../docs/openapi.yml");

const app = express();
const spec = YAML.load(SPEC_PATH);

// opción: título y swaggerOptions
const options = {
  customSiteTitle: "API StarWars Weather – Docs",
};

app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec, options));

app.get("/", (_req, res) => res.redirect("/docs"));

app.listen(PORT, async () => {
  const url = `http://localhost:${PORT}/docs`;
  console.log(`Swagger UI sirviendo ${SPEC_PATH}`);
  console.log(`→ ${url}`);
  try {
    await open(url);
  } catch (_) {}
});
