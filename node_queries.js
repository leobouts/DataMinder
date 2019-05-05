// before running make sure you run this command on mysql workbench
//ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'
//opou 'password' o kwdikos tou root
//also install nodejs and the mysql with 'npm install mysql' command from cmd
//finally run with 'node node_queries.js' from the directory of the file
const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
var indexes;
var countries;

const corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

const con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password",
    database: "testdb"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("[UPDATE]:Server is now connected with MySQL.");

});

//GET values and years of an index
app.route('/api/values:values').get((req, res) => {
  var values = req.params['values'];
  //substring deletes first character of the string so the ":" will go away
  values = values.substring(1)
  //im passsing the indexes AND THE COUNTRY from the api with + between them to recognize
  var valuesSplitted = values.split('+');
  var index = valuesSplitted[0];
  var countrySelected = valuesSplitted[1];
  var genericSelected = valuesSplitted[2];
  var query = `SELECT ${index},year,${genericSelected} FROM data WHERE country = '${countrySelected}'` ;
  con.query(query, function (err, result) {
    if (err) throw err;
    values = result;
    res.send({values});
    console.log('[UPDATE]: generic and chosen index/country values just transfered to the frontend app.')
  });
});

//GET measure
app.route('/api/measure:values').get((req, res) => {
  var measure = req.params['values'];
  //substring deletes first character of the string so the ":" will go away
  measure = measure.substring(1)
  var query = `SELECT measure FROM measures WHERE m_index = '${measure}'` ;
  con.query(query, function (err, result) {
    if (err) throw err;
    res.send({result});
    console.log('[UPDATE]: measure of an index just transfered to the frontend app.')
  });
});

//GET all countries that dont have null value of an index
app.route('/api/countries:indexes').get((req, res) => {
  var indexes = req.params['indexes'];
  //substring deletes first character of the string so the ":" will go away
  indexes = indexes.substring(1)
  var query = `SELECT DISTINCT country FROM data WHERE ${indexes} <> 'nan'`;
  con.query(query, function (err, result) {
    if (err) throw err;
    countries = result;
    res.send({countries});
    console.log('[UPDATE]: Available countries for the selected indexes just transfered to the frontend app.')
  });
});

//GET if the type of an index is generic or specific
app.route('/api/index_type:index').get((req, res) => {
  var index = req.params['index'];
  //substring deletes first character of the string so the ":" will go away
  index = index.substring(1)
  var query = `SELECT m_type FROM measures WHERE m_index = '${index}'`;
  con.query(query, function (err, result) {
    if (err) throw err;
    res.send({result});
    console.log('[UPDATE]: type of index just transfered to the fronted app');
  });
});

//GET certain value
app.route('/api/certain_value:params').get((req, res) => {
  var index = req.params['params'];
  //substring deletes first character of the string so the ":" will go away
  index = index.substring(1)
  var paramsSplitted = index.split('+');
  indexName = paramsSplitted[0] //is the index name
  country = paramsSplitted[1] //is the country name
  year = paramsSplitted[2] //is the year 

  var query = `SELECT ${indexName} FROM data WHERE year = '${year}' AND country = '${country}'`;
  con.query(query, function (err, result) {
    if (err) throw err;
    value = result;
    res.send({value});
    console.log('[UPDATE]:  value requested just transfered to the fronted app');
  });
});

//GET all dates that dont have null value of an index
app.route('/api/dates:params').get((req, res) => {
  var indexes = req.params['params'];
  //substring deletes first character of the string so the ":" will go away
  indexes = indexes.substring(1)
  //im passsing the indexes AND THE COUNTRY from the api with + between them to recognize
  var indexesSplitted = indexes.split('+');
  var index = indexesSplitted[0];
  var countrySelected = indexesSplitted[1];
  var query = `SELECT year FROM data WHERE ${index} <> 'nan'  
    and country = '${countrySelected}'`;
  con.query(query, function (err, result) {
    if (err) throw err;
    dates = result;
    res.send({dates});
    console.log('[UPDATE]: Available dates for the selected country and index just transfered to the frontend app.')
  });
});

//GET all available indexes
app.route('/api/indexes').get((req, res) => {
  con.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'data'", function (err, result) {
    if (err) throw err;
    indexes = result;
    res.send({indexes});
    console.log('[UPDATE]: All indexes just transfered to the frontend app.')
  });  
});

//GET the measure of an index
app.route('/api/index_measure:indexname').get((req, res) => {
  var indexname = req.params['indexname'];
  //substring deletes first character of the string so the ":" will go away
  indexname = indexname.substring(1)
  con.query(`SELECT measure FROM measures WHERE m_index = '${indexname}'`, function (err, result) {
    if (err) throw err;
    indexname = result;
    res.send({indexname});
  });
  console.log(`[UPDATE]: Index metric of ${indexname} just transfered to the frontend app.`)
});


//the server listens here
app.listen(8000, () => {
  console.log('[UPDATE]:Server now listens for incoming connections at port:8000');
});
