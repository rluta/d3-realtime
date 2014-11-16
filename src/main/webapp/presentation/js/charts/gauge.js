/**
 * Created by raphael on 26/10/14.
 */

var Gauge = function (selector,options) {
    var opts = $.extend({},{
        // domain and range
        valueRange: [0,10],
        angleRange: [-90,90],
        // arc options
        arcMargin: 20,
        arcWidth: 20,
        arcColorFn: d3.interpolateHsl(d3.rgb('#e8e2ca'), d3.rgb('#3e6c0a')),
        // pointer options
        pointerWidth: 10,
        pointerTailLength: 5,
        pointerHeadLengthPercent: 0.9,
        transition: 750,
        // label options
        ticks: 5,
        labelFormat: d3.format('g'),
        labelMargin: 10
    },options);

    D3Chart.call(this,selector,opts);

    // arc variables
    var radius = Math.max(this.height(),this.width()) / 2;
    var minAngle = this.options('angleRange')[0];
    var maxAngle = this.options('angleRange')[1];
    var range = maxAngle - minAngle;
    var arc = d3.svg.arc()
        .innerRadius(radius - this.options('arcWidth') - this.options('arcMargin'))
        .outerRadius(radius - this.options('arcMargin'))
        .startAngle(function(d, i) {
            var ratio = d * i;
            return deg2rad(minAngle + (ratio * range));
        })
        .endAngle(function(d, i) {
            var ratio = d * (i+1);
            return deg2rad(minAngle + (ratio * range));
        });

    // arc legend and scaling
    var scale = d3.scale.linear().range([0,1]).domain(this.options('valueRange'));
    var numOfTicks = this.options('ticks');
    var ticks = scale.ticks(numOfTicks);
    var tickData = d3.range(numOfTicks).map(function() {return 1/numOfTicks;}); //equal split of range

    // pointer variables
    var pointerHeadLength =  Math.round(radius * this.options('pointerHeadLengthPercent'));
    var pointer = undefined;
    var value = undefined;
    var valueFormat = d3.format('.2f');

    // caclulate the pointer angle based on data value
    function angle(d) {
        return minAngle + Math.min(Math.max(0,scale(d) * range),range);
    }

    this._render = function (data) {
        var centerTx = 'translate('+radius +','+ radius +')';
        var arcColorFn = this.options('arcColorFn');

        var svg = this.svg().append('g')
            .attr('class', 'gauge')
            .attr('width', this.width())
            .attr('height', this.height());

        var arcs = svg.append('g')
            .attr('class', 'arc')
            .attr('transform', centerTx);

        arcs.selectAll('path')
            .data(tickData)
            .enter().append('path')
            .attr('fill', function(d, i) { return arcColorFn(d * i); })
            .attr('d', arc);

        var labelMargin = this.options('labelMargin');
        var labels = svg.append('g')
            .attr('class', 'label')
            .attr('transform', centerTx);
        labels.selectAll('text')
            .data(ticks)
            .enter().append('text')
            .attr('transform', function(d) {
                return 'rotate(' +angle(d) +') translate(0,' +(labelMargin - radius) +')';
            })
            .text(this.options('labelFormat'));

        var pointerWidth = this.options('pointerWidth');
        var pointerTailLength = this.options('pointerTailLength');
        var lineData = [
            [pointerWidth / 2, 0],
            [0, -pointerHeadLength],
            [-(pointerWidth / 2), 0],
            [0, pointerTailLength],
            [pointerWidth / 2, 0]
        ];

        var valueg = svg.append('g')
            .attr('class', 'value')
            .attr('transform', centerTx);

        value = valueg.append('text')
            .attr('transform', 'translate(0,50)')

        var pointerLine = d3.svg.line().interpolate('monotone');
        var pg = svg.append('g').data([lineData])
            .attr('class', 'pointer')
            .attr('transform', centerTx);

        pointer = pg.append('path')
            .attr('d', pointerLine)
            .attr('transform', 'rotate(' +minAngle +')');

        this._update(data === undefined ? 0 : data);
    };

    this._update = function(data) {
        var duration = this.options('transition');
        pointer.transition().duration(duration)
            .attr('transform', 'rotate(' +angle(data) +')');

        value.text(valueFormat(data));

    };

    function deg2rad(deg) {
        return deg * Math.PI / 180;
    }

    return this;
};
Gauge.prototype = Object.create(D3Chart.prototype);