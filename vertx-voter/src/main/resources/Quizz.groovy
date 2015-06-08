// load static quizz data
def slurper = new groovy.json.JsonSlurper();
def data = slurper.parse(new InputStreamReader(this.class.getClassLoader().getResourceAsStream("quizzdata.json")))

vertx.eventBus.registerHandler('quizz') { msg ->
    msg.reply(data);
}
