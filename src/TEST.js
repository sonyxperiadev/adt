/*var AreaChart = require('./widgets.areachart').widgets.AreaChart;
console.log(AreaChart);
var chart = new AreaChart("bla");*/

var data = require('./data');
var rest = require('./rest');
var signals = require('./signals');
//var user = require('./user');
var syslog = require('./system.log');
var sysversion = require('./system.version');
var widgets = require('./widgets');
var AreaChart = require('./widgets.areachart');
var BarChart = require('./widgets.barchart');
var ChordChart = require('./widgets.chordchart');
var Grid = require('./widgets.grid');
var Hint = require('./widgets.hint');
var Image = require('./widgets.image');
var Info = require('./widgets.info');
var Label = require('./widgets.label');
var Legend = require('./widgets.legend');
var LineChart = require('./widgets.linechart');
var PieChart = require('./widgets.piechart');
var Slider = require('./widgets.slider');
var Status = require('./widgets.status');
var Map = require('./widgets.map');

console.log(Map);

var DATA = [
    {x: 1, y: {'orange': 2}},
    {x: 2, y: {'orange': 5}},
    {x: 3, y: {'orange': 3}}
];
var chart = new Status("bla");
var table = data.structures.Table(DATA);
var hint = new Hint();
