(function () {

    var mySection = $('script[src="js/slides/barchart.js"]').get(0).parentNode;
    var chart = new BarChart($('div.d3chart',mySection).get(0), {width: 900, height: 500, transition: 500});

    function genData(numOfPoints,generator,start) {
        var data =[];
        var startIdx = start || 0;

        for (var i=startIdx; i < startIdx+numOfPoints; i++) {
            data.push({x: i, y: generator()});
        }

        return data;
    }

    function makeNormalGenerator(mean, stddev) {
        return function () {
            var result = 0;
            var numOfSamples = 12;
            for (var i=0; i < numOfSamples; i++) { result += Math.random();}
            var zscore = 2*result/numOfSamples - 1; // Z normal approximation
            return zscore*stddev+mean;
        }
    }

    var start = 0;
    var step = 1;
    var points = 20;
    var generator = makeNormalGenerator(4,3);
    var data = genData(points,generator,start);
    var timerId = undefined;

    chart.render(data);

    $(mySection).on('update', function (event, args) {
        if (args.keepOld) {
            var s = parseInt(args.step) || step;
            data = data.concat(genData(s,generator,data[data.length-1].x+1)); // add new step elements
            for (var i=0; i < s; i++) data.shift() // lose the step first old elements
            step = s
        } else {
            var p = args.size || points;
            data = genData(p,generator,start);
        }
        if (args.duration) {
            var duration = parseInt(args.duration);
            chart.options('transition',duration);
        }
        chart.options('color',args.color || 0);
        chart.update(data);
    });

    $(mySection).on('start', function (event, args) {
        if (timerId == null) {
            timerId = setInterval(function () {
                for (var i=0; i < step; i++) data.shift() // lose the step first old elements
                data = data.concat(genData(step,generator,data[data.length-1].x+1)); // add new step elements
                chart.update(data);
            },args.rate);
        }
    });

    $(mySection).on('stop', function () {
        if (timerId != null) {
            clearInterval(timerId);
            timerId = undefined;
        }
    });

    $(mySection).on('action', function () {
        $('[data-slidepanel]', mySection).click();
    });

    $('[data-slidepanel]',mySection).slidepanel({
        orientation: 'right',
        mode: 'overlay' // overlay or push
    });
})();


