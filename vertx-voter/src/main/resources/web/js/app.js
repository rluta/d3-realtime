(function VoteModel() {

    var that = this;
    var eb = new vertx.EventBus(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/eventbus');

    that.quizz = ko.observable({
        id:0,
        question:'No current vote',
        answers:[]
    });
    that.username = ko.observable(generateUser());
    that.enabled = ko.observable('inactive');


    eb.onopen = function() {
        // Get the static data
        eb.send('quizz', {action: 'find' },
            function(reply) {
                that.quizz(reply);
                that.startVote()
            });
    };

    eb.onclose = function() {
        eb = null;
    };

    that.startVote = function () {
        that.enabled('active');
    };

    that.submitVote = function(name) {

        var vote = {
            username: that.username(),
            answer: name
        };

        eb.publish('voter', vote); // we don't wait for confirmation, maybe we should :)
        console.log('Vote OK');
    };

    function generateUser() {
        var adjectives = [
            'Great','Silly','Useful','Awesome','Useless','Magic',
            'Worthy','Famous','Super','Evil','Gnomic','Ultimate'
        ];

        var nouns = [
            'Hector','Vlad','Albert','Bart','Rocky','Alfred',
            'Dora','Sacha','Kate','Mickey','Will','Sam',
            'Frodo','Bilbo','Gandalf','Luke','Vader','Leia'
        ];

        return adjectives[Math.floor(Math.random()*adjectives.length)]+' '+nouns[Math.floor(Math.random()*nouns.length)];

    }

    ko.applyBindings(that);
})();