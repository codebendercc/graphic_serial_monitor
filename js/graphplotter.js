/** process raw string data and plot a graph out of it*/
GraphiteGraphPlotter = function(div) {
    this.div = div;
    this.chart;
    this.dps; //datapoints
    this.dataNumber;
    this.withXCord;
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
     * @params {number} dataNumber - number of data per line
     * @params {boolean} withXCord - whether the first number of the line is the x-coordinate
     */
    this.initLineGraph = function(dataNumber, withXCord) {
        this.xVal = 0;
        this.dataNumber = dataNumber || 1;
        this.withXCord = (typeof withXCord !== 'undefined') ? withXCord : false;
        var dataStartPos = 0;
        if (withXCord) {
            dataStartPos = 1;
        }
        this.dps = fillArray([], this.dataNumber);
        var tempData = [];
        for (var i = dataStartPos; i < this.dataNumber; i++) {
            tempData.push({
                type: "line",
                name: "data" + i,
                dataPoints: this.dps[i]
            });
        }
        this.chart = new CanvasJS.Chart(this.div, {
            data: tempData
        });
    }

    this.initBarGraph = function() {
        this.dps = [];
        if (this.dataparser.getFrequencies() == null){
            this.switchToLineGraph();
            return;
        }
        var keys = Object.keys(this.dataparser.getFrequencies());
        for (var i = 0; i < keys.length; i++) {
            this.dps.push({
                label: keys[i],
                y: this.dataparser.getFrequencies()[keys[i]]
            })
        }
        this.chart = new CanvasJS.Chart(this.div, {
            data: [{
                type: "column",
                bevelEnabled: true,
                dataPoints: this.dps
            }]
        });
        this.chart.render();
    }

    this.updateBarGraph = function() {
        if (this.dataparser.getFrequencies() == null){
            this.switchToLineGraph();
            return;
        }
        var keys = Object.keys(this.dataparser.getFrequencies());
        for (var i = 0; i < keys.length; i++) {
            this.dps[i] = ({
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
            if (datalist[i].length != this.dataNumber) continue;
            var dataStartPos = 0;
            var xCordValue = this.xVal;
            if (this.withXCord) {
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

            if ((this.dataNumber != this.dataparser.getdataNumber()) || (this.withXCord != this.dataparser.isWithXCord())) {
                this.initLineGraph(this.dataparser.getdataNumber(), this.dataparser.isWithXCord());
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
    this.initLineGraph(this.dataparser.getdataNumber(), this.dataparser.isWithXCord());
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