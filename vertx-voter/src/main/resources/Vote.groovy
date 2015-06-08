// simple voter endpoint, that resend raw votes to central console
// for real usage, should compute the actual vote results and broadcast
// results rather than raw votes

vertx.eventBus.send('quizz','get') { reply ->
    def answers = reply?.body?.answers*.toLowerCase()

    vertx.eventBus.registerHandler('voter') { msg ->
        if (msg.body.source == 'twitter') {
            def answer = msg.body.answer.toLowerCase().split(/ +/).grep(~/^[^#]*/)
            def response = answers.intersect(answer)
            msg.body = [
                answer: (response.size() > 0 ) ? response.pop() : null,
                username: msg.body.username
            ]
        }
        if (msg.body.answer != null) {
            vertx.eventBus.publish('votes', msg.body)
            vertx.eventBus.publish('votesgen', msg.body)
            vertx.eventBus.publish('events', msg.body)
        }
        msg.reply 'OK'
    }
}
