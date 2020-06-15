
// MAX_PARAM: setting highest parameter as size of arrays
var MAX_PARAM = 12e6+1;
// prepared UseCases with default Parameters automatically bind into dropdown tool
var allUseCases = [
    {name: "Matrix Factorization on 10m x 1m matrix, rank 100, 8x4 workers, 0.01% of parameters", file: "mf-rect-100-8x4.10kth-parameter.combined.sorted", defPar:"0m-11m"},
    {name: "ComplEx-4000 on dbpedia500, 8x4 workers, 0.1% of parameters", file: "complex-4000-8x4.1kth-parameter.combined.sorted", defPar:"0-500k"},
    // {name: "ComplEx-4000 on dbpedia500, 8x4 (0.01% of parameters) " , file: "complex-4000-8x4.10kth-parameter.combined.sorted", defPar:"0-500k"},
];
// selected useCase
var useCase;

// plotting: take arguments and start plotting with d3 library
// mapping: each node has a color (style.css)
function plotting(tasks, plottedParameter,maxRounds,residencies) {
    let nodeColors = {
        "0" : "node-0",
        "1" : "node-1",
        "2" : "node-2",
        "3" : "node-3",
        "4" : "node-4",
        "5" : "node-5",
        "6" : "node-6",
        "7" : "node-7",
        "8" : "undefined"
    };

    let gantt = d3.gantt().taskTypes(plottedParameter).taskStatus(nodeColors).settings(maxRounds);
    gantt(tasks,residencies);
    //stop showing loading spinner
    document.getElementById("loadingSpinner").style.display = "none";
    //enable button "Run" again (probably too early here)
    window.document.getElementById("run_process").removeAttribute("disabled");
    return 0;

}

/**** chooseParameters
 * TextInput: choosing parameters for plotting
 * possible writing:
 * spaces will be ignored; 1st number < 2nd number; 2,3 -> select: 2 and 3; 2-5 -> select: [2,3,4,5]
 * numbers can appear multiple times and also overlap, doesn't matter
 * m is getting replaced by 000000, k by 000 and all by 0-MAX_PARAM
 * example: 0,12-17, 23-25,47,14 -> [0,12,13,14,15,16,17,23,24,25,47]
 * ****/

function chooseParameters() {

    let allParametersToPlot = [];
    let helpArray = [];
    let stringParameters = "";
    const chosenParametersBitArray = new BitArray(MAX_PARAM);
    let helpString = document.getElementById("inputParameters").value.replace(/\s/g, "");
    if (helpString.includes('all')) {stringParameters = "0-" + MAX_PARAM} else {
        let inputString = helpString.replace(/k/g,'000');
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

function plotWithInitialTime(chosenParametersBitArray) {

    let pathToDataSet = "data/" + useCase.file + ".tsv";
    console.log("pathToDataSet: " + pathToDataSet);
    console.log("plotting with inital time");

    /** read data file and build all tasks **/
    let firstMove = 0;
    let plottedParametersStringArray = [];
    let plottedParametersBitArray = new BitArray(MAX_PARAM);
    /* Array of latest endTime of each parameter */
    (last_drawn = []).length = MAX_PARAM;
    last_drawn.fill(0);
    /* Array of last node position of each parameter */
    (moves_to = []).length = MAX_PARAM;
    moves_to.fill(8); //white color
    /* Array of times a parameter moved */
    (residencies = []).length = MAX_PARAM;
    residencies.fill(0);

    let plottedTasks = [];
    // maxRounds is the end of the plot (endTime of last data point from tsv file)
    let maxRounds = 0;

    d3.tsv(pathToDataSet, function (data) {

        maxRounds = data[data.length -1].time;
        data.forEach(function (d) {

            d.time = +d.time;
            d.param= +d.param;
            if ( chosenParametersBitArray.get(d.param)) { //parameterArray.includes(parseInt(d.param)) //param=Int
                residencies[d.param]++;
                if ( !plottedParametersBitArray.get(d.param)) {
                    plottedParametersStringArray.push(d.param);
                    plottedParametersBitArray.set(d.param,true);
                    plottedTasks.push({
                        "startDate": parseInt(last_drawn[d.param]),
                        "endDate": parseInt(d.time),
                        "taskName": d.param,
                        "status": String(moves_to[d.param])
                    });
                    last_drawn[d.param] = d.time;
                } else {
                    plottedTasks.push({
                        "startDate": parseInt(last_drawn[d.param]),
                        "endDate": parseInt(d.time),
                        "taskName": d.param,
                        "status": String(moves_to[d.param])
                    });
                    last_drawn[d.param] = d.time;
                }
                moves_to[d.param] = d.target;
            }
        });

        for (let i = 0; i< plottedParametersStringArray.length; i++) {
            plottedTasks.push({
                "startDate": parseInt(last_drawn[plottedParametersStringArray[i]]),
                "endDate": parseInt(maxRounds),
                "taskName": plottedParametersStringArray[i],
                "status": String(moves_to[plottedParametersStringArray[i]])
            });
        }
        plottedParametersStringArray.sort(function(a, b){ return a - b; });
        return plotting(plottedTasks, plottedParametersStringArray, maxRounds, residencies);
    });
}

function plotWithoutInitialTime(chosenParametersBitArray) {

    let pathToDataSet = "data/" + useCase.file + ".tsv";
    console.log("pathToDataSet: " + pathToDataSet);
    console.log("plotting withOUT inital time");

    let firstMove = 0;
    /** read data file and build all tasks */
    let plottedParametersStringArray = [];
    let plottedParametersBitArray = new BitArray(MAX_PARAM);


    /* Array of latest endTime of each parameter */
    (last_drawn = []).length = MAX_PARAM;
    last_drawn.fill(0);
    /* Array of last node position of each parameter */
    (moves_to = []).length = MAX_PARAM;
    moves_to.fill(8); //white color
    /* Array of times a parameter moved */
    (residencies = []).length = MAX_PARAM;
    residencies.fill(0);

    let plottedTasks = [];
    // maxRounds is the end of the plot (endTime of last data point from tsv file)
    let maxRounds = 0;

    d3.tsv(pathToDataSet, function (data) {
        maxRounds = data[data.length - 1].time;
        data.forEach(function (d) {
            d.time = +d.time;
            d.param = +d.param;
            //console.log(typeof d.param);
            if (chosenParametersBitArray.get(d.param)) { //parameterArray.includes(parseInt(d.param)) //param=Int
                residencies[d.param]++;
                if (!plottedParametersBitArray.get(d.param)) {
                    plottedParametersStringArray.push(d.param);
                    plottedParametersBitArray.set(d.param, true);
                } else {
                    if (firstMove === 0) {
                        firstMove = d.time * 0.995;
                    }
                    plottedTasks.push({
                        "startDate": parseInt(last_drawn[d.param]),
                        "endDate": parseInt(d.time) - firstMove,
                        "taskName": d.param,
                        "status": String(moves_to[d.param])
                    });
                    last_drawn[d.param] = d.time - firstMove;
                }
                moves_to[d.param] = d.target;
            }
        });

        maxRounds = maxRounds - firstMove;
        for (let i = 0; i < plottedParametersStringArray.length; i++) {
            plottedTasks.push({
                "startDate": parseInt(last_drawn[plottedParametersStringArray[i]]),
                "endDate": parseInt(maxRounds),
                "taskName": plottedParametersStringArray[i],
                "status": String(moves_to[plottedParametersStringArray[i]])
            });
        }

        plottedParametersStringArray.sort(function (a, b) {
            return a - b;
        });

        return plotting(plottedTasks, plottedParametersStringArray, maxRounds, residencies);

    });
}

/**** main()
 * get parameters to plot and start process with(out) initial time
 * @returns {number} 0
 */

function main() {
    // which Parameters shall be plotted
    const selectedParametersBitArray = chooseParameters();
    // initialTime enabled/disabled?
    let checkBoxInitialisingTime = !document.getElementById("initialisingTime").checked;
    if (checkBoxInitialisingTime) {
        plotWithInitialTime(selectedParametersBitArray);
    } else {
        plotWithoutInitialTime(selectedParametersBitArray);
    }
    return 0;
}
