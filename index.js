var data = require("./src/data");
var rest = require("./src/rest");
var signals = require("./src/signals");
var systemLog = require("./src/system.log");
var systemVersion = require("./src/system.version");
var user = require("./src/user");
var AreaChart = require("./src/widgets.areachart");
var BarChart = require("./src/widgets.barchart");
var ChordChart = require("./src/widgets.chordchart");
var Grid = require("./src/widgets.grid");
var Hint = require("./src/widgets.hint");
var Image = require("./src/widgets.image");
var Info = require("./src/widgets.info");
var Label = require("./src/widgets.label");
var Legend = require("./src/widgets.legend");
var LineChart = require("./src/widgets.linechart");
var Map = require("./src/widgets.map");
var PieChart = require("./src/widgets.piechart");
var Slider = require("./src/widgets.slider");
var Status = require("./src/widgets.status");

module.exports = {
    data: data,
    rest: rest,
    signals: signals,
    system: {
        log: systemLog,
        version: systemVersion
    },
    user: user,
    widgets: {
        AreaChart: AreaChart,
        BarChart: BarChart,
        ChordChart: ChordChart,
        Grid: Grid,
        Hint: Hint,
        Image: Image,
        Info: Info,
        Label: Label,
        Legend: Legend,
        LineChart: LineChart,
        PieChart: PieChart,
        Map: Map,
        Slider: Slider,
        Status: Status
    }
};
