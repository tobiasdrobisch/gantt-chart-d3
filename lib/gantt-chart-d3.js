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
        right: 50,
        bottom: 20,
        left: 50
        //left: 120
        //right: 70
    };
    var taskTypes = [];
    var taskStatus = [];
    var maxRounds = 0;
    //var height = document.body.clientHeight - margin.top - margin.bottom - 5;
    var height = document.body.clientHeight*0.9;
    console.log("height: " + height);

    //var width = document.body.clientWidth - margin.right - margin.left - 5;
    var width = 1000;
    var container = "body";
    var movement = 0;

    /**
     * Create new SVG object and render chart in it
     * @param {object} tasks - array of tasks
     * @returns {gantt}
     */
    function gantt(tasks, residencies) {

        var deleteSVG = d3.select(container).select("#svgFirstDemo").remove();

        // tooltip click event, or mouseover hovering?
        let mouseSetting = 'mouseover'; // change between "click" and "mouseover"
        let numParam=taskTypes.length;

        initAxis(numParam);

        var svg = d3.select(container).select("#firstDemo")
            .append("svg")
            .attr("id", "svgFirstDemo")         // funktioniert das so überhaupt?
            .attr("class", "chart")
            //.attr("width", width)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("class", "gantt-chart")
            //.attr("width", width)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
//            .attr("transform", "translate(" + 0 + ", " + margin.top + ")");
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
                return (height - margin.top - margin.bottom)/numParam;
            })
            .attr("width", function (d) {
                return (x(d.endDate) - x(d.startDate));
            })
            .each(descFunction);

        /**************** 2nd Layer for tooltip *****************/

        // tooltip: window with number of parameter and number of residencies
        var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

        var layer1 = svg.append('g')
            .selectAll('seccondLayer')
            .attr("class", "undergroundLayer")
            .data(taskTypes).enter()
            .append('rect')
            .attr("rx", 5)
            .attr("ry", 5)
            .attr('fill', 'transparent')
            .attr("height", function (d) {
                return (height - margin.top - margin.bottom) / numParam;
            })
            .attr("width", width)
            .attr("transform", rectTransformLayer)
            .on(mouseSetting, function (d, i) {
                d3.select(this).transition()
                    .duration('0')
                    .attr('fill', 'white')
                    .attr('opacity', '.55');
                div.transition()
                    .duration('0')
                    .style("opacity", 1);
                div.html("Parameter: " + d.toString() + " Residencies: " + residencies[d])
                    .style("left", (d3.event.pageX - 10) + "px")
                    .style("top", (d3.event.pageY - 50) + "px");
            })
            .on('mouseout', function (d, i) {
                d3.select(this).transition()
                    .duration('0')
                    .attr('color', 'transparent')
                    .attr('opacity', '0');
                //Makes the new div disappear:
                div.transition()
                    .duration('50')
                    .style("opacity", 0);
            });

            /*********** End of 2nd Layer tooltip Stuff ***************/

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
                .transition().call(xAxis);

            // label xAxis
            svg.append("text")
                .attr("y", (height - margin.bottom))
                .attr("x",width)
                .text("Seconds");

            svg.append("g")
                .attr("class", "y axis")
                .transition().call(yAxis);

        return gantt;

    };

    var classNameFunction = function(d) {
        if (taskStatus[d.color] == null) {
            return "8"; // white color
        }
        return taskStatus[d.color];
    }

    gantt.margin = function (value) {
        if (!arguments.length)
            return margin;
        //width = width + margin.left + margin.right;
        margin = 0;
//        margin = value;
        //width = width - margin.left - margin.right;
        return gantt;
    };
    
    /**
     * @param {object} value - array of Integers with possible task types
     * @returns {*}
     * Originally it was array of strings
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

    gantt.settings = function (value) {
        if (!arguments.length)
            return maxRounds;
        maxRounds = value;
        return gantt;
    };

    gantt.width = function (value) {
        if (!arguments.length)
            //return width + margin.left + margin.right;
            return width;
        //width = +value - margin.left - margin.right;
        return gantt;
    };

    gantt.height = function (value) {
        if (!arguments.length)
            return height;
        //height = +value;
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

    gantt.movement = function (value) {
        if (!arguments.length)
            return movement;
        movement = value;
        return gantt;
    };

    /**
     * Calculate key for given task for chart rendering/updating
     * @param {object} d
     * @returns {*}
     */
    var keyFunction = function (d) {
        return d.startDate + String(d.taskName) + d.endDate;
    };

    /************************function for 2nd layer tooltip***************************/
    var rectTransformLayer = function (d) {
        return "translate(" + String(x("0")) + "," + String(y(taskTypes.indexOf(d))) + ")";
    };
    /** *******************************************************************/

    /** hack, weil die parameternummern nicht in der angegebenen domain liegen */

    var rectTransform = function (d) {
        return "translate(" + x(d.startDate) + "," + String(y(taskTypes.indexOf(d.taskName))) + ")";
    };

    /** --------------- irrelevant, wird von initAxis überschrieben ----------------- */
    var x = d3.scale.linear().domain([0, maxRounds]).range([0, width]).clamp(true);
    var y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([0, height - margin.top - margin.bottom], .1);
    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(8);
    var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);
    /** -------------------------------------------------------------- */


    var initAxis = function (numParam) {
        x = d3.scale.linear().domain([0, maxRounds]).range([0, width]).clamp(true);
        y = d3.scale.linear().domain([0,numParam]).range([0, height - margin.top - margin.bottom]);
        // d3.scale.ordinal().domain([1, 2, 3, 4]).rangeRoundPoints([0, 100]);*/

        /** tickFormat is converting nanoseconds to seconds*/
        xAxis = d3.svg.axis().scale(x).orient("bottom")
            .ticks(5).tickSize(5).tickPadding(4).tickFormat(function(d) {return d/1e9});
        yAxis = d3.svg.axis().scale(y).orient("left")
            .tickSize(0).tickPadding(8).ticks(0);
    };
    return gantt;
};
