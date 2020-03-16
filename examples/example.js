example();

function example() {
/*
    TODO: read tsv file and create array "tasks" to work with in gantt
   // var tasks = [];

    // length will be dependend on number of parameters
    (last_drawn = []).length = 200;
    last_drawn.fill(0);
    (moves_to = []).length = 200;
    moves_to.fill(0);

    // array objects are stored but somehow not available with tasks[0]
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
  //  console.log(tasks[0]);
  //  console.log(tasks[1]);

  //  console.log(tasks);

//console.log(moves_to);

*/
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


// mapping: each node has a color (example.css)
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

// TODO: tasknames should be dependend on tsv file
var taskNames = [ "0", "1", "2", "3", "4", "5", "6", "7","8","9","10", "50", "51", "52" ];

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

var format = "%H:%M";
//var format = "%d";

var gantt = d3.gantt().taskTypes(taskNames).taskStatus(taskStatus).tickFormat(format);
gantt(tasks);

}

