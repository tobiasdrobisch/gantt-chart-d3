/**
 * Gantt chart visualizer for D3 library
 *
 * @author Dimitry Kudrayvtsev
 * @author Valery Sukhomlinov <valery.sukhomlinov@booking.com>
 * @license Apache-2.0
 * @version 2.1
 */


/**
 * Append title tooltip element to SVG objects for tasks with desc attribute set
 * @param {object} d
 * @param {integer} i
 */
function descFunction (d, i) {
    if (d.desc != undefined) {
        d3.select(this).append('title').text(d.desc);
    }
}

/**
 * Gantt chart object
 * @returns {gantt}
 */

d3.gantt = function () {

    var margin = {
        top: 20,
        right: 40,
        bottom: 20,
        left: 150
    };

    var taskTypes = [];
    var taskStatus = [];
    //var minRounds = 0;
    var maxRounds = 0;
    var height = document.body.clientHeight - margin.top - margin.bottom - 5;
    var width = document.body.clientWidth - margin.right - margin.left - 5;
    var container = "body";

    /**
     * Create new SVG object and render chart in it
     * @param {object} tasks - array of tasks
     * @returns {gantt}
     */
    function gantt(tasks) {

        initAxis();

        var svg = d3.select(container)
            .append("svg")
            .attr("class", "chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("class", "gantt-chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

        svg.selectAll(".chart")
            .data(tasks, keyFunction).enter()
            .append("rect")
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("class", classNameFunction)
            .attr("y", 0)
            .attr("transform", rectTransform)
            .attr("height", function (d) {
                return y.rangeBand();
            })
            .attr("width", function (d) {
                return (x(d.endDate) - x(d.startDate));
            })
            .each(descFunction);


        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
            .transition()
            .call(xAxis);

        svg.append("g").attr("class", "y axis").transition().call(yAxis);

        return gantt;

    };

    var classNameFunction = function(d) {
        if (taskStatus[d.status] == null) {
            // return "bar"; -> hatte das noch irgendeinen sinn?
            return "node";
        }
        return taskStatus[d.status];
    }

    /**
     * Update existing SVG chart with new tasks
     * @param {object} tasks - list of tasks (old and new ones)
     * @returns {gantt}
     */
    /*
    gantt.redraw = function (tasks) {

        initTimeDomain(tasks);
        initAxis();

        var svg = d3.select("svg");

        var ganttChartGroup = svg.select(".gantt-chart");
        var rect = ganttChartGroup.selectAll("rect").data(tasks, keyFunction);

        rect.enter()
            .insert("rect", ":first-child")
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("class", classNameFunction)
            .each(descFunction)
            .transition()
            .attr("y", 0)
            .attr("transform", rectTransform)
            .attr("height", function (d) {
                return y.rangeBand();
            })
            .attr("width", function (d) {
                return (x(d.endDate) - x(d.startDate));
            });

        rect.transition()
            .attr("transform", rectTransform)
            .attr("height", function (d) {
                return y.rangeBand();
            })
            .attr("width", function (d) {
                return (x(d.endDate) - x(d.startDate));
            });

        rect.exit().remove();

        svg.select(".x").transition().call(xAxis);
        svg.select(".y").transition().call(yAxis);

        return gantt;
    };*/

    gantt.margin = function (value) {
        if (!arguments.length)
            return margin;
        width = width + margin.left + margin.right;
        margin = value;
        width = width - margin.left - margin.right;
        return gantt;
    };
    
    /**
     * @param {object} value - array of strings with possible task types
     * @returns {*}
     */
    gantt.taskTypes = function (value) {
        if (!arguments.length)
            return taskTypes;
        taskTypes = value;
        return gantt;
    };

    /**
     * @param {object} value - mapping to CSS styles depending on task type
     * @returns {*}
     */
    gantt.taskStatus = function (value) {
        if (!arguments.length)
            return taskStatus;
        taskStatus = value;
        return gantt;
    };

    /** own set for variable maxRounds */

    gantt.maxRounds = function (value) {
        if (!arguments.length)
            return maxRounds;
        maxRounds = value;
        return gantt;
    };

    gantt.width = function (value) {
        if (!arguments.length)
            return width + margin.left + margin.right;
        width = +value - margin.left - margin.right;
        return gantt;
    };

    gantt.height = function (value) {
        if (!arguments.length)
            return height;
        height = +value;
        return gantt;
    };

    /**
     * @param {string} value - string selector for chart container
     * @returns {*}
     */
    gantt.container = function(value) {
        if (!arguments.length)
            return container;
        container = value;
        return gantt;
    }

    /**
     * Calculate key for given task for chart rendering/updating
     * @param {object} d
     * @returns {*}
     */
    var keyFunction = function (d) {
        return d.startDate + d.taskName + d.endDate;
    };

    var rectTransform = function (d) {
        return "translate(" + x(d.startDate) + "," + y(d.taskName) + ")";
    };

    //var x = d3.time.scale().domain([timeDomainStart, timeDomainEnd]).range([0, width]).clamp(true);
    var x = d3.scale.linear().domain([0, maxRounds]).range([0, width]).clamp(true);

    var y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([0, height - margin.top - margin.bottom], .1);

    //var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
     //   .tickSize(8).tickPadding(8);

    // tickSize sagt nur wie groß die striche sein sollen an der achse
    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(8);

    var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);

    var initAxis = function () {
        //x = d3.time.scale().domain([timeDomainStart, timeDomainEnd]).range([0, width]).clamp(true);
        x = d3.scale.linear().domain([0, maxRounds]).range([0, width]).clamp(true);

        y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([0, height - margin.top - margin.bottom], .1);
        //xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
        //    .tickSize(8).tickPadding(8);
        xAxis = d3.svg.axis().scale(x).orient("bottom").tickSubdivide(true)
            .tickSize(8).tickPadding(8);
        // orient("left") / right/ bottom -> ausrichtung der achsen und der beschriftung
        // ticksize sagt wie groß die striche der ticks sein sollen
        // tickpadding schiebt die label weg von der achse
        // domain gibt die dargestellten grenzen an, [-2, 2] zeigt achse von -2 bis 2
        // range sagt wo genau das dargestellt werden soll, 1. wert verschiebt linke seite, 2. rechte seite (+, -)
        yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0).tickPadding(8);
    };

    return gantt;
};
