/**
 * Created by yan on 15-9-12.
 */
var $q = $('#q');
var defaultQ = 'select * from memoryUsage where time> now() - 1m';
var localStorageQ = localStorage.getItem('q');
$q.val(localStorageQ ? localStorageQ : defaultQ);
$q.keydown(function (e) {
  if (e.keyCode == 13 && e.ctrlKey) {
    loadData();
  }
})
$("#queryBtn").click(function () {
  loadData();
  return false;
});

loadData();

var chart = c3.generate({
  data: {
    rows: [],
    x: 'time',
    xFormat: '%Y-%m-%dT%H:%M:%S.%LZ'
  },
  axis: {
    x: {
      type: 'timeseries',
      tick: {
        format: '%H:%M:%S'
      }
    }
  }
});

function loadData() {
  var q = $q.val()

  $.get('query', {q: q}, function (result) {

    if (result.error) {
      $('#error').show().text(result.error);
      return
    }

    if (result.results && result.results[0].error) {
      $('#error').show().text(result.results[0].error);
      return
    }

    if (result.results && !result.results[0].series) {
      $('#error').show().text('no data');
      return
    }

    $('#error').hide();

    localStorage.setItem('q', q);

    var res = result.results[0].series[0];
    var columns = res.columns;
    var values = res.values;

    for (var i = 0; i < values.length; i++) {
      values[i][0] = new Date(values[i][0]);
    }

    chart.load({
      rows: [columns].concat(values),
    });


  })

}


//setInterval(loadData, 1000);



