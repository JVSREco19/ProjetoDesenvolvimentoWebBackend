const express = require("express");
const cors = require("cors");
const config = require("./config");
const bodyparser = require("body-parser");
const routes = require("./src/routes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyparser.json());
app.use(routes);


app.listen(config.port, () => {
  console.log("Servidor funcionando na porta: " + config.port);
});
