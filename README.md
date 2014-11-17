# Realtime Visulization in D3.js
 
This presentation is available in 2 versions :

  * stand-alone, directly on https://rluta.github.io/d3-realtime with some limited functionality
  * with a local vert.x server, enabling the complete demos
  
To interact with the different chart slides, use the *spacebar* to activate the side panels 
and/or start/stop the interaction.

## Running the vert.x server

You can retrieve the latest compiled binary from the project release tab https://github.com/rluta/d3-realtime/releases
Once the jar is downloaded, you run it with a Java 8 JVM:

```  
  java -jar d3-realtime-1.0.0-fat.jar
```  

On startup, it will try to download some non packaged public modules, so java must be able to access Internet (or you need to give proxy correct settings to the JVM)

Default configuration for the server is the following:

   * Main presentation is runnning on http://localhost:4242
   * Vote companion app is running on port 8080 all on your local computer interfaces

## Compiling the vert.x server

To compile the full presentation : 

  * clone the repository from GitHub

```  
  git clone https://github.com/rluta/d3-realtime
```  

  * build the project with maven

```  
  mvn package vertx:fatJar
```

  * run the server with a Java JVM like described in the *Running the vert.x server* chapter
