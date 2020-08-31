


// prepared UseCases with default Parameters automatically bind into dropdown tool
var allUseCases = [
    {name: "Matrix Factorization on 10m x 1m matrix, rank 100, 8x4 workers, 0.01% of parameters", file: "mf-rect-100-8x4.10kth-parameter.combined.sorted", defPar:"0m-11m"},
    {name: "ComplEx-4000 on dbpedia500, 8x4 workers, 0.1% of parameters", file: "complex-4000-8x4.1kth-parameter.combined.sorted", defPar:"0-500k"},
    // {name: "ComplEx-4000 on dbpedia500, 8x4 (0.01% of parameters) " , file: "complex-4000-8x4.10kth-parameter.combined.sorted", defPar:"0-500k"},
];

// Matrix Factorization on 10m x 1m matrix, rank 100, 8x4 workers, 0.01% of parameters
//      biggestParameter: 11 010 000


//TODO: try to minimze number of global variables and improve code structure

let nodeColors2 = ["#33b5e5", "#cc0000", "#669900", "#b4e56b", "#ffbb33", "#f540ff", "#aa18ff", "#16ffa9", "gray"];

var MAX_PARAM = 12e6+1;                 // highest possible parameter (for bitArrays)
var updatesPerSec = 100;                // setInterval every updatePerSec/10 milliseconds

var useCase;                            // selected useCase
var dataSet;                            // dataset of selected UseCase
var reset = 0;                          // for handling resetButton
var isPaused = 0;                       // boolean if grid demo is running, or paused
var notStarted = true;                  // boolean if grid demo started
var lastIndexPosition = 0;              // if grid demo got paused save the index for resuming
var lastPosPB;                          // if grid demo got paused save position of progress bar

var timerID;                            // for clearing setInterval
var stepProgressBar = 0;
var parameterList = [];
var testTime = 0;
var firstMoveTime = 0;                  // hide Data loading
var firstMoveIndex =0;                  // hide Data loading

var divPB;                              // div container progress bar
var displaySeconds;                     // container input field for displaying time of demo

// TODO: center grid demo like gantt chart with white space left and right of it
var margin = {
    top: 20,
    right: 50,
    bottom: 20,
    left: 50
};

function createSVG(numParam) {

    var divFirstDemo = d3.select("#divID");

    var divBar = d3.select("#divProgressBar");


    let height = String(Math.ceil(numParam/50)*20 +15) + "px";
    var svg = d3.select("#gridID")
        .style("width", "100%")
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

/********** prescan dataSet for further computation **********
 *
 * @ Return {Promise: sorted Array of Parameters for plotting}
 */
//TODO: should first Move be earlier?
//TODO: is promise and await/async handled correctly in fileScanning? does this make sense?

function fileScanning() {
    console.time("test filescanning");
    return new Promise(async function (resolve, reject) {
        let hideDataLoading = document.getElementById("hideDataLoading").checked;
        let helpString = document.getElementById("inputParameters").value.replace(/\s/g, "");
        let chosenParametersBA = new BitArray({MAX_PARAM});
        chosenParametersBA = await chooseParametersForGrid(helpString);
        setTimeout(() => reject(function() {alert("Something went wrong! Please refresh Website."); new Error("Whoops!")}), 1000);
        await d3.tsv("data/" + useCase.file + ".tsv", function (data) {
            if (hideDataLoading) {
                console.log("hide data loading");
                data.forEach(function (d, i) {
                    //data.time = +data.time;
                    //data.param= +data.param;
                    //console.log(typeof(data.param));
                    //console.log(typeof(d.param));
// TODO: wieso ist d.param vom typ string und nicht int? CHECKEN ob das üperhaupt funktioniert
                    //TODO: includes needs a string not a number !!!
                    if ( chosenParametersBA.get(Number(d.param))===true) {
                        if (firstMoveTime === 0 && parameterList.includes(d.param)) { // includes needs a string
                            firstMoveIndex = i;
                            firstMoveTime = +d.time;
                        }
                        if (!parameterList.includes(d.param)) {
                            parameterList.push(d.param);
                        }
                    }
                });
            } else {
                console.log("with data loading");
                data.forEach(function (d) {
                    //data.time = +data.time;
                    //data.param= +data.param;
                    if ( chosenParametersBA.get(d.param)===true) {
                        if (!parameterList.includes(d.param)) {
                            parameterList.push(d.param);
                        }
                    }
                });
            }
            resolve(parameterList.sort((a,b)=>a-b));
            console.timeEnd("test filescanning");
        });

    });

}

/**** chooseParametersForGrid
 * TextInput: choosing parameters for plotting
 * possible writing:
 * spaces will be ignored; 1st number < 2nd number; 2,3 -> select: 2 and 3; 2-5 -> select: [2,3,4,5]
 * numbers can appear multiple times and also overlap, doesn't matter
 * m is getting replaced by 000000, k by 000 and all by 0-MAX_PARAM
 * example of selection: 0,12-17, 23-25,47,14 -> [0,12,13,14,15,16,17,23,24,25,47]
 *
 * Return: chosenParametersBitArray: all possible parameters of text input are set 1, (or true)
 * ****/

//TODO: ? 1.5m is not 1 500 000, yet. would be 1.5

function chooseParametersForGrid(string) {
    console.log("chooseParameters String: " + string);
    let allParametersToPlot = [];
    let helpArray = [];
    let stringParameters = "";
    const chosenParametersBitArray = new BitArray(MAX_PARAM);
    if (string.includes('all')) {stringParameters = "0-" + MAX_PARAM} else {
        let inputString = string.replace(/k/g,'000');
        stringParameters = inputString.replace(/m/g,'000000'); }
    allParametersToPlot = stringParameters.split(",");
    for(let i = 0; i<allParametersToPlot.length; i++) {
        helpArray = allParametersToPlot[i].split('-');
        if (helpArray.length === 1) {
            chosenParametersBitArray.set(parseInt(helpArray[0]), true);
        } else {
            let lowEnd = Number(helpArray[0]);
            let highEnd = Number(helpArray[1]);
            for (let j = lowEnd; j <= highEnd; j++) {
                chosenParametersBitArray.set(j, true);
            }
        }
    }
    return chosenParametersBitArray;
}

/** create grid: cells get a squareID for parameters **/
function createGrid(numParam) {

    var num_columns =  50;
    var num_rows = Math.ceil(numParam/num_columns);
    var data = [];
    var xpos = 0; //starting xpos and ypos at 0
    var ypos = 0;
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
        xpos = 0;
        // increment the y position for the next row. Move it down 50 (height variable)
        ypos += height;
    }

    return data;
}

async function start() {

    document.getElementById("play-button").innerHTML = "Pause";


    lastIndexPosition = 0;                      // if 2nd demo got paused save the index for continuing
    timerID;
    lastPosPB;
    stepProgressBar = 0;
    parameterList = [];
    testTime = 0;
    notStarted = false;
    firstMoveTime = 0;
    firstMoveIndex = 0;
    let repeat = 0;


    let hideDataLoading = document.getElementById("hideDataLoading").checked;
    /** run through dataSet and change nodecolors line for line**/
    let dataSetSelection = "data/" + useCase.file + ".tsv";
    d3.tsv(dataSetSelection, function (data) {
        dataSet = data;

    });
    //await readDataSet();

    let timeFrame = Number(document.getElementById('inputSpeed').value)*1e7; // wie viele sekunden sollen zusammengefasst werden
    d3.select("#gridID").selectAll('.row').remove();
    console.time("fileScanning");
    parameterList = await fileScanning();
    console.timeEnd("fileScanning");
    createSVG(parameterList.length);


    let index = 0;
    let totalTime = dataSet[dataSet.length - 1].time; //aktuelle zeit durch total testTime ist der prozentsatz zu dem die bar gefüllt sein soll
    stepProgressBar = timeFrame / (totalTime);
    //console.log("main ohne hide data loading: stepprogressBar" + stepProgressBar);

    if (hideDataLoading) {
        while (dataSet[index].time < firstMoveTime) {   // laufe zeilen ab, bis testTime > "param".testTime
            if (parameterList.includes(dataSet[index].param)) { // paint square if param exists
                document.querySelector("#rect" + parameterList.indexOf(dataSet[index].param)).setAttribute("style", "fill:" + nodeColors2[dataSet[index].target] + "; stroke: black;");
            }
            index++;
        }
        index = firstMoveIndex;
        testTime = firstMoveTime;
        stepProgressBar = timeFrame / (totalTime - firstMoveTime);
        //console.log("main: hide data loading: stepProgressBar: " + stepProgressBar);


    }

    let positionPB2 = 0; // Bar Position?


    //console.log("updatesPerSec: " + updatesPerSec/10);
    timerID = setInterval(() => {
        if (isPaused === 1) {
            lastIndexPosition = index;
            lastPosPB = positionPB2;

            clearInterval(timerID); // doesn't stop here, (so don't forget return ?!)
            return;
        }
            testTime = testTime + timeFrame; //sekunden, aktueller Zeitpunkt im Datenset
           // console.log("start: testTime+: " + testTime);
            while (dataSet[index].time < testTime) {   // laufe zeilen ab, bis testTime > "param".testTime
                if (parameterList.includes(dataSet[index].param)) { // paint square if param exists
                    document.querySelector("#rect" + parameterList.indexOf(dataSet[index].param)).setAttribute("style", "fill:" + nodeColors2[dataSet[index].target] + "; stroke: black;");
                }
                index++;
                if (index === dataSet.length) {
                    console.log("kommen wir hier?: " + document.getElementById("repeatMode").checked);
                    repeat = 1;
                    clearInterval(timerID);

                    //if (document.getElementById("repeatMode").checked) {
  //                      start();
//                    }
                    break; // break nötig um while schleife zu beenden
                }
            }

        positionPB2 = positionPB2 + stepProgressBar * 100; // *100 um auf 100 prozent zu kommen, Porgress Bar Position
      //TODO: genau Berechnung für anfang und stopp muss noch gemacht werden
        if (positionPB2 >= 99.5) {
            console.log("--------------------");

            positionPB2 = 99.5;
            document.getElementById("play-button").innerHTML = "Play";
            notStarted = true;
            console.log("1.?");
            if (repeat === 1) {
                console.log("hier?: " + document.getElementById('repeatMode').checked);
                if (document.getElementById("repeatMode").checked) {
                    console.log("Ende ?: " + document.getElementById("repeatMode").checked);
                    playButton();
                }
            }
        }

        divPB.style.x = positionPB2 + "%";
        displaySeconds.innerHTML = (testTime/1e9).toFixed() + " sec";

    }, updatesPerSec/10);

    return 0;
}

async function resume() {

    let hideDataLoading = document.getElementById("hideDataLoading").checked;
    if (!hideDataLoading) {
        firstMoveTime = 0;
        firstMoveIndex = 0;
    }
    let timeFrame = Number(document.getElementById('inputSpeed').value)*1e7; // wie viele sekunden sollen zusammengefasst werden

    let index = lastIndexPosition;
    let totalTime = dataSet[dataSet.length - 1].time;
    let repeat = 0;

    stepProgressBar = timeFrame / (totalTime - firstMoveTime);
    //console.log("resume: stepProgressBar: " + stepProgressBar);

    let positionPB2 = lastPosPB; // Bar Position?

    divPB = document.getElementById("pbRectangle"); // div Progress Bar

    //console.log("updatesPerSec: " + updatesPerSec/10);
    timerID = setInterval(() => {

        if (isPaused === 1) {
            lastIndexPosition = index;
            lastPosPB = positionPB2;
            clearInterval(timerID);
            return;
        }
        testTime = testTime + timeFrame; //sekunden, aktueller Zeitpunkt im Datenset
        //console.log("resume: testTime+: " + testTime);
        while (dataSet[index].time< testTime) {   // laufe zeilen ab, bis testTime > "param".testTime
            if (parameterList.includes(dataSet[index].param)) { // paint square if param exists
                document.querySelector("#rect" + parameterList.indexOf(dataSet[index].param)).setAttribute("style", "fill:" + nodeColors2[dataSet[index].target] + "; stroke: black;");
            }
            index++;
            if (index === dataSet.length) {
                repeat = 1;
                clearInterval(timerID);
                break; // break nötig, wenn er aus setInterval springt? testen...
            }
        }

        positionPB2 = positionPB2 + stepProgressBar * 100;

            // TODO: this depends on width of progressBar rectangle, one variable for change useful?
        if (positionPB2 >= 99.5) {
            positionPB2 = 99.5;
            document.getElementById("play-button").innerHTML = "Play";
            notStarted = true;
            if (repeat === 1) {
                console.log("hier?: " + document.getElementById('repeatMode').checked);
                if (document.getElementById("repeatMode").checked) {
                    console.log("Ende ?: " + document.getElementById("repeatMode").checked);
                    playButton();
                }
            }
        }

        displaySeconds.innerHTML = (testTime/1e9).toFixed() + " sec";

        divPB.style.x = positionPB2 + "%";
        divPB.innerHTML = (testTime/1e9).toFixed() + " sek";
        //console.log("ende resume: testTime: " + testTime);
    }, updatesPerSec/10);

    return;
}

/**
 *
 * @returns {Promise<void>}
 */

async function resetButton() {

    clearInterval(timerID);
    reset = 1;
    notStarted = true;
    document.getElementById("play-button").innerHTML = "Play";
    lastIndexPosition = 0;                      // if 2nd demo got paused save the index for continuing
    timerID;
    lastPosPB;
    stepProgressBar = 0;
    parameterList = [];
    testTime = 0;
    isPaused = 0;
    displaySeconds.innerHTML = "0 sec";
    divPB.style.x = "0%";
    document.getElementById("everyXthParameter").value = "10";
    document.getElementById("inputSpeed").value = "1";

    d3.select("#gridID").selectAll('.row').remove();
    console.time("reset time");
    let numParam = await fileScanning();
    console.timeEnd("reset time");
    createSVG(numParam.length);

}

/**
 *  starting, pausing, or resuming demo depends on variables notStarted and isPaused
 *  button label is naming the actual state
 */

function playButton() {

    if (notStarted === false) {
        if (isPaused === 0) {
            document.getElementById("play-button").innerHTML = "Resume";
            isPaused = 1;
            console.log("playButton: paused");

        } else if(isPaused === 1) {
            document.getElementById("play-button").innerHTML = "Pause";
            console.log("3.?");
            resume(); //TODO: <- "promise returned from resume is ignored" ?
            isPaused = 0;
            console.log("playButton: resumed");

        } else { console.log("playButton: crashed!") }

    } else {
        console.log("playButton: running");
        document.getElementById("play-button").innerHTML = "Pause";
        console.log("2.?");
        start(); //TODO: <- "promise returned from start is ignored" ?

    }
}