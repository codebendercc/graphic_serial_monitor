function updateSlider() {
    if ($("#unlimited")[0].checked) {

        $("#maxSamples").slider("disable");
    } else {
        $("#maxSamples").slider("enable");
    }
}
/**
 * Runs when page is loaded
 */
$(function() {
    $("#maxSamples").slider({
        scale: 'logarithmic'
    });
    window.sliderValue = parseInt($("#maxSamples").attr("data-slider-value"), 10);
    $("#maxSamples").on("slide", function(slideEvt) {
        window.sliderValue = slideEvt.value;
    });


    $("#unlimited").click(updateSlider);
    updateSlider();

    // Initialize compilerflasher
    compilerflasher = new compilerflasher(function() {});
    var parser = new GraphiteDataParser();
    var chartPlotter = new GraphiteGraphPlotter("chartContainer");
    /**
     * Runs whenever new data is detected on serial monitor
     */
    var withXCord;
    var firstLine = /^connecting at .+$/;
    $(document).on('serial_monitor_new_line', function(event, data) {

        if (firstLine.test(data)) return;
        parser.addRawData(data);
        if (withXCord == null) {
            withXCord = parser.withXCord;
        }
        console.log(parser.getdataNumber())
        if (chartPlotter.dataNumber != parser.getdataNumber()) {
            console.log(chartPlotter.dataNumber +"!="+ parser.getdataNumber())
            chartPlotter.initGraph(parser.getdataNumber());
        }
        chartPlotter.updateChart(parser.showNewData());

    });


    // When a new arduino is connected, clear previous data from chart

    $(document).on('serial_monitor_connect', function(event, data) {
        clearData();
    });

    // When button to clear data is clicked, clear previous data from chart
    $('#clear-data').on('click', function() {
        clearData();
    });

    /**
     * Clears all data from the sensors, refreshing the chart
     */
    function clearData() {
        /*
        sensorArray.forEach(function(val, index) {
            val.length = 0;
        });
        window.myLineChart.render();*/
        parser = new GraphiteGraphPlotter();
    }

    /**
     * Identifies the type of data and adds it to the correct sensor array. Which plots it on the chart
     * @param element - Data to add to chart
     */
    function addElement(element) {
        //If type of element is recognized as a known sensor
        if (sensorHash[element.type]) {
            // If this is the first data of this sensor
            if (typeof sensorHash[element.type].added != 'undefined' && !sensorHash[element.type].added) {
                var newObject;

                //Choose correct Y axis based on range of data
                if (element.y < 1000) {
                    newObject = {
                        type: "line",
                        name: sensorHash[element.type].title,
                        showInLegend: true,
                        dataPoints: window[sensorHash[element.type].arrayName]
                    };
                } else {
                    newObject = {
                        type: "line",
                        name: sensorHash[element.type].title,
                        showInLegend: true,
                        axisYType: "secondary",
                        dataPoints: window[sensorHash[element.type].arrayName]
                    };
                }

                window.myLineChart.options.data.push(newObject);

                sensorHash[element.type].added = true;
            }

            // If this isnt the first element, then add it to the existing array
            window[sensorHash[element.type].arrayName].push(element);
        }

        //Checks if user wants unlimited data
        if (!$("#unlimited")[0].checked) {
            //Removed the oldest element in array if number of elements in array is more than number of values
            //user wants
            if (window[sensorHash[element.type]].arrayName.length > window.sliderValue) {
                window[sensorHash[element.type]].arrayName.shift();
            }
        }

    }

});