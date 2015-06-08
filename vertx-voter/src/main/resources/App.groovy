// bootstrap verticle handling configuration and instanciation of
// main verticles

def voterWebConf = [
        web_root: 'web/voter',
        port: 8080,
        ssl: false,
        host: '0.0.0.0',
        bridge: true,
        inbound_permitted: [
                [address: 'voter'],
                [address: 'quizz'],
        ],
        outbound_permitted: [
                [address: 'control'],
        ]
]

def adminWebConf = [
        port: 4242,
        host: '127.0.0.1',
        ssl: false,
        bridge: true,
        inbound_permitted: [
                [address: 'voter'],
                [address: 'control'],
                [address: 'quizz'],
                [address: 'generator'],
        ],
        outbound_permitted: [
                [:]
        ]
]

container.with {
    // deploy the static quizz data
    deployVerticle('Quizz.groovy') { deployment ->
        if (deployment.succeeded()) {
            // deploy the voter app webserver
            deployModule('io.vertx~mod-web-server~2.0.0-final', voterWebConf)
            // deploy the main presentation webserver
            deployModule('io.vertx~mod-web-server~2.0.0-final', adminWebConf)
            // deploy the vote proxy
            deployVerticle('Vote.groovy')
            // deploy the vote proxy
            deployVerticle('SSE.groovy')
            // deploy the vote proxy
            deployVerticle('Twitter.groovy')
            // deploy the vote generator
            deployVerticle('Generator.groovy')
        } else {
            container.logger.error("Deployment failed",deployment.cause())
        }
    }
}
