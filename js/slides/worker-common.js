window = document = this;
importScripts('../sockjs-min-0.3.4.js');
importScripts('../vertxbus.js');
importScripts('standalone-vote-worker.js');
importScripts('vertx-vote-worker.js');

var config = {
    type: 'VertxVoter', // VertxVoter or StandaloneVoter
    hostUrl:  'http://127.0.0.1:4242/eventbus', // default vertx URL
    displayVotes: 7, // number of votes to report for display
    maxQueueLength: 10000, // if more than max, discard events and record them as lost
    highwaterPercent: 0.80, // if % of queue is reached, ask generator to throttle down
    lowwaterPercent: 0.50, // if % of queue is reached, ask generator to throttle up
    rates: [ 1, 60, 600], // compute arrival rates per sec, min and 10 min
    reportTimer: 10, // by default, report every 20ms (so about 50 per second)
    quizzUrl: '/quizzdata.json', // for standalone, get the quizz answers
    genInterval: 20  // for standalone, vote generation interval
};

var voter = null;
var state;
var lastTotal = 0;
var running = false;
var timerId = 0;

function reset() {
    // cancel the current reporting timer if set
    if (timerId > 0) clearInterval(timerId);

    state = {
        queue: [],
        lost: 0,
        total: 0,
        counts: {},
        buckets: {},
        rates: []
    };

    running = false;

    initBuckets();
}

// Utils for vote counting
function countDesc(a,b) {
    return b.value - a.value;
}

function lastVotes() {
    if (state.queue)
        return state.queue.splice(0,config.displayVotes);
    else
        return [];
}

function entries(obj) {
    var res = [];
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            res.push({key: p, value: obj[p]});
        }
    }
    return res;
}

// message rate calculation functions
function stamp(rate) {
    var d = Date.now();
    return d - (d % rate);
}

function initBuckets() {
    for (var idx in config.rates) {
        if (config.rates.hasOwnProperty(idx)) {
            var rate = config.rates[idx];
            state.buckets[rate]={ts: stamp(rate), count: 0};
            state.rates[rate]=0;
        }
    }
}

function updateRates(count) {
    for (var idx in config.rates) {
        if (config.rates.hasOwnProperty(idx)) {
            var rate = config.rates[idx];
            var ts = stamp(rate*1000);
            if (ts > state.buckets[rate].ts) {
                // new bucket, save previous rate and update new one
                state.rates[rate]=state.buckets[rate].count;
                state.buckets[rate]={ts: ts, count: 0};
            }
            state.buckets[rate].count += count;
        }
    }
}

// update calculated rates every 50 ms
setInterval(function () {
    var total = state.total;
    updateRates(total - lastTotal);
    lastTotal = total;
}, 50);

// Worker API with main script
self.addEventListener('message',function (event) {
    var message = event.data;

    if (message.type == 'init') {
        if (message.data != null) {
            for (var k in message.data) {
                config[k] = message.data[k];
            }
            reset();
        }

        if (config.type == 'StandaloneVoter')
            voter = new StandaloneVoter()
        else
            voter = new VertxVoter()
        voter.init();
    }

    if (message.type == 'start') {
        voter.start();
        running = true;
        timerId = setInterval(report, config.reportTimer);
    }

    if (message.type == 'stop')  {
        voter.stop();
        running = false;
        if (timerId > 0) {
            clearInterval(timerId);
            timerId = 0;
        }
    }

    if (message.type == 'rate')  {
        voter.updateRate(message.data)
    }

},false);

function report() {
    if (running) {
        var counts = entries(state.counts).sort(countDesc);
        var votes = lastVotes();
        self.postMessage({type:'state',
            lost: state.lost,
            total: state.total,
            rates: state.rates,
            counts: counts,
            votes: votes
        });
    }
}

// reset global state
reset();
