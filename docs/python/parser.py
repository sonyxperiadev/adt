from docbuilder import DocBuilder

# Modules
modules = [
    "data",
    "rest",
    "signals",
    "system.log",
    "system.version",
    "user",
    "widgets",
    "widgets.areachart",
    "widgets.barchart",
    "widgets.chordchart",
    "widgets.grid",
    "widgets.hint",
    "widgets.image",
    "widgets.info",
    "widgets.label",
    "widgets.legend",
    "widgets.linechart",
    "widgets.map",
    "widgets.piechart",
    "widgets.slider",
    "widgets.status",
]
for m in modules:
    print("    " + m)
    DocBuilder()\
        .parse("src/%s.js" % m)\
        .html("docs/api/%s.html" % m,
              style="img#logo{position:fixed;top:20px;right:20px;width:100px;}")

