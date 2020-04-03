// reading();

function plotting(tasks, plottedParameter,maxRounds) {
    // mapping: each node has a color (example.css)
    var nodeColors = {
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

// TODO: are following lines used somewhere?
    /*
    tasks.sort(function(a, b) {
        return a.endDate - b.endDate;
    });
    var maxDate = tasks[tasks.length - 1].endDate;
    tasks.sort(function(a, b) {
      return a.startDate - b.startDate;
    });
    var minDate = tasks[0].startDate;
    */

    //var format = "%H:%M";
//var format = "%d";

    var gantt = d3.gantt().taskTypes(plottedParameter).taskStatus(nodeColors).maxRounds(maxRounds);
    //var gantt = d3.gantt().taskTypes(plottedParameter).taskStatus(nodeColors).tickFormat(format);

    gantt(tasks);

}

function reading() {
    var dataFile = "";
    var stringParameters = document.getElementById("myVal").value.replace(/\s/g, "");
    var coffee = document.forms[0];
    for (i = 0; i < coffee.length; i++) {
        if (coffee[i].checked) {
            //console.log(coffee[i].checked);
            dataFile = "../" + coffee[i].value + ".tsv";
        }
    }
    console.log(dataFile);
    var tasks = [];
    var plottedParameter = [];
    var maxRounds = 0;
    var minRounds = 0;
    var helpArray = [];
    var parameterArray = [];
    var helpArray2 = [];
    helpArray = stringParameters.split(",");
    for(var i = 0; i<helpArray.length; i++) {
        helpArray2 = helpArray[i].split('-');

        if (helpArray2.length === 1) {
            parameterArray.push(parseInt(helpArray2));
            //testSet.add(parseInt(helpArray2));
        } else {
            var lowEnd = Number(helpArray2[0]);
            var highEnd = Number(helpArray2[1]);
            for (var j = lowEnd; j <= highEnd; j++) {
                parameterArray.push(j);
                //testSet.add(j);
            }
        }
    }
    var testSet = new HashSet(parameterArray);
    //var hash = new HashSet();

    //console.log(parameterArray);
    console.log(testSet);

    // TODO: length will be dependend on number of parameters
    // array of latest endTime of each  parameter
    (last_drawn = []).length = 12000000;
    last_drawn.fill(0);
    // array of last node position of each parameter
    (moves_to = []).length = 12000000;
    moves_to.fill("8");


    d3.tsv(dataFile, function (data) {

        maxRounds = data[data.length -1].time;
        minRounds = data[0].time;
        console.log("maxRounds: " + maxRounds);
        console.log("minrounds: " + minRounds);
        data.forEach(function (d) {
            d.time = +d.time;
            //d.param = +d.param;
            // if (d.param > 1 && d.param < 22 && d.time < 60) {
                if ( testSet.has(parseInt(d.param))) { //parameterArray.includes(parseInt(d.param))

                if ( !plottedParameter.includes(d.param)) {
                    plottedParameter.push(d.param);

                    tasks.push({
                        "startDate": minRounds,
                        "endDate": parseInt(d.time),
                        "taskName": d.param,
                        "status": "8"
                    });


                    moves_to[d.param] = d.target;
                } else {
                    tasks.push({
                        "startDate": parseInt(last_drawn[d.param]),
                        "endDate": parseInt(d.time),
                        "taskName": d.param,
                        "status": moves_to[d.param]
                    });
                    moves_to[d.param] = d.target;
                }


                // tasks.push({"startDate":last_drawn[d.param],"endDate":d.time,"taskName":d.param,"status":d.target});

                last_drawn[d.param] = d.time;

            }
        });

        let i;
        for (i = 0; i< plottedParameter.length; i++) {
            tasks.push({
                "startDate": parseInt(last_drawn[plottedParameter[i]]),
                "endDate": parseInt(maxRounds),
                "taskName": plottedParameter[i],
                "status": moves_to[plottedParameter[i]]
            });        }

        plottedParameter.sort();
        //console.log(tasks);
        return plotting(tasks, plottedParameter, maxRounds);

        //console.log(data);
    });
    //tasks[0].endDate = 4;
    //tasks[0].startDate = 2;
    //tasks[0].taskName = "4";
    //tasks[0].status = "4";
    //console.log(tasks);
//console.log(moves_to);

/*
// small working sample with static array "tasks"
    var tasks = [
        {"startDate":0,"endDate":1,"taskName":"0","status":"0"},
        {"startDate":0,"endDate":1,"taskName":"1","status":"2"},
        {"startDate":0,"endDate":1,"taskName":"2","status":"0"},
        {"startDate":2,"endDate":4,"taskName":"3","status":"1"},
        {"startDate":1,"endDate":4,"taskName":"0","status":"6"},
        {"startDate":4,"endDate":60,"taskName":"0","status":"0"},
        {"startDate":34,"endDate":70,"taskName":"52","status":"3"}
    ];
        tasks.push(    {"startDate":50,"endDate":70,"taskName":"55","status":"3"}
        );
    console.log(tasks[0]);
        console.log(tasks);
*/
}


