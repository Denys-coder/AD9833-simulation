let graphData = getGraphData();
let graphLayout = getGraphLayout();
Plotly.newPlot("graphContainer", graphData, graphLayout, {displayModeBar: false});

let intervalID;

function generateGraph() {
    clearInterval(intervalID);

    // values of html fields (datatype is number)
    let freq0Reg = parseInt(document.getElementById("freq0_reg").value, 2);
    let freq1Reg = parseInt(document.getElementById("freq1_reg").value, 2);
    let phaseAccumulator = parseInt(document.getElementById("phase_accumulator").value, 2);
    let phase0Reg = parseInt(document.getElementById("phase0_reg").value, 2);
    let phase1Reg = parseInt(document.getElementById("phase1_reg").value, 2);
    let controlRegister = parseInt(document.getElementById("control_register").value, 2);
    let baseFrequency = 1 / (parseInt(document.getElementById("base_frequency").value) * parseInt(document.getElementById("base_frequency_unit").value));

    // registers data (datatype is boolean)
    let d1 = (controlRegister & 0b0_000_000_000_000_010) === 0; // 'true' for bypass "SIN ROM" and 'false' for "SIN ROM"
    let d10 = (controlRegister & 0b0_000_010_000_000_000) === 0; // 'true' for "PHASE1 REG" and 'false' for "PHASE0 REG"
    let d11 = (controlRegister & 0b0_000_100_000_000_000) === 0; // 'true' for "FREQ1 REG" and 'false' for "FREQ0 REG"

    // const graphData = [{
    //     x: [],
    //     y: [],
    //     mode: "lines"
    // }];
    // const graphLayout = {
    //     title: "Dynamic Function Graph",
    //     xaxis: {
    //         title: "X-axis",
    //     },
    //     yaxis: {
    //         title: "Y-axis",
    //     },
    // };

    graphData = getGraphData();
    graphLayout = getGraphLayout();

    const graphContainer = document.getElementById("graphContainer");
    Plotly.purge(graphContainer);
    Plotly.newPlot("graphContainer", graphData, graphLayout, {displayModeBar: false});

    // phaseAccumulator already defined
    let centralSum = 0;
    let sinRomOutput = 0;
    let DAC10bit = 0;
    let i = 0;

    intervalID = setInterval(function () {
        let mux1 = d11 ? freq0Reg : freq1Reg;
        phaseAccumulator = (mux1 + phaseAccumulator) & 0xfffffff;
        let mux2 = d10 ? phase0Reg : phase1Reg;
        centralSum = phaseAccumulator + mux2;
        // angle in radians
        let sinRomInput = ((2 * Math.PI) / (Math.pow(2, 12) - 1)) * centralSum;
        let sinRom = Math.sin(sinRomInput + sinRomInput);
        sinRomOutput = (1 / (Math.pow(2, 10) - 1)) * sinRom;
        let mux4 = d1 ? sinRomOutput : sinRomInput;
        DAC10bit = (DAC10bit + ((0.7 / (Math.pow(2, 10) - 1)) * mux4));

        Plotly.extendTraces("graphContainer", {x: [[i]], y: [[DAC10bit]]}, [0]);
        let startRangeX = 0;
        if (i > 100) startRangeX += i - 100;
        let endRangeX = 100;
        if (i > 100) endRangeX += i - 100;
        let newRange = [startRangeX, endRangeX];
        Plotly.relayout('graphContainer', {'xaxis.range': newRange});
        i++;

    }, baseFrequency * 1000);
}

function getGraphData() {
    return [{
        x: [],
        y: [],
        mode: "lines"
    }];
}

function getGraphLayout() {
    return {
        xaxis: {
            title: "X-axis",
            range: [0, 100],
        },
        yaxis: {
            title: "Y-axis",
        },
    };
}

// Plotly.newPlot - рисует новый график
// Plotly.purge - очищает график
// Plotly.extendTraces - добавляет новую точку
// Plotly.addTraces -
// Plotly.relayout