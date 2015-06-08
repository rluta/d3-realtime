(function () {
    var mySection = $('script[src="js/slides/full-vote.js"]').get(0).parentNode;

    var worker;

    var maxDisplayVotes = 7;

    var state = {
        counts: [],
        display: [],
        total: 0,
        lost: 0,
        rates: {1:0,60:0,600:0},
        running: false,
        init: false,
        dirty: true
    };

    worker = new Worker('js/slides/worker-common.js')

    worker.addEventListener('message',function (msg) {
        if (msg.data.type == 'state') {
            updateState(msg.data)
        }
        if (msg.data.type == 'quizz') {
            state.counts = msg.data.counts;
            updateDashboard();
        }
    },false);

    function updateState(data) {
        state.counts = data.counts;
        state.total = data.total;
        state.display = state.display.concat(data.votes);
        while (state.display.length > maxDisplayVotes) {
            state.display.shift();
        }
        state.lost = data.lost;
        state.rates = data.rates;
        state.dirty = true;
    }

    var dvrate = new Gauge('#wsvotes-rate',{
        height: 300,
        width: 400,
        valueRange:[0,100000],
        arcWidth: 50,
        transition: 50,
        arcColorFn: d3.scale.ordinal().range(['#00ff60','#00ff60','#f0d023','#f0d023','#ff0000'])
    });

    var dvtable = new DataTable('#wsvotes-unit', {
        id: function (d) { return d.id}
    });

    var dvbar = new HorizontalBarChart('#wsvotes-counts', {
        transition: 50,
        height: 600,
        width: 700,
        margin: { left: 150, right: 30, top: 30, bottom: 10}
    });

    dvtable.render(state.display);
    dvrate.render(state.rates[1]);
    dvbar.render(state.counts);

    function updateDashboard() {
        dvtable.update(state.display);
        dvrate.update(state.rates[1]);
        dvbar.update(state.counts);
        state.dirty = false;
    }

    var updater = function () {
        if (state.running) window.requestAnimationFrame(updater);
        if (state.dirty) updateDashboard(); // only update if we have data changes since last frame
    };

    $(mySection).on('start', function (evt,args) {
        if (!state.init)  {
            worker.postMessage({type:'init',data: args});
            state.init = true;
        }
        if (args.rate) worker.postMessage({type:'rate',data: args.rate});
        state.running=true;
        worker.postMessage({type: 'start'});
        updater();
    });

    $(mySection).on('stop', function (evt, args) {
        if (!state.init)  {
            worker.postMessage({type:'init',data: args});
            state.init = true;
        }
        worker.postMessage({type:'stop'});
        state.running=false;
    });

    $(mySection).on('reset', function (evt, args) {
        worker.postMessage({type:'stop'});
        state = {
            counts: [],
            display: [],
            total: 0,
            lost: 0,
            rates: {1:0,60:0,600:0},
            running: false,
            init: false,
            dirty: true
        };
        updateDashboard()
    });

    $(mySection).on('update', function (evt,args) {
        if (!state.init) {
            worker.postMessage({type:'init',data: args});
            state.init = true;
        }
        worker.postMessage({type:'rate',data: args.rate});
    });

    $(mySection).on('action', function () {
        $('[data-slidepanel]', mySection).click();
    });

    $('[data-slidepanel]',mySection).slidepanel({
        orientation: 'bottom',
        mode: 'overlay' // overlay or push
    });
})();
