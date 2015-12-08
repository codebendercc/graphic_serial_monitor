# graphic_serial_monitor
Graphs for the codebender serial monitor

http://graphite.codebender.cc/


Test Sketch: https://codebender.cc/sketch:166269

Currently Supported Sensors:
- Temperature in Celsius [C]
- Temperature in Fahrenheit [F]
- Atmospheric Pressure [p]
- Moisture [m]
- Alcohol Concentration [a]
- Decibel Level [D]
- Light Intensity [L]
- Magnetic Field [T]

# How it works

- Reads input sent from arduino to serial monitor
- If data in serial monitor is a number followed by one of the alphabets above, it is from a recognized sensor
- Inputs the data into the chart

# Example serial monitor data:

```
   67F,
   29C, 33C
   1358p,
   70F,
   30C,34C
   1320p,73F,
   32C,35C
   1290p,72F,
   30C,34C
   70F,
   28C,32C
   1333p,1305p,1394p,1355p,1411p,1421p,68F,
```

Data can be either single line, or multi line. If single line, make it comma separated.


# Todo

- Currently it accepts data only from 1 sensor of each type, we want it to accept data from multiple sensors of one type

The following steps need to be done to add this functionality:-
1) In the getData function, split data first by new line into array1
2) Run a loop on array1 and split data by comma into array2
3) Run a nested loop on array2 add the value to the return array, in the new object being added, specify whether the integer value of sensor.

- Therefore the following three steps will manipulate the data in the following fashion:

- Original data:

```
   67F, 70F,
   29C, 33C, 30C, 34C
   1358p, 1320p,
```

- array1 after split:

```
index 0: 67F, 70F,
index 1: 29C, 33C, 30C, 34C
index 2: 1358p, 1320p,
```

- Here 29C is first sensor celsius temperature sensor, 33C is from second sensor, 30C is from third sensor and so on.

4) In addElement function, check integer value of sensor
5) If array for sensor with that integer value doesnt exist, then dynamically create an array and add the data to it
6) If the array exists just add the data to the array
