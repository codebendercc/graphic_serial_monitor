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

    window.tempCelcius = [];
    window.tempFahrenheit = [];
    window.atmPressure = [];

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
        }
    };
    
    window.sliderValue = parseInt($("#maxSamples").attr("data-slider-value"), 10);
    $("#maxSamples").on("slide", function(slideEvt) {
	    window.sliderValue = slideEvt.value;
    });


    $("#unlimited").click(updateSlider);
    updateSlider();

    // Initialize compilerflasher
    compilerflasher = new compilerflasher(function () {});
    
    window.xVal = 0;

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
            //addElement({x:xVal++, y: value.value, type: value.type});

        });
        window.myLineChart.render();

    });
    
    $(document).on('serial_monitor_connect', function (event, data) {
        clearData();
    });

    //$('#dummy-button').on('click', function () {
    //    if ($(this).data('mode') == 'add')
    //    {
    //        dummyData();
    //        $(this).text('Stop dummy data').data('mode', 'remove');
    //    }
    //    else
    //    {
    //        clearInterval(window.dummyInterval);
    //        $(this).text('Add dummy data').data('mode', 'add');
    //    }
    //});
    
    $('#clear-data').on('click', function () {
        clearData();
    });
    
    function getData(msg)
    {
        if (msg.length == 0)
        {
            return;
        }

        var lines;
        if(msg.indexOf(',') > -1)
        {
            lines = msg.split(',');
            lines = lines.filter(Boolean);
        }
        else
        {
            lines = msg.trim().split('\n');
        }

        var re_firstLine = /^connecting at .+$/;
        var data = [];
        var i;

        for (i=0; i<lines.length; i++)
        {
            if (!re_firstLine.test(lines[i]))
            {
                if(!isNaN(parseFloat(lines[i])))
                {
                    var NewObject = {type: lines[i].match(/[a-z]/i) ? lines[i].match(/[a-z]/i)[0] : null, value: parseFloat(lines[i], 10)};
                    data.push(NewObject);
                    console.log(NewObject);
                }
            }
        }
        return data;
    }

    function clearData()
    {
        window.buffer.length = 0;
        window.tempCelcius.length = 0;
        window.tempFahrenheit.length = 0;
        window.myLineChart.render();
    }
    
    //function dummyData()
    //{
    //    window.counter = 0;
    //    window.dummyInterval = setInterval(function () {
    //    var point = (Math.exp(Math.sin((new Date).getTime() / 2000.0 * Math.PI)) - 0.36787944) * 108.0;
    //
    //    addElement({x:xVal++, y: point});
    //    window.myLineChart.render();
    //
    //    }, 40);
    //}
    
    
    function addElement(element)
    {
        console.log(element);
        console.log(sensorHash[element.type]);
        if(sensorHash[element.type])
        {
            console.log(sensorHash[element.type]);
            console.log(window[sensorHash[element.type].added]);
            if(typeof sensorHash[element.type].added != 'undefined' && !sensorHash[element.type].added)
            {
                var newObject;
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


                console.log(window.myLineChart.options);
                window.myLineChart.options.data.push(newObject);
                console.log(window.myLineChart.options);

                sensorHash[element.type].added = true;
            }

            window[sensorHash[element.type].arrayName].push(element);
        }
        else
        {

        }

        if(!$("#unlimited")[0].checked)
        {
            if(window[sensorHash[element.type]].arrayName.length > window.sliderValue)
            {
                window[sensorHash[element.type]].arrayName.shift();
            }
        }

    }
    
});
