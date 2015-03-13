function updateSlider()
{
    if($("#unlimited")[0].checked){

		$("#maxSamples").slider("disable");
	}
	else {
		$("#maxSamples").slider("enable");
	}
}

$(document).ready(function()
{
    $("#maxSamples").slider({
        	scale: 'logarithmic'
    });
    
    window.sliderValue = parseInt($("#maxSamples").attr("data-slider-value"), 10);
    $("#maxSamples").on("slide", function(slideEvt) {
    	window.sliderValue = slideEvt.value;
    });

    
    $("#unlimited").click(updateSlider);
    updateSlider();

});

$(function() {
    // Initialize compilerflasher
    compilerflasher = new compilerflasher(function () {});
    
    window.xVal = 0;
    window.buffer = [];
    window.myLineChart = new CanvasJS.Chart("myChart", {
        zoomEnabled: true,
        title:{
            text: "Serial monitor graph"
        },
        data: [{
            type: "line",
            dataPoints: window.buffer
        }]
    });
    window.myLineChart.render();
    
    var $hud = $('#serial_hud');
    $hud.on('clear_hud', function (e) {
        $hud.text('');
        if (window.history)
        {
            window.history = [];
        }
    });
    
    var $keepHistory = $('#keep-history');
    var keepHistory = $keepHistory.is(':checked');
    $('#keep-history').on('click', function () {
        keepHistory = $keepHistory.is(':checked');
    });
    
    var samples = 0;
    
    var $historyBack = $('#history-back');
    var historyBack = $historyBack.val();
    $historyBack.on('change', function () {
        historyBack = $historyBack.val();
    });
    
    $(document).on('serial_monitor_new_line', function (event, data) {
        var snapshot = getData(data);

        snapshot.forEach(function(number){

            addElement({x:xVal++, y: number});
        })
        window.myLineChart.render();

    });
    
    $(document).on('serial_monitor_connect', function (event, data) {
        clearData();
    });

    $('#dummy-button').on('click', function () {
        if ($(this).data('mode') == 'add')
        {
            dummyData();
            $(this).text('Stop dummy data').data('mode', 'remove');
        }
        else
        {
            clearInterval(window.dummyInterval);
            $(this).text('Add dummy data').data('mode', 'add');
        }
    });
    
    $('#clear-data').on('click', function () {
        clearData();
    });
    
    function getData(msg)
    {
        if (msg.length == 0)
        {
            return;
        }
        
        var lines = msg.trim().split('\n');
        var re_firstLine = /^connecting at .+$/;
        var data = [];
        var i;
        for (i=0; i<lines.length; i++)
        {
            if (!re_firstLine.test(lines[i]))
            {
                data.push(parseFloat(lines[i], 10));
            }
        }
        return data;
    }
    
    // function parseData(data)
    // {
    //     if (!window.dataHistory)
    //     {
    //         window.dataHistory = [];
    //     }
    //     var threshold = 5;
    //     if (window.dataHistory.length == 0)
    //     {
    //         window.dataHistory = data;
    //         return data;
    //     }
        
    //     var i, j;
    //     var indexes = [];
    //     for (i=0; i<data.length; i++)
    //     {
    //         for (j=0; j<window.dataHistory.length; j++)
    //         {
    //             if (data[i] != window.dataHistory[j])
    //             {
    //               indexes.push(i);
    //             }
    //         }
    //     }
        
    //     var diff = [];
    //     var k;
    //     for (k=0; k<indexes.length; k++)
    //     {
    //         diff.push(indexes[k]);
    //         window.dataHistory.push(indexes[k]);
    //     }
    //     // console.log(window.dataHistory, diff);
    //     return diff;
    // }
    
    function clearData()
    {
        window.buffer.length = 0;
        window.myLineChart.render();
    }
    
    function dummyData()
    {
        window.counter = 0;
        window.dummyInterval = setInterval(function () {
        var point = (Math.exp(Math.sin((new Date).getTime() / 2000.0 * Math.PI)) - 0.36787944) * 108.0;
        
        addElement({x:xVal++, y: point});
        window.myLineChart.render();

        }, 40);
    }
    
    
    function addElement(element)
    {
        window.buffer.push(element);

        if(!$("#unlimited")[0].checked)
        {
            while(window.buffer.length > window.sliderValue)
            {
                window.buffer.shift();
            }
        }

    }
    
});
