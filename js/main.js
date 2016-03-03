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
        chartPlotter.addNewData(data);
    });


    // When a new arduino is connected, clear previous data from chart

    $(document).on('serial_monitor_connect', function(event, data) {
        clearData();
    });

    // When button to clear data is clicked, pause/unpause the chart
    $('#pause').on('click', function() {
        chartPlotter.togglePause();
        if($('#pause').text() == 'Pause'){
            $('#pause').text('Start');
            $('#pause').attr('class', 'btn btn-success btn-block');
            return;
        }
        $('#pause').text('Pause');
        $('#pause').attr('class', 'btn btn-danger btn-block');
    });

    $('#import-csv').on('click', function() {
        chartPlotter.exportCSV();
    });

    /**
     * Clears all data from the sensors, refreshing the chart
     */
    function clearData() {
        chartPlotter = new GraphiteGraphPlotter("chartContainer");
    }
});