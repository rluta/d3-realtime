// simple voter endpoint, that resend raw votes to central console
// for real usage, should compute the actual vote results and broadcast
// results rather than raw votes

vertx.eventBus.registerHandler('voter') { msg ->
    vertx.eventBus.publish('votes', msg.body)
    msg.reply 'OK'
}