# graphic_serial_monitor
Graphs for the codebender serial monitor

http://graphite.codebender.cc/

# How it works

- Reads input sent from arduino to serial monitor
- If data in serial monitor follows one of the patterns listed below, a chart will be plotted

# Patterns

- One-liner: this data pattern consists of one continous line of data. Example:

```
   data: 11 22 33 44 33 22 33.2 11.2 44.3 44.5 11.2 33.4...
```

- Multiple-liner: this data pattern consists of multiple lines, each lines contains of same number of data. Example:

```
   pressure:100 Voltage:22.1V Moisture: 21.1
   pressure:102 Voltage:22.0V Moisture: 21.2
   pressure:101 Voltage:22.0V Moisture: 21.1
   pressure:103 Voltage:22.0V Moisture: 21.1
   ....
```

- Multiple-liner with x-coordinate: this data pattern consists of multiple lines, each lines contains of same number of data. However, the first data of each line is the x-coordinate of the rest of the data. (The x-coordinates must be strictly incremental) Example:

```
   timestamp： 10303301 pressure:100 Voltage:22.1V Moisture: 21.1
   timestamp： 10303313 pressure:102 Voltage:22.0V Moisture: 21.2
   timestamp： 10303315 pressure:101 Voltage:22.0V Moisture: 21.1
   timestamp： 10303422 pressure:103 Voltage:22.0V Moisture: 21.1
   ....
```

# Developer's Guide

- Javascript Dependencies:
1.js/stringScanner.js
2.js/dataparser.js
3.js/graphplotter.js
4.js/Graphite.js

- DOM Element needed: Pls put the following DOM element in your HTML file

Element Type | Description   | Default id |
------------ | ------------- | -------------------|
div | div for chart canvas | graphite_chart_container 
button | button for CSV export | graphite_export_csv_button 
button | button for pause/start | graphite_pause_button 
bootstrap-switch | switch for bar/line chart | graphite_switch_button 
table | data table | graphite_data_table

- Constructor: Graphite(graphiteConfig)

```
   graphiteConfig(optional): customized id of DOM elements.Example:
   {
      canvas : "customized_canvas",
      exportCSVButton: "customized_exportCSVButton",
      switchButton: "customized_switchButton",
      pauseButton: "customized_pauseButton",
      dataTable: "customized_dataTable"
   }
```

- Method: addNewData(rawData)
add raw data string into graphite

- Unit test: run SpecRunner.html


# Things To Do
- Add event trigger in compilerflasher : "serial-monitor-received-data" and "serial-monitor-connected"
