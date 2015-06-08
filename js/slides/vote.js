(function () {
    var mySection = $('script[src="js/slides/vote.js"]').get(0).parentNode;

    // config and state data
    var config = {
        hostUrl:  'http://localhost:4242/eventbus',
        displaySize: 5,
        period: 60*1000,
        reportVotes: 5
    };

    var state = {
        quizz: null,
        display: [],
        total: 0,
        counts: d3.map({}),
        running: false,
        eb: null
    };

    // Event bus handling
    function start(func) {
        state.running = true;
        state.eb = new vertx.EventBus(config.hostUrl);
        console.log("Starting eventbus")

        state.eb.onopen = function() {
            console.log("eventbus connected")

            state.eb.send('quizz', 'get', function(reply) {
                state.quizz = reply;
                for(var i in state.quizz.answers) {
                    state.counts.set(state.quizz.answers[i],0);
                }
                updateDashboard();
            });

            state.eb.registerHandler('votes', function (message) {
                if (message.answer) {
                    message = [message]
                }
                for (var idx in message) {
                    var vote = message[idx]
                    state.display.push(vote);
                    if (state.display.length > config.displaySize) state.display.shift();

                    if (vote.answer) {
                        vote.id=state.total;

                        state.counts.set(vote.answer, (state.counts.get(vote.answer) || 0) + 1);
                        state.total += 1;
                    }
                }
                // this should use request animation frame or a setInterval but will wait
                // for the final demo
                updateDashboard();
            });

            console.log("Votes handler registered")

            if (func) func();

            // periodically send a dummy event to keep the connection alive
            setInterval(function () { if (state.eb) {
                state.eb.send('quizz','get')
            }},config.period);
        };

        state.eb.onclose = function() {
            state.eb = null;
            console.log("eventbus closed")
        };

    }

    function stop(func) {
        state.running = false;
        if (state.eb && func) func();
        state.eb.close();
        state.eb=null;
    }

    // charts set up
    var dvgauge = new Gauge('#votes-lost',{
        height: 300,
        width: 400,
        valueRange:[0,100],
        arcWidth: 50,
        arcColorFn: d3.scale.ordinal().range(['#00ff60','#f0d023','#f0d023','#f0d023','#ff0000'])
    });

    var dvtable = new DataTable('#votes-unit', {
        id: function (d) { return d.id}
    });

    var dvbar = new HorizontalBarChart('#votes-counts', {
        transition: 50,
        height: 600,
        width: 700,
        margin: { left: 150, right: 30, top: 30, bottom: 10}
    });

    // charts render and update
    var countDesc = function(a,b) {return b.value - a.value;};

    dvtable.render(state.display);
    dvgauge.render(state.total);
    dvbar.render(state.counts.entries().sort(countDesc));

    function updateDashboard() {
        dvtable.update(state.display);
        dvgauge.update(state.total);
        dvbar.update(state.counts.entries().sort(countDesc));
    }

    // Slide Event handling
    $(mySection).on('start', function (evt,args) {
        start();
    });

    $(mySection).on('stop', function (evt,args) {
        stop();
    });

    $(mySection).on('update', function (evt,args) {
        stop();
    });

    $(mySection).on('twitter', function (evt,args) {
        if (state.eb) {
            state.eb.send('twitter',args.query)
        }
    });

    $(mySection).on('cheat', function (evt,args) {
        var rand = 0;
        for(var i=0; i<state.quizz.answers.length; i++) {
            rand += Math.random();
        }
        var ans = state.quizz.answers[Math.floor(rand)]
        var vote = {
            answer: ans,
            username: 'John Doe'
        };
        state.display.push(vote);
        if (state.display.length > config.displaySize) state.display.shift();
        state.counts.set(ans, (state.counts.get(ans) || 0) + 1);
        state.total += 1;
        updateDashboard();
    });

    $(mySection).on('reset', function (evt,args) {
        stop();
        state = {
            quizz: null,
            display: [],
            total: 0,
            counts: d3.map({}),
            running: false,
            eb: null
        };
        updateDashboard();
    });

    $(mySection).on('action', function () {
        $('[data-slidepanel]', mySection).click();
    });

    $('[data-slidepanel]',mySection).slidepanel({
        orientation: 'bottom',
        mode: 'overlay' // overlay or push
    });
})();
