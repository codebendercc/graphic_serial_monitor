Graphite = function(graphiteConfig) {
    this.graphiteConfig = graphiteConfig;
    this.chartPlotter;
    this.exportCSVButton;
    this.switchButton;
    this.pauseButton;
    this.isPaused;
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
        this.switchButton.bootstrapSwitch('disabled',false);
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
            if (!this.isPaused) {
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

    this.checkBarChartAvailability = function() {
        if (!this.switchButton[0].checked && !this.chartPlotter.isBarChartAvailable()) {
            this.chartPlotter.switchToLineGraph();
            this.switchButton.bootstrapSwitch('state', true, true);
            this.switchButton.bootstrapSwitch('disabled',true);
        }
    }

    this.init = function() {
        this.initGraphPlotter(this.graphiteConfig.canvas);
        this.initExportCSV(this.graphiteConfig.exportCSVButton);
        this.initLineBarSwitch(this.graphiteConfig.switchButton);
        this.initPauseButton(this.graphiteConfig.pauseButton);
    }

    this.init();
}

Graphite.prototype.addNewData = function(data) {
    var firstLine = /^connect(ing|ed) at .+$/;
    if (firstLine.test(data)) return;
    this.chartPlotter.addNewData(data);
    this.checkBarChartAvailability();
}

Graphite.prototype.clearData = function(data) {
	console.log("hi")
    this.init();
}