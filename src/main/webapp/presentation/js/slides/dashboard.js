(function() {
var mySection = $('script[src="js/slides/dashboard.js"]').get(0).parentNode;

var gauge = new Gauge($('div.d3chart',mySection).get(0),{
    height: 300,
    width: 500,
    valueRange:[0,5000],
    arcWidth: 60,
    arcColorFn: d3.scale.ordinal().range(['#ff0000','#f0d023','#f0d023','#f0d023','#00ff60'])
});

var datatable = new DataTable('#datatable-demo', {
    id: function (d) { return d.customer+':'+d.item}
});

var customerBar = new HorizontalBarChart('#horizontal-demo', {
    height: 300,
    width: 600,
    margin: { left: 100, right: 30, top: 30, bottom: 10}
});

var orders = [];
var total =0;
var counts = d3.map({});
var countDesc = function (a,b) { return b.value - a.value; }
counts.topN = function (max) {
    return counts.entries().sort(countDesc).slice(0,max);
};

datatable.render(orders);
gauge.render(total);
customerBar.render(counts.topN(5));

function randInt(minVal,maxVal) {
    var min = minVal || 0;
    var max = maxVal || 100;
    return Math.floor(Math.random()*(max-min)+min);
}

function updateDashboard(add,max) {
    for (var i=0; i < add; i++) {
        var order = genOrder()
        orders.push(order)
        if (orders.length > max) orders.shift()
        var current = counts.get(order.customer) || 0;
        counts.set(order.customer,Math.round(current+order.price*order.quantity))
    }
    total = d3.sum(orders,function (d) {return d.price*d.quantity});

    datatable.update(orders);
    gauge.update(total);
    customerBar.update(counts.topN(5));
}

function genOrder() {
    var prefix = [
        'Funny', 'Smart', 'Ultra resistant', 'Comfortable', 'Awesome', 'Magic', 'Shiny',
        'Slick', 'Sticky', 'Fire-proof', 'Delicate', 'Sensible', 'Sexy','Plain', 'Soft',
        'Solid',
    ];

    var item = [
        'spandex pant',
        'cape',
        'costume',
        'boots',
        'shirts',
        'jacket',
        'tool belt',
        'glove',
        'briefs',
        'shorts',
        'sweater',
        'communicator',
        'gizmo',
        'mask'
    ];

    var color = [
        'black',
        'red',
        'blue',
        'yellow',
        'orange',
        'cyan',
        'green',
        'white',
        'mauve',
        'purple',
        'grey',
        'invisible'
    ];

    var customer = [
        'Batman',
        'Robin',
        'Superman',
        'Wolverine',
        'Mario',
        'Ironman',
        'Spiderman',
        'Cyclops',
        'Storm',
        'Colossus',
        'Dr Strange',
        'Pr Xavier',
        'Hulk'
    ];

    var quantities = [
        1,1,1,1,1,1,1,1,1,1,1,1,2,2,6
    ];

    var any = function (data) { return data[Math.floor(Math.random()*data.length)]}
    var name = function () { return any(prefix)+' '+any(item)}
    var price = function (minVal,maxVal) {
        return randInt(100*minVal,100*maxVal)/100;
    }

    return {customer: any(customer), item: name(), color: any(color), quantity: any(quantities), price: price(50,500) }

}

updateDashboard(5,5);
var timerId = null;

var updater = function () {
    updateDashboard(1,5);
};

$(mySection).on('start', function (evt) {
    timerId = setInterval(updater, 500);
});

$(mySection).on('stop', function (evt) {
    clearInterval(timerId);
    timerId = null;
});

$(mySection).on('action', function (evt) {
    if (timerId == null)
        $(mySection).trigger('start');
    else
        $(mySection).trigger('stop');
});
})()
