/**
 * Created by raphael on 25/10/14.
 */

var D3Chart = function (parentSelector, options) {
    var opts = $.extend({}, {
        width: 500,
        height: 500,
        margin: {top: 20, right: 20, bottom: 30, left: 40}
    },options);

    var margin = opts.margin;
    var outerWidth = opts.width;
    var outerHeight = opts.height;
    var innerWidth = outerWidth - margin.left - margin.right;
    var innerHeight = outerHeight - margin.top - margin.bottom;

    var _svg =undefined;

    // initialize the SVG element with default margins and set
    // origin to top, left of inner dimensions
    _svg = d3.select(parentSelector).append("svg")
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    this.height = function() {
        return innerHeight;
    };

    this.width = function() {
        return innerWidth;
    };

    this.svg = function() {
        return _svg;
    };

    this.options = function (key,val) {
        if (key == null) {
            return opts;
        } else if (typeof (key) == "object") {
            opts = key;
        } else if (val != null) {
            opts[key] = val;
        } else {
            return opts[key];
        }
    };

    this.render= function (data) {
        if (this._render)
            this._render(data);
        else
            console.log("No render function defined for this chart")
    };

    this.update = function (data) {
        if (this._update)
            this._update(data)
        else
            this.render(data)
    }
    return this;
};
