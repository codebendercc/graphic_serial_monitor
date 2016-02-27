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

    // Initialize compilerflasher
    compilerflasher = new compilerflasher(function() {});
    var parser = new GraphiteDataParser();
    var chartPlotter = new GraphiteGraphPlotter("chartContainer");
    /**
     * Runs whenever new data is detected on serial monitor
     */
    var firstLine = /^connecting at .+$/;
    $(document).on('serial_monitor_new_line', function(event, data) {
        if (firstLine.test(data)) return;
        parser.addRawData(data);
        if ((chartPlotter.dataNumber != parser.getdataNumber()) || (chartPlotter.withXCord != parser.isWithXCord())) {
            chartPlotter.initGraph(parser.getdataNumber(),parser.isWithXCord());
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
});