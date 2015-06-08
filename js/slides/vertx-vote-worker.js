function VertxVoter() {
    "use strict";
    var eb = null;

    return {
    // Vertx event bus handling
        init: function (onOpen) {
            if (onOpen == undefined) {
                onOpen = function () {
                    eb.send('quizz',  {action: 'find'},
                        function(reply) {
                            var quizz = reply;
                            for(var i in quizz.answers) {
                                state.counts[quizz.answers[i]]=0;
                            }
                            self.postMessage({type:'quizz',counts:entries(state.counts)})
                        });
                }
            }
            eb = new vertx.EventBus(config.hostUrl);

            eb.onopen = function() {

                eb.registerHandler('votesgen', function (message) {
                    if (message.answer) {
                        message = [message]
                    }
                    for (var idx in message) {
                        var vote = message[idx]
                        // if above max length, don't store message else queue
                        if (state.queue.length >= config.maxQueueLength) {
                            state.lost += 1;
                        } else {
                            state.queue.push(vote);
                        }
                        // update vote counts if there's an answer
                        if (vote.answer) {
                            state.counts[vote.answer] += 1;
                            state.total += 1;
                        }
                        // if above high threshold, discard queue elements to bring it down to low water
                        // these elements will never be displayed
                        if (state.queue.length > config.maxQueueLength*config.highwaterPercent) {
                            state.queue.splice(0,config.maxQueueLength*(config.highwaterPercent-config.lowwaterPercent))
                        }
                    }
                });

                onOpen();
            };

            eb.onclose = function() {
                eb = null;
            };
        },
        start: function () {
            if (eb == null) {
                this.init(function () {
                    eb.send('control','start');
                });
            } else {
                eb.send('control','start');
            }
        },
        stop: function () {
            if (eb != null) {
                eb.send('control','stop', function () {
                    eb.close();
                })
            }
        },
        updateRate: function (rate) {
            if (eb == null) {
                this.init(function () {
                    eb.send('control',rate);
                });
            } else {
                eb.send('control',rate);
            }
        }
    }
}
