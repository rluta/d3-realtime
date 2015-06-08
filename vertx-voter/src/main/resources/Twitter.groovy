import org.vertx.groovy.core.eventbus.Message
import twitter4j.FilterQuery
import twitter4j.Status;
import twitter4j.StatusAdapter
import twitter4j.StatusListener;
import twitter4j.TwitterStream;
import twitter4j.TwitterStreamFactory;

final TwitterStream twitterFactory = new TwitterStreamFactory().getInstance();

def queries = ['#bestofweb2015'];

final StatusListener statusListener = new StatusAdapter() {
    @Override
    public void onStatus(Status status) {

        vertx.eventBus.publish('events',[
            type:'twitter',
            data:[
                'id':status.id,
                'from':status.user.name,
                'message':status.text,
            ]
        ])

        vertx.eventBus.publish('voter',[
                'source':'twitter',
                'username':status.user.name,
                'answer':status.text,
        ])
    }
};

vertx.eventBus.registerHandler('twitter') { Message msg ->
    queries = msg.body()?.query
    connectTwitterStream(twitterFactory,statusListener,queries)
    msg.reply(queries)
}

def connectTwitterStream(twitter, listener, query) {
    twitter.cleanUp();
    twitter.clearListeners();

    twitter.addListener(listener);
    FilterQuery filterQuery = new FilterQuery();
    filterQuery.track(query as String[]);
    twitter.filter(filterQuery);
}
connectTwitterStream(twitterFactory,statusListener,queries)
