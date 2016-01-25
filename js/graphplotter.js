GraphiteGraphPlotter = function(div) {
    this.div = div;
    this.chart;
    this.dps; //datapoints
    this.dataNumber;
    this.hasXCordinate;
    this.initGraph();
    this.xVal = 0;
    this.dataLength = 50;
}

GraphiteGraphPlotter.prototype.updateChart = function(datalist) {

    console.log(datalist)
    console.log(this.dataNumber)
    for (var i = 0; i < datalist.length; i++) {
        if (datalist[i].length != this.dataNumber) continue;
        for (var j = 0; j < this.dps.length; j++) {
            this.dps[j].push({
                x: this.xVal,
                y: datalist[i][j]
            });
            if (this.dps[j].length > this.dataLength) {
                this.dps[j].shift();
            }
        }
        this.xVal++;
    };

    this.chart.render();
};

GraphiteGraphPlotter.prototype.initGraph = function(dataNumber) {
    this.xVal = 0;
    this.dataNumber = dataNumber || 1;
    this.dps = fillArray([], this.dataNumber);
    var tempData = [];
    for (var i = 0; i < this.dataNumber; i++) {
        tempData.push({
            type: "line",
            name: "data" + i,
            dataPoints: this.dps[i]
        });
    }
    this.chart = new CanvasJS.Chart(this.div, {
        title: {
            text: "geia sou kosmos"
        },
        data: tempData
    });
}

function fillArray(content, amount) {
    tempArray = [];
    for (var i = 0; i < amount; i++) {
        tempArray.push(content.slice());
    }
    return tempArray;
}