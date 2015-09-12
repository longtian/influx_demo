/**
 * Created by yan on 15-9-12.
 */

var express = require('express');
var path = require('path');
var Client = require('./lib/fluxdb.js').Client;
var os = require('os');
var hostname = os.hostname();

var client = new Client({
  url: 'http://localhost:8086',
  db: 'mydb'
});

var app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/query', function (req, res) {
  client.query(req.query.q, function (err, result) {
    res.json(result);
  });
});

function collect() {
  var result = process.memoryUsage();
  client.write('memoryUsage', result, {
    host: hostname,
    pid: process.pid
  });
}

setInterval(collect, 1000);

app.listen(8080)