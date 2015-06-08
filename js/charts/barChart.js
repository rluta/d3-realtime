/**
 * Created by raphael on 25/10/14.
 */

var BarChart = function (selector,options) {
    var that = this;
    var opts = $.extend({},{
        transition: 200,
        x: function (d) { return d.x; },
        y: function (d) { return d.y; }
    },options);

    D3Chart.call(this,selector,opts);

    var axisX, axisY;
    var xScale, yScale;
    var xAxisFn, yAxisFn;

    var svg = this.svg();

    this._render = function (data) {
        xScale = d3.scale.ordinal().rangeRoundBands([0, this.width()], .1);
        yScale = d3.scale.linear().range([this.height(), 0]);

        xAxisFn = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(20);
        yAxisFn = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .ticks(10);

        if (axisX == null) {
            axisX = svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + this.height() + ")")
        }

        if (axisY == null) {
            axisY = svg.append("g").attr("class", "y axis");
        }

        this._update(data);
    };

    var colorize = function (selection) {
        "use strict";
        return function (d,idx) {
            if (that.options('color') == "1") {
                if (selection.enter()[0][idx] && selection.enter()[0][idx].__data__ == d) return "bar enter";
                if (selection.exit()[0][idx] && selection.exit()[0][idx].__data__ == d) return "bar exit";
            }
            return "bar";
        }
    }
    this._update = function (data) {
        var duration = this.options('transition');
        var height = this.height()-1;
        var x = this.options('x');
        var y = this.options('y');

        xScale.domain(data.map(x));
        yScale.domain([0, d3.max(data, y)]);

        axisX.call(xAxisFn);
        axisY.call(yAxisFn);

        var selectedData = svg.selectAll(".bar").data(data, x);

        selectedData.enter()
            .append("rect")
            .attr("class", colorize(selectedData))
            .attr("x", function(d) { return xScale(x(d)); })
            .attr("y", height)
            .attr("width", xScale.rangeBand())
            .attr("height", (this.options('color')?0:0));

        selectedData.transition().duration(duration)
            .attr("class", colorize(selectedData))
            .attr("x", function(d) { return xScale(x(d)); })
            .attr("y", function(d) { return yScale(y(d)); })
            .attr("width", xScale.rangeBand())
            .attr("height", function(d) { return height - yScale(y(d)); });

        selectedData.exit().transition().duration(duration)
            .attr("class", colorize(selectedData))
            .attr("x", function(d) { return xScale(x(d)); })
            .attr("y", height)
            .attr("width", xScale.rangeBand())
            .attr("height", 0)
            .remove();
    };

    return this;
};

BarChart.prototype = Object.create(D3Chart.prototype);
