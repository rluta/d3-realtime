import org.vertx.groovy.core.buffer.Buffer
import org.vertx.groovy.core.eventbus.Message
import org.vertx.groovy.core.http.HttpServerRequest
import org.vertx.groovy.core.http.HttpServerResponse
import org.vertx.groovy.core.http.RouteMatcher
import org.vertx.java.core.json.JsonObject

def server = vertx.createHttpServer()
def rm = new RouteMatcher()
def clients = []

rm.get('/stream') { HttpServerRequest req ->
    req.response.statusCode = 200
    req.response.putHeader('Content-Type','text/event-stream')
    req.response.putHeader('Access-Control-Allow-Origin','*')
    req.response.putHeader('Cache-Control','public, no-cache')
    req.response.chunked = true
    req.response.write('data: {"type":"hello"}\n\n')

    clients << req.response

    req.response.closeHandler {
        clients.remove(req.response)
    }
}

rm.noMatch { HttpServerRequest req ->
    req.response.statusCode = 404
    req.response.statusMessage = "Not Found"
    req.response.end()
}

vertx.eventBus.registerHandler('events') { Message msg ->
    // we assume messages are Map,ie send as JsonObject on the bus
    def jsonBody = new JsonObject((Map)msg.body())
    def dataString = "data: ${jsonBody.encode()}\n\n"

    clients.each { HttpServerResponse resp ->
        try {
            resp.write(dataString)
        } catch (Exception e) {
            container.logger.error(e)
        }
    }
}

server.requestHandler(rm.asClosure()).listen(7001)
