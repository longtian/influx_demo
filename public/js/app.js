/**
 * Created by yan on 15-9-12.
 */
var $q = $('#q');

var defaultQ = 'select max(heapTotal),min(healTotal),mean(heapTotal) ' +
  'from memoryUsage where time> now() - 1h group by time(1m)';

var localStorageQ = localStorage.getItem('q');
$q.val(localStorageQ ? localStorageQ : defaultQ);

$q.keydown(function (e) {
  // ctrl+enter is pressed
  if (e.keyCode == 13 && e.ctrlKey) {
    loadData();
  }
});

$('[data-query]').click(function(){
  $q.val($(this).data('query'));
  loadData();
  return false;
});

$("#queryBtn").click(function () {
  loadData();
  return false;
});

loadData();


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

    c3.generate({
      data: {
        rows: [],
        x: 'time',
        xFormat: '%Y-%m-%dT%H:%M:%S.%LZ',
        rows: [columns].concat(values),
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%H:%M',
            count: Math.round($(window).width()/100)
          }
        }
      }
    });

  });

}


//setInterval(loadData, 1000);



