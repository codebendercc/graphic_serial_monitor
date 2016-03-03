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

    /////////////////////
    //PROTECTED METHODS//
    /////////////////////
    /**
     * initialize the graph
     * @params {number} dataNumber - number of data per line
     * @params {boolean} withXCord - whether the first number of the line is the x-coordinate
     */
    this.initGraph = function(dataNumber, withXCord) {
        this.xVal = 0;
        this.dataNumber = dataNumber || 1;
        this.withXCord = (typeof withXCord !== 'undefined') ? withXCord : false;
        var dataStartPos = 0;
        if (withXCord) {
            dataStartPos = 1;
        }
        this.dps = fillArray([], dataNumber);
        var tempData = [];
        for (var i = dataStartPos; i < dataNumber; i++) {
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

    /**
     * update the chart using list of data
     * @params {array} datalist - number of data per line
     */
    this.updateChart = function(datalist) {
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

    this.initGraph();
}

/**
 * add raw data into chart
 * @params {string} rawData - string of unprocessed data
 */
GraphiteGraphPlotter.prototype.addNewData = function(rawData) {
    this.dataparser.addRawData(rawData);
    if ((this.dataNumber != this.dataparser.getdataNumber()) || (this.withXCord != this.dataparser.isWithXCord())) {
        this.initGraph(this.dataparser.getdataNumber(), this.dataparser.isWithXCord());
    }
    if (!this.isPaused) {
        this.updateChart(this.dataparser.showNewData());
    }
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

function fillArray(content, amount) {
    tempArray = [];
    for (var i = 0; i < amount; i++) {
        tempArray.push(content.slice());
    }
    return tempArray;
}