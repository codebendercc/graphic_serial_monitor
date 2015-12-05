/**
 * Disables / Enables the samples slider based on whether unlimited is checked or not
 */
function updateSlider()
{
    if($("#unlimited")[0].checked){

		$("#maxSamples").slider("disable");
	}
	else {
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


    /**
     * To add a new sensor, just create a new array for it and add it in the sensorHash variable
     **/

    //Arrays to hold sensor values

    window.tempCelcius = [];
    window.tempFahrenheit = [];
    window.atmPressure = [];
    window.moisture = [];
    window.alcohol = [];
    window.decibel = [];
    window.light = [];
    window.magnetic = [];

    var sensorArray = [window.tempCelcius, window.tempFahrenheit, window.atmPressure, window.moisture, window.alcohol,
                       window.decibel, window.light, window.magnetic];


    //Hash for all sensors currently supported.

    var sensorHash =
    {
        C: {
            title: 'Celcius',
            arrayName: 'tempCelcius',
            added: false
        },
        F: {
            title: 'Fahrenheit',
            arrayName: 'tempFahrenheit',
            added: false
        },
        p: {
            title: 'Atmospheric Pressure',
            arrayName: 'atmPressure',
            added: false
        },
        m: {
            title: 'Moisture',
            arrayName: 'moisture',
            added: false
        },
        a: {
            title: 'Alcohol Concentration',
            arrayName: 'alcohol',
            added: false
        },
        D: {
            title: 'Decibel Level',
            arrayName: 'decibel',
            added: false
        },
        L: {
            title: 'Light Intensity',
            arrayName: 'light',
            added: false
        },
        T: {
            title: 'Tesla',
            arrayName: 'magnetic',
            added: false
        }
    };


    //Slider to determine how many sensor values to take in before clearing out old values

    window.sliderValue = parseInt($("#maxSamples").attr("data-slider-value"), 10);
    $("#maxSamples").on("slide", function(slideEvt) {
	    window.sliderValue = slideEvt.value;
    });


    $("#unlimited").click(updateSlider);
    updateSlider();

    // Initialize compilerflasher
    compilerflasher = new compilerflasher(function () {});
    
    window.xVal = 0;

    //Initialize the chart
    window.myLineChart = new CanvasJS.Chart("myChart", {
        animationEnabled: true,
        zoomEnabled: true,
        axisX:{
            title: "time",
            valueFormatString: "hh:mm:ss",
        },
        data: [ ]
    });
    window.myLineChart.render();

    /**
     * Runs whenever new data is detected on serial monitor
     */
    $(document).on('serial_monitor_new_line', function (event, data) {

        var snapshot = getData(data); //Process the data being received


        snapshot.forEach(function(value){
            console.log(value);
            addElement({x: new Date(), y: value.value, type: value.type});
        });
        window.myLineChart.render();

    });


    // When a new arduino is connected, clear previous data from chart

    $(document).on('serial_monitor_connect', function (event, data) {
        clearData();
    });

    // When button to clear data is clicked, clear previous data from chart
    $('#clear-data').on('click', function () {
        clearData();
    });


    /**
     *  Takes data from serial monitor, trims it into an array of values and returns that array
     * @param msg - data from serial monitor
     * @returns {Array} - Array with values of different sensors
     */
    function getData(msg)
    {
        if (msg.length == 0)
        {
            return;
        }

        var lines;

        //If a particular line has a comma, split into array based on it,
        // otherwise split based on new line character
        var splitChar = '\n';
        if(msg.indexOf(',') > -1)
        {
            splitChar = ',';
        }
        lines = msg.trim().split(splitChar);

        var firstLine = /^connecting at .+$/;
        var data = [];
        var i;

        for (i=0; i<lines.length; i++)
        {
            if (!firstLine.test(lines[i]) && !isNaN(parseFloat(lines[i])))
            {
                if(!isNaN(parseFloat(lines[i])))
                {
                    var NewObject = {type: lines[i].match(/[a-z]/i) ? lines[i].match(/[a-z]/i)[0] : null, value: parseFloat(lines[i], 10)};
                    data.push(NewObject);
                }
            }
        }
        return data;
    }

    /**
     * Clears all data from the sensors, refreshing the chart
     */
    function clearData()
    {
        sensorArray.forEach(function(val, index){
            val.length = 0;
        });
        window.myLineChart.render();
    }

    /**
     * Identifies the type of data and adds it to the correct sensor array. Which plots it on the chart
     * @param element - Data to add to chart
     */
    function addElement(element)
    {
        //If type of element is recognized as a known sensor
        if(sensorHash[element.type])
        {
            // If this is the first data of this sensor
            if(typeof sensorHash[element.type].added != 'undefined' && !sensorHash[element.type].added)
            {
                var newObject;

                //Choose correct Y axis based on range of data
                if(element.y < 1000)
                {
                    newObject =
                    {
                        type: "line",
                        name: sensorHash[element.type].title,
                        showInLegend: true,
                        dataPoints: window[sensorHash[element.type].arrayName]
                    };
                }
                else
                {
                    newObject =
                    {
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
        if(!$("#unlimited")[0].checked)
        {
            //Removed the oldest element in array if number of elements in array is more than number of values
            //user wants
            if(window[sensorHash[element.type]].arrayName.length > window.sliderValue)
            {
                window[sensorHash[element.type]].arrayName.shift();
            }
        }

    }
    
});
