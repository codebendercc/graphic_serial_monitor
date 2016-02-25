GraphiteGraphPlotter = function(div) {
    this.div = div;
    this.chart;
    this.dps; //datapoints
    this.dataNumber;
    this.withXCord;
    this.xVal = 0;
    this.dataLength = 50;
    this.initGraph();
}

GraphiteGraphPlotter.prototype.updateChart = function(datalist) {
    for (var i = 0; i < datalist.length; i++) {
        if (datalist[i].length != this.dataNumber) continue;
        var dataStartPos = 0;
        var xCordValue = this.xVal;
        if (this.withXCord){
            dataStartPos = 1;
            xCordValue = datalist[i][0];
        }
        for (var j = dataStartPos; j < this.dps.length; j++) {
            this.dps[j].push({
                x: xCordValue,
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

GraphiteGraphPlotter.prototype.initGraph = function(dataNumber, withXCord) {
    this.xVal = 0;
    this.dataNumber = dataNumber || 1;
    this.withXcord = withXCord;
    var yCordinateDataNumber = dataNumber;
    if (withXCord) {
        yCordinateDataNumber--;
    }
    this.dps = fillArray([], yCordinateDataNumber);
    var tempData = [];
    for (var i = 0; i < yCordinateDataNumber; i++) {
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