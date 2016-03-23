/** process raw string data and plot a graph out of it*/
GraphiteGraphPlotter = function(div) {
    this.div = div;
    this.chart;
    this.dataPoints; //datapoints
    this.variableNumber;
    this.withXCoordinates;
    this.xVal = 0;
    this.dataLength = 50;
    this.dataparser = new GraphiteDataParser();
    this.isPaused = false;
    this.graphType = GraphiteGraphPlotter.LINE_GRAPH;

    /////////////////////
    //PROTECTED METHODS//
    /////////////////////
    /**
     * initialize the graph
     * @params {number} variableNumber - number of data per line
     * @params {boolean} withXCoordinates - whether the first number of the line is the x-coordinate
     */
    this.initLineGraph = function(variableNumber, withXCoordinates) {
        this.xVal = 0;
        this.variableNumber = variableNumber || 1;
        this.withXCoordinates = withXCoordinates;
        if (typeof withXCoordinates == 'undefined') {
            this.withXCoordinates = false;
        }
        var dataStartPos = 0;
        if (withXCoordinates) {
            dataStartPos = 1;
        }
        this.dataPoints = fillArray([], this.variableNumber);
        var tempData = [];
        for (var i = dataStartPos; i < this.variableNumber; i++) {
            tempData.push({
                type: "line",
                name: "data" + i,
                dataPoints: this.dataPoints[i]
            });
        }
        this.chart = new CanvasJS.Chart(this.div, {
            data: tempData
        });
    }

    this.initBarGraph = function() {
        this.dataPoints = [];
        if (this.dataparser.getFrequencies() == null) {
            this.switchToLineGraph();
            return;
        }
        var keys = Object.keys(this.dataparser.getFrequencies());
        for (var i = 0; i < keys.length; i++) {
            this.dataPoints.push({
                label: keys[i],
                y: this.dataparser.getFrequencies()[keys[i]]
            })
        }
        this.chart = new CanvasJS.Chart(this.div, {
            data: [{
                type: "column",
                bevelEnabled: true,
                dataPoints: this.dataPoints
            }]
        });
        this.chart.render();
    }

    this.updateBarGraph = function() {
        if (this.dataparser.getFrequencies() == null) {
            this.switchToLineGraph();
            return;
        }
        var keys = Object.keys(this.dataparser.getFrequencies());
        for (var i = 0; i < keys.length; i++) {
            this.dataPoints[i] = ({
                label: keys[i],
                y: this.dataparser.getFrequencies()[keys[i]]
            })
        }
        this.chart.render();
    }


    /**
     * update the chart using list of data
     * @params {array} datalist - number of data per line
     */
    this.updateLineGraph = function(datalist) {
        for (var i = 0; i < datalist.length; i++) {
            if (datalist[i].length != this.variableNumber) continue;
            var dataStartPos = 0;
            var xCordValue = this.xVal;
            if (this.withXCoordinates) {
                dataStartPos = 1;
                xCordValue = datalist[i][0];
            }
            for (var j = dataStartPos; j < this.dataPoints.length; j++) {
                this.dataPoints[j].push({
                    x: xCordValue,
                    y: datalist[i][j]
                });
                if (this.dataPoints[j].length > this.dataLength) {
                    this.dataPoints[j].shift();
                }
            }
            this.xVal++;
        };
        this.chart.render();
    };

    this.initLineGraph();
}

/**
 * add raw data into chart
 * @params {string} rawData - string of unprocessed data
 */
GraphiteGraphPlotter.prototype.addNewData = function(rawData) {
    this.dataparser.addRawData(rawData);
    switch (this.graphType) {
        case GraphiteGraphPlotter.LINE_GRAPH:
            differingVariableNumbers = (this.variableNumber != this.dataparser.getvariableNumber());
            differingXcoordinateOptions = (this.withXCoordinates != this.dataparser.hasXCoordinates());
            if (differingVariableNumbers || differingXcoordinateOptions) {
                this.initLineGraph(this.dataparser.getvariableNumber(), this.dataparser.hasXCoordinates());
            }
            if (!this.isPaused) {
                this.updateLineGraph(this.dataparser.showNewData());
            }
            break;
        case GraphiteGraphPlotter.BAR_GRAPH:
            if (!this.isPaused) {
                this.initBarGraph();
            }
            break;
    }
}

GraphiteGraphPlotter.LINE_GRAPH = 0;

GraphiteGraphPlotter.BAR_GRAPH = 1;

GraphiteGraphPlotter.prototype.switchToLineGraph = function() {
    this.graphType = GraphiteGraphPlotter.LINE_GRAPH;
    this.initLineGraph(this.dataparser.getvariableNumber(), this.dataparser.hasXCoordinates());
}

GraphiteGraphPlotter.prototype.switchToBarGraph = function() {
    this.graphType = GraphiteGraphPlotter.BAR_GRAPH;
    this.initBarGraph();
}

GraphiteGraphPlotter.prototype.pause = function() {
    this.isPaused = true;
}

GraphiteGraphPlotter.prototype.unpause = function() {
    this.isPaused = false;
}

GraphiteGraphPlotter.prototype.togglePause = function() {
    this.isPaused = !this.isPaused;
}

GraphiteGraphPlotter.prototype.exportCSV = function() {
    var data = this.dataparser.showAllData();
    var csvContent = "data:text/csv;charset=utf-8,";
    data.forEach(function(infoArray, index) {

        dataString = infoArray.join(",");
        csvContent += index < data.length ? dataString + "\n" : dataString;

    });
    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
}

GraphiteGraphPlotter.prototype.isBarChartAvailable = function() {
    return this.dataparser.isRecordingFrequencies;
}

function fillArray(content, amount) {
    tempArray = [];
    for (var i = 0; i < amount; i++) {
        tempArray.push(content.slice());
    }
    return tempArray;
}