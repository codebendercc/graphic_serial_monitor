/**
 * Runs when page is loaded
 */
$(function() {
    // Initialize compilerflasher
    compilerflasher = new compilerflasher(function() {});
    // Initialize Graphite
    var graphite = new Graphite();
    /**
     * Runs whenever new data is detected on serial monitor
     */

    compilerflasher.on('serial-monitor-received-data', function(data) {
        graphite.addNewData(data);
    });

    compilerflasher.on('serial-monitor-connected', function(data) {
        graphite.clearData();
    });
});