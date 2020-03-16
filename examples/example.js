example();

function example() {

   // var tasks = [];
    //(tasks = []).length = 117;
    //tasks.fill({"startDate":0,"endDate":1,"taskName":"0","status":"0"});
    (last_drawn = []).length = 200;
    last_drawn.fill(0);
    (moves_to = []).length = 200;
    moves_to.fill(0);

    d3.tsv("../relocstats.sorted.tsv", function(data) {
        console.log("lol");
        data.forEach(function (d) {
            if (d.param > 50 && d.param < 52 ) {
                //console.log(d);
                //moves_to[d.param] = d.param;
                moves_to[d.param] = d.target;
                tasks.push({"startDate":parseInt(last_drawn[d.param]),"endDate":parseInt(d.time),"taskName":d.param,"status":d.target});
               // tasks.push({"startDate":last_drawn[d.param],"endDate":d.time,"taskName":d.param,"status":d.target});

                last_drawn[d.param] = d.time;

            }
        });
        //console.log(data);
    });
    //tasks[0].endDate = 4;
    //tasks[0].startDate = 2;
    //tasks[0].taskName = "4";
    //tasks[0].status = "4";
    console.log(tasks[0]);
    console.log(tasks[1]);

    console.log(tasks);

//console.log(moves_to);

/*
        d3.csv("../data.csv", function(datacsv) {
            datacsv.forEach(function (d) {
                d.moving = +d.moving;
                d.time = +d.time;
                if (d.parameter < 1 ) {
                    if(d.time === 0) {
                        last_drawn[d.parameter] = d.time;
                        moves_to[d.parameter] = d.move_to;

                    } else {
                        //console.log(d);
                        //moves_to[d.param] = d.param;
                        moves_to[d.parameter] = d.moving;
                        tasks.push({
                            "startDate": last_drawn[d.parameter],
                            "endDate": d.time,
                            "taskName": d.parameter,
                            "status": d.moving
                        });

                        last_drawn[d.parameter] = d.time;
                    } }
                })
                //d.time = +d.time;
                //d.parameter = +d.parameter;
                //d.moving = +d.moving;
            });
            console.log(tasks);
*/
/*
var tasks = [
    {"startDate":0,"endDate":1,"taskName":"0","status":"0"},
    {"startDate":0,"endDate":1,"taskName":"1","status":"2"},
    {"startDate":0,"endDate":1,"taskName":"2","status":"0"},
    {"startDate":2,"endDate":4,"taskName":"3","status":"1"},
    {"startDate":1,"endDate":4,"taskName":"0","status":"6"},
    {"startDate":4,"endDate":60,"taskName":"0","status":"0"},
    {"startDate":34,"endDate":86,"taskName":"58","status":"3"}
];
    tasks.push(    {"startDate":69,"endDate":86,"taskName":"55","status":"3"}
    );
console.log(tasks[0]);
    console.log(tasks);

*/

var taskStatus = {
    "0" : "node-0",
    "1" : "node-1",
    "2" : "node-2",
    "3" : "node-3",
    "4" : "node-4",
    "5" : "node-5",
    "6" : "node-6",
    "7" : "node-7",
};

var taskNames = [ "0", "1", "2", "3", "4", "5", "6", "7","8","9","10", "50", "51", "52" ];

//tasks.sort(function(a, b) {
//    return a.endDate - b.endDate;
//});
//var maxDate = tasks[tasks.length - 1].endDate;
//tasks.sort(function(a, b) {
  //  return a.startDate - b.startDate;
//});
//var minDate = tasks[0].startDate;

var format = "0";

var gantt = d3.gantt().taskTypes(taskNames).taskStatus(taskStatus).tickFormat(format);
gantt(tasks);

};

