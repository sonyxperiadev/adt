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
        Image: Image
    }
};
