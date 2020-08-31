
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

/**** chooseParamsForGantt
 * TextInput: choosing parameters for plotting
 * possible writing:
 * spaces will be ignored; 1st number < 2nd number; 2,3 -> select: 2 and 3; 2-5 -> select: [2,3,4,5]
 * numbers can appear multiple times and also overlap, doesn't matter
 * m is getting replaced by 000000, k by 000 and all by 0-MAX_PARAM
 * example of selection: 0,12-17, 23-25,47,14 -> [0,12,13,14,15,16,17,23,24,25,47]
 *
 * Return: chosenParamesBA: all possible parameters of text input are set true
 * ****/

//TODO: ? 1.5m is not 1 500 000, yet. would be 1.5

function chooseParamsForGantt(path) {

    // console.log("chooseParams path: " + string);

    // measuring duration of this function
    //console.time("chooseParamsForGantt");

    let everyXthParam = Number(document.getElementById("everyXthParameter").value);
    let paramList = [];

    // prepare input as BitArray with all chosen params true
    let allParametersToPlot = [];
    let helpArray = [];
    let stringParameters = "";
    const chosenParamsBA = new BitArray(MAX_PARAM);
    if (path.includes('all')) {stringParameters = "0-" + MAX_PARAM} else {
        let inputString = path.replace(/k/g,'000');
        stringParameters = inputString.replace(/m/g,'000000'); }
    allParametersToPlot = stringParameters.split(",");
    for(let i = 0; i<allParametersToPlot.length; i++) {
        helpArray = allParametersToPlot[i].split('-');
        if (helpArray.length === 1) {
            chosenParamsBA.set(Number(helpArray[0]), true);
        } else {
            let lowEnd = Number(helpArray[0]);
            let highEnd = Number(helpArray[1]);
            for (let j = lowEnd; j <= highEnd; j++) {
                chosenParamsBA.set(j, true);
            }
        }
    }

    // store all existing params of dataset into paramList
    //let numParams = 0;
    let existingParamsBool = {};
    d3.tsv("data/" + useCase.file + ".tsv", function (data) {
        let biggestParam = 0;
        data.forEach(function (d, i) {
            if (Number(d.param) > biggestParam)
                biggestParam = Number(d.param);
            if (!existingParamsBool[d.param]) {
                existingParamsBool[d.param] = 1;
                paramList.push(d.param);
            }
        });
        paramList.sort((a, b) => a - b);
        //numParams = paramList.length;
        console.log("biggest Param: " + biggestParam);
        // filter: only every xth param to plot stays true beginning with first element
        for (let i = 0; i < paramList.length; i++) {
            if (i % everyXthParam !== 0) {
                chosenParamsBA.set(paramList[i], false);
                //numParams--;
            }
        }
        //console.log("Number of plotted Parameters : " + numParams);

        //console.timeEnd("chooseParamsForGantt");  // TODO: Where is the correct line to stop recording time?
    });

    return chosenParamsBA;
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
                        "color": String(moves_to[d.param])
                    });
                    last_drawn[d.param] = d.time;
                } else {
                    plottedTasks.push({
                        "startDate": parseInt(last_drawn[d.param]),
                        "endDate": parseInt(d.time),
                        "taskName": d.param,
                        "color": String(moves_to[d.param])
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
                "color": String(moves_to[plottedParametersStringArray[i]])
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
                        console.log("test firstMove: " + firstMove);
                    }
                    plottedTasks.push({
                        "startDate": parseInt(last_drawn[d.param]),
                        "endDate": parseInt(d.time) - firstMove,
                        "taskName": d.param,
                        "color": String(moves_to[d.param])
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
                "color": String(moves_to[plottedParametersStringArray[i]])
            });
        }

        plottedParametersStringArray.sort(function (a, b) {
            return a - b;
        });

        return plotting(plottedTasks, plottedParametersStringArray, maxRounds, residencies);

    });
}

/**** main()
 * get parameters to plot gantt and start process with(out) hiding Data loading
 * @returns {number} 0
 */

function main() {

    // which Parameters shall be plotted
    let string = document.getElementById("inputParameters").value.replace(/\s/g, "");
    const paramsBA = chooseParamsForGantt(string);
    // make sure tooltip is getting deleted
    d3.selectAll('.tooltip').remove();

    let hideDataLoading = document.getElementById("hideDataLoading").checked;
    if (!hideDataLoading) {
        plotWithInitialTime(paramsBA);
    } else {
        plotWithoutInitialTime(paramsBA);
    }
    return 0;
}

/* older version of choosing Parameters
function chooseParameters(string) {
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
    console.timeEnd("choose Parameters");
    return chosenParametersBitArray;
}*/
/*
function chooseParamsForGantt(string) {

    console.time("chooseParamsForGantt");
    let everyXParam = Number(document.getElementById("everyXthParameter").value);
    console.log("chooseParameters String: " + string);
    let paramList = [];
    let countMal = 0;
    let testObject = {};
    let testArray = [];
    let allParametersToPlot = [];
    let helpArray = [];
    let stringParameters = "";
    const chosenParamsBA = new BitArray(MAX_PARAM);
    if (string.includes('all')) {stringParameters = "0-" + MAX_PARAM} else {
        let inputString = string.replace(/k/g,'000');
        stringParameters = inputString.replace(/m/g,'000000'); }
    allParametersToPlot = stringParameters.split(",");
    for(let i = 0; i<allParametersToPlot.length; i++) {
        helpArray = allParametersToPlot[i].split('-');
        if (helpArray.length === 1) {
            chosenParamsBA.set(parseInt(helpArray[0]), true);
        } else {
            let lowEnd = Number(helpArray[0]);
            let highEnd = Number(helpArray[1]);
            for (let j = lowEnd; j <= highEnd; j++) {
                chosenParametersBitArray.set(j, true);
            }
        }
    }

    d3.tsv("data/" + useCase.file + ".tsv", function (data) {
        data.forEach(function (d, i) {
            if (!testObject[d.param]) {
                testObject[d.param] = 1;
                testArray.push(d.param);
            }
            /* if (chosenParametersBitArray.get(d.param) === true) {
                 if (!paramList.includes(d.param)) {
                     countMal++;
                     paramList.push(d.param);
                 }
             }*/
        //});
        //console.log("testarraylength: " + testArray.length);
        //paramList.sort((a, b) => a - b);
        //testArray.sort((a, b) => a - b);

        //console.log("paramlistlength: " + paramList.length);
        /*for (let i = 0; i < paramList.length; i++) {
            if (i % everyXParam === 0) {
                chosenParametersBitArray.set(paramList[i], true);
            } else {
                countMal--;
                chosenParametersBitArray.set(paramList[i], false)
            }
        }*//*
        for (let i = 0; i < testArray.length; i++) {
            if (i % everyXParam === 0) {
                chosenParamsBA.set(testArray[i], true);
            } else {
                countMal--;
                chosenParamsBA.set(testArray[i], false)
            }
        }
        console.log("countMal : " + countMal);
        console.timeEnd("chooseParamsForGantt");
        console.log("oder eher das hier?");
    });
    console.log("das hier?");
    return chosenParamsBA;
}*/