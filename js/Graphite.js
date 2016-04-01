Graphite = function(graphiteConfig) {
    this.graphiteConfig = graphiteConfig;
    this.chartPlotter;
    this.exportCSVButton;
    this.switchButton;
    this.pauseButton;
    this.dataTable;
    this.isPaused;
    this.variableNumber;
    if (typeof graphiteConfig == 'undefined') {
        this.graphiteConfig = {};
    }

    this.initGraphPlotter = function(canvas) {
        if (typeof canvas == 'undefined') {
            canvas = 'graphite_chart_container';
        }
        this.chartPlotter = new GraphiteGraphPlotter(canvas);
    }

    this.initExportCSV = function(exportCSVButton) {
        if (typeof exportCSVButton == 'undefined') {
            exportCSVButton = "graphite_export_csv_button";
        }
        var self = this;
        this.exportCSVButton = $('#' + exportCSVButton);
        this.exportCSVButton.on('click', function() {
            self.chartPlotter.exportCSV();
        });
    }

    this.initLineBarSwitch = function(switchButton) {
        if (typeof switchButton == 'undefined') {
            switchButton = "graphite_switch_button";
        }
        this.switchButton = $('#' + switchButton);
        this.switchButton.bootstrapSwitch();
        this.switchButton.bootstrapSwitch('disabled', false);
        var self = this;
        this.switchButton.on('switchChange.bootstrapSwitch', function(event, state) {
            if (state) {
                self.chartPlotter.switchToLineGraph();
                return;
            }
            self.chartPlotter.switchToBarGraph();
        });
    }

    this.initPauseButton = function(pauseButton) {
        if (typeof pauseButton == 'undefined') {
            pauseButton = "graphite_pause_button";
        }
        this.isPaused = false;
        this.pauseButton = $('#' + pauseButton);
        this.pauseButton.text('Pause');
        this.pauseButton.attr('class', 'btn btn-danger btn-block');
        var self = this;
        this.pauseButton.on('click', function() {
            self.chartPlotter.togglePause();
            if (!self.isPaused) {
                self.pauseButton.text('Start');
                self.pauseButton.attr('class', 'btn btn-success btn-block');
                self.isPaused = true;
                return;
            }
            self.pauseButton.text('Pause');
            self.pauseButton.attr('class', 'btn btn-danger btn-block');
            self.isPaused = false;
        });
    }

    this.initDataTable = function(dataTable) {
        if (typeof dataTable == 'undefined') {
            dataTable = "graphite_data_table";
        }
        this.dataTable = $('#' + dataTable);
        this.dataTable.empty();
        var row = $('<tr><th>Data Number</th><th>Mean</th><th>Standard Deviation</th><th>Maximum</th><th>Minimum</th></tr>');
        this.dataTable.append(row);
    }

    this.updateDataTable = function() {
        if (this.variableNumber != this.chartPlotter.variableNumber) {
            this.variableNumber = this.chartPlotter.variableNumber
            this.initDataTable();
            for (var i = 1; i <= this.variableNumber; i++) {
                var row = $('<tr><td>Data' + i + '</td><td class="mean' + i + '"></td><td class="SE' + i + '"></td><td class="max'+i+'"></td><td class="min'+i+'"></td></tr>');
                this.dataTable.append(row);
            }
        }
        for (var i = 0; i < this.variableNumber; i++) {
            $(".mean" + (i + 1)).text("" + this.chartPlotter.getAverages()[i]);
            $(".SE" + (i + 1)).text("" + this.chartPlotter.getStandardDevs()[i]);
            $(".max" + (i + 1)).text("" + this.chartPlotter.getMaxs()[i]);
            $(".min" + (i + 1)).text("" + this.chartPlotter.getMins()[i]);
        }
    }

    this.checkBarChartAvailability = function() {
        if (!this.switchButton[0].checked && !this.chartPlotter.isBarChartAvailable()) {
            this.chartPlotter.switchToLineGraph();
            this.switchButton.bootstrapSwitch('state', true, true);
            this.switchButton.bootstrapSwitch('disabled', true);
        }
    }

    this.init = function() {
        this.initGraphPlotter(this.graphiteConfig.canvas);
        this.initExportCSV(this.graphiteConfig.exportCSVButton);
        this.initLineBarSwitch(this.graphiteConfig.switchButton);
        this.initPauseButton(this.graphiteConfig.pauseButton);
        this.initDataTable(this.graphiteConfig.dataTable);
        this.variableNumber = 0;
    }

    this.init();
}

Graphite.prototype.addNewData = function(data) {
    var firstLine = /^connect(ing|ed) at .+$/;
    if (firstLine.test(data)) return;
    this.updateDataTable();
    this.chartPlotter.addNewData(data);
    this.checkBarChartAvailability();
}

Graphite.prototype.clearData = function(data) {
    this.init();
}