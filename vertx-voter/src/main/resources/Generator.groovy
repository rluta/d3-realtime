// simple vote generator

def rate = 10
def sendPeriod = 20
def enabled = true
def timerId = null
def count = 0

vertx.eventBus.send('quizz','get') { reply ->
    def answers = reply?.body?.answers
    def userId = 'Generated'
    vertx.eventBus.registerHandler('control') { message ->
        switch (message?.body) {
            case 'start':
                container.logger.info("received start order")
                def waitPeriod = 0
                if (timerId == null) {
                    timerId = vertx.setPeriodic(sendPeriod) { t ->
                        if  (enabled) {
                            def baseRate = rate * sendPeriod / 1000
                            if (baseRate >= 1) {
                                count = vote(answers,Math.round(Math.ceil(baseRate)),userId,count)
                                waitPeriod = 0
                            } else {
                                if (waitPeriod*baseRate >= 1) {
                                    count = vote(answers,1,userId,count)
                                    waitPeriod =0
                                } else {
                                    waitPeriod += 1
                                }
                            }
                        }
                    }
                } else {
                    container.logger.warn("Generator ${timerId} already running")
                }
                break;
            case 'stop':
                if (timerId != null) {
                    container.logger.info("Stop received")
                    vertx.cancelTimer(timerId)
                    container.logger.warn("Cancelled ${timerId}")
                    timerId = null
                }
                break
            case 'pause':
                container.logger.info("Pausing generation")
                enabled = false
                break
            case 'resume':
                container.logger.info("Resuming generation")
                enable = true
                break
            default:
                try {
                    rate = Float.parseFloat(message.body)
                    container.logger.info("Adjusted rate to ${rate}")
                } catch (Exception e) {
                    message.fail(1,'Unknown message')
                    return
                }
        }
        message.reply 'OK'
    }
}

def vote(answers,numVotes,userId,count) {
    def votes=[]
    for(int i =0; i < numVotes; i++) {
        def rand = (1..answers.size()).inject(0,{sum, val -> sum + Math.random()});
        def vote = [
            answer: answers[(int)Math.round(Math.floor(rand))],
            username: "${userId}-${count++}"
        ]
        votes << vote
    }
    vertx.eventBus.publish('votesgen', votes)
    return count;
}
