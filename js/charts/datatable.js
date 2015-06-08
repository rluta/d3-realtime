/**
 * Created by raphael on 25/10/14.
 */

var DataTable = function (selector,options) {
    var opts = $.extend({},{
        id: function (d) { return d.name },
    },options);


    var table = d3.select(selector)
        .append('table')
        .attr('class','datatable')
        .attr('width',opts.width || '100%');

    var thead = table.append('thead').append('tr');
    var tbody = table.append('tbody');
    var identity = function (d) { return d};

    this.render = function (data) {
        this.update(data);
    };

    this.update = function (data) {
        colnames = [];
        if (data != null && data.length > 0) {
            colnames = d3.keys(data[0])
        }

        var th = thead.selectAll('th').data(colnames,identity)

        th.enter().append('th')
            .attr('class',function (d) {
                return 'col-'+d}
        );
        th.text(identity);
        th.exit().remove();

        var tr = tbody.selectAll('tr').data(data)

        tr.enter().append('tr')
        tr.exit().transition().duration(200).remove()

        var cells = tr.selectAll('td').data(d3.values)
        cells.enter().append('td')
        cells.text(identity);
        cells.exit().transition().duration(200).remove();
    };

    return this;
};
