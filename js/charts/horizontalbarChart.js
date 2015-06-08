/**
 * Created by raphael on 25/10/14.
 */

var HorizontalBarChart = function (selector,options) {
    var opts = $.extend({},{
        transition: 200,
        y: function (d) { return d.key; },
        x: function (d) { return d.value; }
    },options);

    D3Chart.call(this,selector,opts);

    var axisX, axisY;
    var xScale, yScale;
    var xAxisFn, yAxisFn;

    var svg = this.svg();

    this._render = function (data) {
        xScale = d3.scale.linear().range([0,this.width()]);
        yScale = d3.scale.ordinal().rangeRoundBands([0, this.height()], .1);

        xAxisFn = d3.svg.axis().scale(xScale).orient("top").ticks(5);
        yAxisFn = d3.svg.axis().scale(yScale).orient("left");

        if (axisX == null) {
            axisX = svg.append("g").attr("class", "x axis")
        }

        if (axisY == null) {
            axisY = svg.append("g").attr("class", "y axis");
        }

        this._update(data);
    };

    this._update = function (data) {
        var duration = this.options('transition');
        var height = this.height()-1;
        var width = this.width()-1;
        var x = this.options('x');
        var y = this.options('y');

        xScale.domain([0, d3.max(data, x)]);
        yScale.domain(data.map(y));

        axisX.call(xAxisFn);
        axisY.call(yAxisFn);

        var selectedData = svg.selectAll(".bar").data(data, y);

        selectedData.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("y", function(d) { return yScale(y(d)); })
            .attr("x", xScale(0)+1)
            .attr("height", yScale.rangeBand())
            .attr("width", 0);

        selectedData.transition().duration(duration)
            .attr("y", function(d) { return yScale(y(d)); })
            .attr("height", yScale.rangeBand())
            .attr("width", function(d) { return xScale(x(d)); });

        selectedData.exit().transition().duration(duration)
            .attr("y", function(d) { return yScale(y(d)); })
            .attr("height", yScale.rangeBand())
            .attr("width", 0)
            .remove();
    };

    return this;
};

HorizontalBarChart.prototype = Object.create(HorizontalBarChart.prototype);
