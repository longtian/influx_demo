/**
 * Created by yan on 15-9-12.
 */

var request = require('request');
var assert = require('assert');

function Client(options) {
  this.url = options.url;
  this.db = options.db;
  this.pretty = !!options.pretty;
  this.u = options.u;
  this.p = options.p;

  this.auth = '&u=' + this.u + '$p=' + this.p;

  this.buffer = [];
}

/**
 * FIXME: performance critical
 *
 * @param obj
 * @returns {string}
 */
function paramlize(obj) {
  var _ = [];

  for (var i in obj) {
    _.push(i + '=' + obj[i])
  }

  return _.join(',');
}

/**
 * write to buffer;
 *
 * @param name
 * @param value
 * @param tags
 */
Client.prototype.write = function (name, values, tags) {
  var line = name + ',' + paramlize(tags) + ' ' + paramlize(values) + ' ' + Date.now() + '000000';
  this.buffer.push(line);
  this.flush();
}

Client.prototype.query = function (q, callback) {

  var url = this.url + '/query?db=' + this.db + '&q=' + q + this.auth;

  if (this.pretty) {
    url += '&pretty=true';
  }

  var log = 'GET ' + url;

  request({
    url: url,
    method: 'GET'
  }, function (error, res, responseBody) {
    if (error) {
      callback && callback.call(this, error);
    } else {
      console.log(log + '\n' + responseBody);
      callback && callback.call(this, null, responseBody);
    }
  });
}

Client.prototype.admin = function (q, callback) {
  var url = this.url + '/query?q=' + q + this.auth;
  var log = 'GET ' + url;
  request({
    url: url,
    method: 'GET'
  }, function (error, res, responseBody) {
    if (error) {
      callback && callback.call(this, error);
    } else {
      console.log(log + '\n' + responseBody);
      callback && callback.call(this, null, JSON.parse(responseBody));
    }
  });
}

Client.prototype.flush = function () {
  if (this.buffer.length == 0) {
    // buffer empty, skipping
    return;
  }
  var url = this.url + '/write?db=' + this.db + this.auth;

  console.log(url);
  var log = 'POST ' + this.url;
  var body = this.buffer.join('\n');
  this.buffer = [];

  request({
    url: url,
    method: 'POST',
    body: body
  }, function (error, res, responseBody) {
    if (error) {
      console.error(log + ' error\n' + error);
    } else if (res.statusCode != 204) {
      console.error(log + ' ' + res.statusCode + '\n' + responseBody);
    } else {
      console.log(log + ' ' + res.statusCode + '\n' + body);
    }
  });
}

exports.Client = Client;