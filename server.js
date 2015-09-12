/**
 * Created by yan on 15-9-12.
 */

var express = require('express');
var path = require('path');
var Client = require('./lib/fluxdb.js').Client;
var os = require('os');
var hostname = os.hostname();

var url = 'http://' + process.env.INFLUXDB_PORT_8086_TCP_ADDR + ':' + process.env.INFLUXDB_PORT_8086_TCP_PORT;

var client = new Client({
  url: url,
  db: 'mydb',
  u: process.env.INFLUXDB_USERNAME,
  p: process.env.INFLUXDB_PASSWORD
});

var app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/query', function (req, res) {
  client.query(req.query.q, function (err, result) {
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.end(result);
  });
});

function collect() {
  var result = process.memoryUsage();
  var loadavg = os.loadavg();
  var totalmem = os.totalmem();
  var freemem = os.freemem();
  result.freemem = freemem;
  result.totalmem = totalmem;

  client.write('memoryUsage', result, {
    host: hostname,
    pid: process.pid
  });

  client.write('loadavg', {
    load1: loadavg[0],
    load5: loadavg[1],
    load15: loadavg[2]
  }, {
    host: hostname,
  });
}

setInterval(collect, 1000);

app.listen(8888)