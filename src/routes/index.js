const express = require("express");
var pg = require("pg");
const config = require("../../config");
var conString = config.urlConnection;
const routes = express.Router();
var links = [];

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
routes.get("/links", (req, res) => {
  client.query("SELECT * from links", function (err, result) {
    if (err) {
      return console.error("error running query", err);
    }
    links = result.rows;
    res.send(result.rows);
  });
});

routes.get("/links/:id", (req, res) => {
  const id = req.params.id;
  client.query(`SELECT * from links where id = ${id}`, function (err, result) {
    if (err) {
      return console.error("error running query", err);
    }
    console.log(result.rows);
    res.send(result.rows).status(200);
  });
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
        res.status(400).json({ info: "Registro n??o encontrado" });
      } else {
        res.status(200).json({ info: "Registro excluido" });
      }
    }
  });
});

routes.delete("/images/DeleteAll/", (req, res) => {
  client.query(`Delete from images`, function (err, result) {
    if (err) {
      return console.error("error running query", err);
    } else {
      
        res.status(200).json({ info: "Registros excluidos" });
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
    `insert into links(url,maiornum,menornum) values ('${url}',${maiorNum},${menorNum}) returning *`,
    function (err, result) {
      if (err) {
        res.json({error: err})
      }
      const { id } = result.rows[0];
      console.log(result);

      res.status(201).json({ info: `Registrado com sucesso, id: ${id}`, obj: result.rows[0] });
    }
  );
});

async function addImgsFromSite(url){
  await client.query(
    `insert into images (url) values ('${url}') returning *`,
    function (err, result) {
      if (err) {
        return console.error("error running query", err);
      }
    }
  );
}

routes.post("/images/getNFTS", (req, res) => {
  let i = 0,j = 0,num = 0;
    console.log(links.length)
    while (j < links.length) {
      i = 0;
      console.log(links[j])
      while (num < links[j].menornum) {
        console.log(i);
         num = links[j].maiornum + i;
         console.log(num);
        i++;
        let url = `https://img-cdn.magiceden.dev/rs:fill:400:400:0:0/plain/${links[j].url}/${num}.png?ext=png`;
        addImgsFromSite(url);

      }
      j++;
      
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
