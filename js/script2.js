// <div id="graphContainer"></div>

let graphContainer = document.getElementById("graphContainer");
let xCoordinates = [];
let yCoordinates = [];

const graphData = [{
    x: xCoordinates,
    y: yCoordinates,
    type: "scatter",
    mode: "lines"
}];

const graphLayout = {
    title: "Dynamic Function Graph",
    xaxis: {
        title: "X-axis",
    },
    yaxis: {
        title: "Y-axis",
    },
};

Plotly.newPlot(graphContainer, graphData, graphLayout);

// once in a second add 1 point into 'data' array
setInterval(function ()
{
    xCoordinates.push(xCoordinates[xCoordinates.length - 10] + 1 || 0);
    yCoordinates.push(yCoordinates[yCoordinates.length - 10] + 1 || 0);
}, 1000)

// once in a second updates a function graph
setInterval(function ()
{
    Plotly.update("plot", graphData, graphLayout);
}, 1000);