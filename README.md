## Realtime Visulization in D3.js
 
This presentation is available in 2 versions :

  * stand-alone, directly on https://rluta.github.io/d3-realtime with some limited functionality
  * with a local vert.x server, enabling the complete demos
  
To interact with the different chart slides, use the spacebar to activate the side panels 
and/or start/stop the interaction.

# Compiling and starting the vert.x server

To check out the full presentation : 

  * clone the repository from GitHub

```  
  git clone https://github.com/rluta/d3-realtime
``  
  * build the project with maven

```  
  mvn package vertx:fatJar
```  
  * run the server with Java JVM

```  
  java -jar target/d3-realtime-1.0.0-fat.jar
```  

Once the server is started, the main presentation is available on http://localhost:4242

The voting companion webapp is available on http://yourcomputerip:8080
