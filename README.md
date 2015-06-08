## Realtime Visulization in D3.js
 
This presentation is available directly on https://rluta.github.io/d3-realtime
  
To interact with the different chart slides, use the spacebar to activate the side panels 
and/or start/stop the interaction.

# Compiling and starting the vert.x server

To use all the features of the presentation, you need to start a vert.x instance of the bundled vertx-voter module

  * clone the repository from GitHub

```  
  git clone https://github.com/rluta/d3-realtime
```  

  * add a twitter.properties file in vertx-voter/src/main/resources containing your API credentials for twitter API

```
debug=false
oauth.consumerKey=<key>
oauth.consumerSecret=<secret>
oauth.accessToken=<access>
oauth.accessTokenSecret=<access secret>
```

  * build and run the project with gradle

```  
  cd vertx-voter && gradle runMod
```

Once the server is started : 

 * The vertx eventbus is available at http://yourip:4242/eventbus 
 * The voting companion webapp is available on http://yourip:8080
 * A direct twitter SSE feed can be accessed at http://yourip:7001/stream

