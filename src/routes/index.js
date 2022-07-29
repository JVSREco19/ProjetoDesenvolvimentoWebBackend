const express = require("express");
var pg = require("pg");
const config = require("../../config");
var conString = config.urlConnection;
const routes = express.Router();

var client = new pg.Client(conString);
client.connect(function (err) {
  if (err) {
    return console.error("could not connect to postgres", err);
  }
  client.query('SELECT NOW() AS "theTime"', function (err, result) {
    if (err) {
      return console.error("error running query", err);
    }

    console.log(result.rows[0].theTime);
    // >> output: 2018-08-23T14:02:57.117Z
  });
});

routes.get("/", (req, res) => {
  console.log("Response ok.");
  res.send("Ok");
});

routes.get("/images", (req, res) => {
  client.query("SELECT * from images", function (err, result) {
    if (err) {
      return console.error("error running query", err);
    }
    console.log(result.rows);
    res.send(result.rows);
  });
});

routes.get("/images/:id", (req, res) => {
  const id = req.params.id;
  client.query(`SELECT * from images where id = ${id}`, function (err, result) {
    if (err) {
      return console.error("error running query", err);
    }
    console.log(result.rows);
    res.send(result.rows).status(200);
  });
});

routes.delete("/images/:id", (req, res) => {
  const id = req.params.id;
  client.query(`Delete from images where id = ${id}`, function (err, result) {
    if (err) {
      return console.error("error running query", err);
    } else {
      if (result.rowCount == 0) {
        res.status(400).json({ info: "Registro não encontrado" });
      } else {
        res.status(200).json({ info: "Registro excluido" });
      }
    }
  });
});

routes.delete("/images/DeleteAll", (req, res) => {
  client.query(`Delete from images`, function (err, result) {
    if (err) {
      return console.error("error running query", err);
    } else {
      if (result.rowCount == 0) {
        res.status(400).json({ info: "Registro não encontrado" });
      } else {
        res.status(200).json({ info: "Registro excluido" });
      }
    }
  });
});

routes.post("/images", (req, res) => {
  const { url } = req.body;
  client.query(
    `insert into images (url) values ('${url}') returning *`,
    function (err, result) {
      if (err) {
        return console.error("error running query", err);
      }
      const { id } = result.rows[0];
      console.log(result);

      res.status(201).json({ info: `Registrado com sucesso, id: ${id}`, obj: result.rows[0] });
    }
  );
});

routes.post("/links", (req, res) => {
  const { url,maiorNum,menorNum } = req.body;
  client.query(
    `insert into links (url,maiorNum,menorNum) values ('${url}',${maiorNum},${menorNum}) returning *`,
    function (err, result) {
      if (err) {
        return console.error("error running query", err);
      }
      const { id } = result.rows[0];
      console.log(result);

      res.status(201).json({ info: `Registrado com sucesso, id: ${id}`, obj: result.rows[0] });
    }
  );
});

routes.post("/images/getNFTS", (req, res) => {
  let i = 0,j = 0,links;
  client.query(`select * from links`,(result)=>{
      links = result.rows
  });
  while(j<links.length){
  while (i < links[j].maiorNum) {
    let num = links[j].menorNum + i;
    i++;
    let url = `https://img-cdn.magiceden.dev/rs:fill:400:400:0:0/plain/${links[j].url}/${num}.png?ext=png`;
    
    client.query(
      `insert into images (url) values ('${url}') returning *`,
      function (err, result) {
        if (err) {
          return console.error("error running query", err);
        }
        console.log(result);
      }
    );
  }
}
  res.status(201).json({ info: `Registrado com sucesso` });
});

routes.put("/images/:id", (req, res) => {
  const { id } = req.params;
  const { url } = req.body;
  client.query(
    `Update images set url = '${url}' where id = ${id}`,
    function (err, result) {
      if (err) {
        return console.error("error running query", err);
      }
      console.log(result);
      res.setHeader("id", `${id}`);
      res
        .status(202)
        .json({ info: `Registro atualizado com sucesso, id: ${id}` });
    }
  );
});

module.exports = routes;
