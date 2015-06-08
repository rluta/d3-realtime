function StandaloneVoter() {
    "use strict";

    var generationInterval = 20;
    var targetMsgRate = 1000;
    var generatorTimerId;
    var answers = [];
    var waitPeriod=0;

    //simple XHR request in pure JavaScript, does not support old browsers
    var load = function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = ensureReadiness;

        function ensureReadiness() {
            if(xhr.readyState < 4) return;
            if(xhr.status !== 200) return;
            if(xhr.readyState === 4) {
                callback(xhr);
            }
        }

        xhr.open('GET', url, true);
        xhr.send('');
    };

    return {
        vote: function () {
            var rand = 0;
            for(var i=0; i<answers.length; i++) {
                rand += Math.random();
            }
            var vote = {
                answer: answers[Math.floor(rand)],
                username: 'LocalGen-' + state.total++
            };

            state.queue.push(vote);
            state.counts[vote.answer] += 1;

            // if above high threshold, discard queue elements to bring it down to low water
            // these elements will never be displayed
            if (state.queue.length > config.maxQueueLength*config.highwaterPercent) {
                state.queue.splice(0,config.maxQueueLength*(config.highwaterPercent-config.lowwaterPercent))
            }
        },
        init: function() {
            load(config.quizzUrl, function(xhr) {
                var quizz = JSON.parse(xhr.responseText);
                answers = quizz.answers;
                for(var i in answers) {
                    state.counts[answers[i]]=0;
                }
                self.postMessage({type:'quizz',counts:entries(state.counts)})
            });
        },
        start: function () {
            var that = this;
            generatorTimerId = setInterval(function () {
                var baseRate = targetMsgRate * generationInterval / 1000;
                if (baseRate > 1) {
                    for(var i=0; i < Math.ceil(baseRate); i++) {
                        that.vote();
                    }
                    waitPeriod=0;
                } else if (baseRate*waitPeriod >= 1){
                    that.vote();
                    waitPeriod=0;
                } else {
                    waitPeriod+=1;
                }
            },generationInterval);
        },
        stop: function() {
            clearInterval(generatorTimerId);
        },
        updateRate: function (rate) {
            targetMsgRate = parseInt(rate) || 1000;
        }
    }
}

