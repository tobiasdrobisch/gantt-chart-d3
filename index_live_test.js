
let nodeColors2 = ["#33b5e5", "#cc0000", "#669900", "#b4e56b", "#ffbb33", "#f540ff", "#aa18ff", "#16ffa9", "gray"];

var playButton = d3.select("#play-button");
var pauseButton = d3.select("#pause-button");
var isPaused = 0;                               // boolean if 2nd demo is running, or paused
var remainingTime = 0;                          //  if 2nd demo got paused save remaining time for continuing
var lastIndexPosition = 0;                      // if 2nd demo got paused save the index for continuing
var startOrResume = 0;                          // boolean to start or resume 2nd Demo with variables
var timerID;
var lastBarPosition;
var dataSet;
var stepProgressBar = 0;
var parameterList = [];
var time = 0;
var operations = [];

function createSVG(numParam) {

    var divFirstDemo = d3.select("#divID").append("svg").attr("id", "svgID");

    let height = String(Math.ceil(numParam/50)*20 +30) + "px";
    //console.log("height" + height);
    var svg = d3.select("#svgID")
        .style("width", "90%")
        .style("height", height);

    var row = svg.selectAll(".row")
        .data(createGrid(numParam))
        .enter().append("g")
        .attr("class", "row");

    var column = row.selectAll(".square")
        .data(function (d) {
            return d;
        })
        .enter().append("rect")
        .attr("class", "square")
        .attr("id", function (d) {
            return "rect" + d.id
        })
        .attr("x", function (d) {
            return d.x;
        })
        .attr("y", function (d) {
            return d.y;
        })
        .attr("width", function (d) {
            return d.width;
        })
        .attr("height", function (d) {
            return d.height;
        })
        .style("fill", "#fff")
        .style("stroke", "#222");
}

/**prescan dataSet for further computation **/
function fileScanning() {
    return new Promise(async function (resolve, reject) {

        let chosenParametersBA = await chooseParameters();
        setTimeout(() => reject(new Error("Whoops!")), 1000);
        await d3.tsv("data/" + useCase.file + ".tsv", function (data) {
            data.forEach(function (d) {
                data.param= +data.param;
                if ( chosenParametersBA.get(d.param)===true) {
                if (!parameterList.includes(d.param)) {
                    parameterList.push(d.param);
                }}
            });
            resolve(parameterList.sort((a,b)=>a-b));

        });

    });

}

/** create grid: cells get a squareID for parameters **/
function createGrid(numParam=600) {

    var num_columns =  50;
    var num_rows = Math.ceil(numParam/num_columns);
    var data = [];
    var xpos = 10; //starting xpos and ypos at 10 so the stroke will show when we make the grid below
    var ypos = 10;
    var width = 20;
    var height = 20;
    var squareID = 0;

    // iterate for rows
    for (var row = 0; row < num_rows; row++) {
        data.push( [] );

        // iterate for cells/columns inside rows
        for (var column = 0; column < num_columns; column++) {
            data[row].push({
                x: xpos,
                y: ypos,
                width: width,
                height: height,
                id: "" + squareID
            });
            // each cell gets an ID for further linking to parameters
            squareID++;
            // increment the x position. I.e. move it over by 50 (width variable)
            xpos += width;
        }
        // reset the x position after a row is complete
        xpos = 10;
        // increment the y position for the next row. Move it down 50 (height variable)
        ypos += height;
    }
    return data;

}

async function runMainTwo() {
    remainingTime = 0;                          //  if 2nd demo got paused save remaining time for continuing
    lastIndexPosition = 0;                      // if 2nd demo got paused save the index for continuing
    startOrResume = 0;                          // boolean to start or resume 2nd Demo with variables
    timerID;
    lastBarPosition;
    dataSet;
    stepProgressBar = 0;
    parameterList = [];
    time = 0;
    operations = [];


    /** run through dataSet and change nodecolors line for line**/
    let dataSetSelection = "data/" + useCase.file + ".tsv";
    d3.tsv(dataSetSelection, function (data) {
        dataSet = data;
    });

    let speed = document.getElementById('inputSpeed').value;
    d3.select("#svgID").remove();
    parameterList = await fileScanning();
    //console.log("PL length: " + parameterList.length);
    createSVG(parameterList.length);
    let index = 0;
    let totalTime = 0; //aktuelle zeit durch total time ist der prozentsatz zu dem die bar gefüllt sein soll
    let timeFrame = Number(speed); // wie viele sekunden sollen zusammengefasst werden


    totalTime = dataSet[dataSet.length - 1].time;
    let width = 0;
    stepProgressBar = timeFrame / (totalTime / 1000000000);
    var elem = document.getElementById("myBar");
    timerID = setInterval(() => {
        if (isPaused === 1) {
            lastIndexPosition = index;
            remainingTime = totalTime - width / 100;
            lastBarPosition = width;
            clearInterval(timerID);
            isPaused = 0;
        }

        time = time + timeFrame; //sekunden
        while (dataSet[index].time / 1000000000 < time) {
            if (parameterList.includes(dataSet[index].param)) {

                document.querySelector("#rect" + parameterList.indexOf(dataSet[index].param)).setAttribute("style", "fill:" + nodeColors2[dataSet[index].target] + "; stroke: black;");
                operations.push(dataSet[index].param);
            }
                index++;

            if (index === dataSet.length) {
                clearInterval(timerID);
                break;
            }
        }
        width = width + stepProgressBar * 100; // *100 um auf 100 prozent zu kommen
        if (width >= 100) {
            width = 100;
            document.getElementById("play-button").innerHTML = "Play";

            startOrResume = 0;
        }
        elem.style.width = width.toFixed() + "%";
        elem.innerHTML = width.toFixed() + "%";
        operations = [];
    }, 4);
}

function pause() {

    isPaused = 1;
}
