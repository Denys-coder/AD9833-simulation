let graphData = [{
    x: [],
    y: [],
    mode: "lines",
    line: {
        color: 'darkgreen',
    }
}];
let graphLayout = {
    xaxis: {
        title: "tacts",
        range: [0, 100],
    },
    yaxis: {
        title: "VOUT",
    },
    dragmode: 'pan',
    plot_bgcolor: "#d2f8d2",
    paper_bgcolor: "#d2f8d2",
};
let graphConfig = {
    displayModeBar: true,
}
Plotly.newPlot("graphContainer", graphData, graphLayout, graphConfig);

let freq0Reg;
let freq1Reg;
let phaseAccumulator;
let phase0Reg;
let phase1Reg;
let controlRegister;
let baseFrequency;

let d1;
let d10;
let d11;

let centralSum = 0;
let sinRom = 0;
let DAC10bit = 0;
let startXAxisRange = 0;
let endXAxisRange = 100;
let output = 0;

let state = "stopped"; // "running" || "paused" || "stopped"
let totalExecutedTacts = 0;
let tactsToRun;

function runGraph(tactsToRun = Infinity, continueGenerate = false) {

    if (state === "running") {
        alert("Графік вже працює");
        return;
    }

    if (!inputFieldsCorrect()) {
        alert("Деякі поля не заповнені або заповнені некоректно");
        return;
    }

    if (continueGenerate === false) {
        freq0Reg = parseInt(getFreq0Reg(), 2);
        freq1Reg = parseInt(getFreq1Reg(), 2);
        phaseAccumulator = parseInt(getPhaseAccumulator(), 2);
        phase0Reg = parseInt(getPhase0Reg(), 2);
        phase1Reg = parseInt(getPhase1Reg(), 2);
        controlRegister = parseInt(getControlRegister(), 2);
        baseFrequency = 1 / (parseInt(document.getElementById("base_frequency_input").value) * parseInt(document.getElementById("base_frequency_unit_select").value));

        d1 = ((controlRegister & 0b0_000_000_000_000_010) === 0) ? 0 : 1;
        d10 = ((controlRegister & 0b0_000_010_000_000_000) === 0) ? 0 : 1;
        d11 = ((controlRegister & 0b0_000_100_000_000_000) === 0) ? 0 : 1;
    }

    state = "running";

    if (tactsToRun !== Infinity) {
        globalThis.tactsToRun = tactsToRun;
    }

    let handler = function () {

        if (state === "stopped" || globalThis.tactsToRun === 0) {
            state = "stopped";
            clearInterval(intervalID);
        }

        if (state === "paused") {
            clearInterval(intervalID);
        }

        document.getElementById("current_freq0_reg").textContent = freq0Reg.toString(2).padStart(28, '0');
        document.getElementById("current_freq1_reg").textContent = freq1Reg.toString(2).padStart(28, '0');
        document.getElementById("current_phase_accumulator").textContent = phaseAccumulator.toString(2).padStart(28, '0');
        document.getElementById("current_phase0_reg").textContent = phase0Reg.toString(2).padStart(12, '0');
        document.getElementById("current_phase1_reg").textContent = phase1Reg.toString(2).padStart(12, '0');
        document.getElementById("current_control_register").textContent = controlRegister.toString(2).padStart(16, '0');

        let mux1 = d11 === 0 ? freq0Reg : freq1Reg;
        phaseAccumulator = mux1;
        let mux2 = d10 === 0 ? phase0Reg : phase1Reg;
        centralSum = (centralSum + phaseAccumulator + mux2) & 0xfff;
        function computeSin(inputValue) {
            const minValue = 0; // Desired minimum value (corresponding to 0)
            const maxValue = 4095; // Desired maximum value (corresponding to 2π)
            let preparedValue = (inputValue / maxValue) * (2 * Math.PI);
            let computedSine = Math.sin(preparedValue);
            return ((computedSine - minValue) / (2 * Math.PI - minValue)) * (maxValue - minValue);
        }
        sinRom = centralSum & 0xfff;
        sinRom = computeSin(sinRom);
        let mux4 = d1 === 1 ? centralSum : sinRom;
        DAC10bit = mux4 >> 2; // из 12 бит берет 10 старших, 0 bit = 0, 10 bit = 1.75
        output = DAC10bit / 1023 * 1.75;

        document.getElementById("current_phase_accumulator").textContent = phaseAccumulator.toString(2).padStart(28, '0');
        document.getElementById("current_central_sum").textContent = centralSum.toString(2);
        document.getElementById("current_sin_rom").textContent = sinRom.toString(2);
        document.getElementById("current_10_bit_dac").textContent = DAC10bit.toString(2).padStart(10, '0');

        if (totalExecutedTacts > 100) {
            startXAxisRange++;
            endXAxisRange++;
        }
        graphLayout.xaxis.range = [startXAxisRange, endXAxisRange];

        Plotly.animate("graphContainer", {layout: graphLayout}, {
            transition: {
                duration: 1000 / baseFrequency,
                easing: "linear"
            }
        });
        Plotly.extendTraces("graphContainer", {x: [[totalExecutedTacts]], y: [[output]]}, [0]);

        totalExecutedTacts++;
        globalThis.tactsToRun--;

    };

    let intervalID = setInterval(handler, baseFrequency * 1000);
}

function changePreset() {

    const selectedPreset = document.getElementById("preset_select").value;

    switch (selectedPreset) {
        case 'preset 1':
            setFreq0Reg('0110011000111001101001110001');
            setFreq1Reg('0110011000111001101001110001');
            setPhaseAccumulator('0110011000111001101001110001');
            setPhase0Reg('011001100011');
            setPhase1Reg('011001100011');
            setControlRegister('0110011000111001');
            break;
        case 'preset 2':
            setFreq0Reg('0110011011111101001001110001');
            setFreq1Reg('0111010110110110111000110011');
            setPhaseAccumulator('0110001011101101101101010001');
            setPhase0Reg('001011101010');
            setPhase1Reg('001101011010');
            setControlRegister('0011010100100010');
            break;
        case 'preset 3':
            setFreq0Reg('0110110110111011011111110101');
            setFreq1Reg('0101011011101101001000100101');
            setPhaseAccumulator('0110011001001011111001010101');
            setPhase0Reg('011100001101');
            setPhase1Reg('010001001111');
            setControlRegister('0111010110101011');
            break;
    }

    updateMuxes();
}

function unselectPreset() {

    document.getElementById('preset_select').selectedIndex = 0;
    document.getElementById("functional_block_diagram").src = '../images/schema-pictures/no-path-schema.png';
}

function mux1Changed() {

    unselectPreset();

    updateSchema();

    const firstOption = document.getElementById("mux1_first");
    const secondOption = document.getElementById("mux1_second");

    // mux1_first: 5 символ - 0
    if (firstOption.checked) {
        // symbol with index 4 should be '0'
        document.getElementById("controlRegisterBit4").value = "0";
    }
    if (secondOption.checked) {
        // symbol with index 4 should be '1'
        document.getElementById("controlRegisterBit4").value = "1";
    }
}

function mux2Changed() {

    unselectPreset();

    updateSchema();


    // mux2_first: 6 символ - 0
    const first = document.getElementById("mux2_first");
    const second = document.getElementById("mux2_second");

    if (first.checked) {
        // symbol with index 5 should be '0'
        document.getElementById("controlRegisterBit5").value = "0";
    }
    if (second.checked) {
        // symbol with index 5 should be '1'
        document.getElementById("controlRegisterBit5").value = "1";
    }
}

function mux4Changed() {

    unselectPreset();

    updateSchema();

    // mux4_first - 15 символ - 1
    const first = document.getElementById("mux4_first");
    const second = document.getElementById("mux4_second");

    if (first.checked) {
        // symbol with index 14 should be '1'
        document.getElementById("controlRegisterBit14").value = "1";
    }
    if (second.checked) {
        // symbol with index 14 should be '0'
        document.getElementById("controlRegisterBit14").value = "0";
    }
}

function updateMuxes() {

    const controlRegister = parseInt(getControlRegister(), 2);

    // registers data (datatype is boolean)
    let d1 = ((controlRegister & 0b0_000_000_000_000_010) === 0) ? 0 : 1;
    let d10 = ((controlRegister & 0b0_000_010_000_000_000) === 0) ? 0 : 1;
    let d11 = ((controlRegister & 0b0_000_100_000_000_000) === 0) ? 0 : 1;

    // update mux1 if needed
    if (d11 === 0) {
        document.getElementById("mux1_first").checked = true;
    } else {
        document.getElementById("mux1_second").checked = true;
    }

    // update mux2 if needed
    if (d10 === 0) {
        document.getElementById("mux2_first").checked = true;
    } else {
        document.getElementById("mux2_second").checked = true;
    }

    // update mux4 if needed
    if (d1 === 1) {
        document.getElementById("mux4_first").checked = true;
    } else {
        document.getElementById("mux4_second").checked = true;
    }

    updateSchema();
}

function updateSchema() {

    const mux1First = document.getElementById("mux1_first").checked;
    const mux1Second = document.getElementById("mux1_second").checked;
    const mux2First = document.getElementById("mux2_first").checked;
    const mux2Second = document.getElementById("mux2_second").checked;
    const mux4First = document.getElementById("mux4_first").checked;
    const mux4Second = document.getElementById("mux4_second").checked;

    const functionalBlockDiagram = document.getElementById("functional_block_diagram");

    if (mux1First && mux2First && mux4First) {
        functionalBlockDiagram.src = '../images/schema-pictures/FREQ0_PHASE0_bypass-SIN-ROM.png';
    }

    if (mux1First && mux2First && mux4Second) {
        functionalBlockDiagram.src = '../images/schema-pictures/FREQ0_PHASE0_SIN-ROM.png';
    }

    if (mux1First && mux2Second && mux4First) {
        functionalBlockDiagram.src = '../images/schema-pictures/FREQ0_PHASE1_bypass-SIN-ROM.png';
    }

    if (mux1First && mux2Second && mux4Second) {
        functionalBlockDiagram.src = '../images/schema-pictures/FREQ0_PHASE1_SIN-ROM.png';
    }

    if (mux1Second && mux2First && mux4First) {
        functionalBlockDiagram.src = '../images/schema-pictures/FREQ1_PHASE0_bypass-SIN-ROM.png';
    }

    if (mux1Second && mux2First && mux4Second) {
        functionalBlockDiagram.src = '../images/schema-pictures/FREQ1_PHASE0_SIN-ROM.png';
    }

    if (mux1Second && mux2Second && mux4First) {
        functionalBlockDiagram.src = '../images/schema-pictures/FREQ1_PHASE1_bypass-SIN-ROM.png';
    }

    if (mux1Second && mux2Second && mux4Second) {
        functionalBlockDiagram.src = '../images/schema-pictures/FREQ1_PHASE1_SIN-ROM.png';
    }
}

function runNTactsGraph() {

    let tactsToRun = document.getElementById("tacts_to_run_input").value;
    runGraph(tactsToRun);
}

function pauseGraph() {

    if (state === "stopped") {
        alert("Графік вже зупинен");
        return;
    }
    if (state === "paused") {
        alert("Графік вже поставлен на паузу");
        return;
    }
    state = "paused";
}

function continueGraph() {

    if (state === "running") {
        alert("Графік все працює");
        return;
    }
    if (state === "stopped") {
        alert("Графік не був запущений чи вже зупунився");
        return;
    }
    runGraph(undefined, true);
}

function inputFieldsCorrect() {

    let freq0Reg = getFreq0Reg();
    let freq1Reg = getFreq1Reg();
    let phaseAccumulator = getPhaseAccumulator();
    let phase0Reg = getPhase0Reg();
    let phase1Reg = getPhase1Reg();
    let controlRegister = getControlRegister();
    let baseFrequency = document.getElementById("base_frequency_input").value;

    if (freq0Reg.length !== 28) {
        return false;
    }

    if (freq1Reg.length !== 28) {
        return false;
    }

    if (phaseAccumulator.length !== 28) {
        return false;
    }

    if (phase0Reg.length !== 12) {
        return false;
    }

    if (phase1Reg.length !== 12) {
        return false;
    }

    if (controlRegister.length !== 16) {
        return false;
    }

    if (baseFrequency.length > 9) {
        return false;
    }

    return true;
}

function getFreq0Reg() {
    let freq0RegDiv = document.getElementById("freq0RegDiv");
    let inputs = freq0RegDiv.getElementsByTagName("input");
    let concatenatedValue = "";
    for (let i = 0; i < inputs.length; i++) {
        concatenatedValue += inputs[i].value;
    }
    return concatenatedValue;
}

function setFreq0Reg(newValue) {
    let freq0RegDiv = document.getElementById("freq0RegDiv");
    let inputs = freq0RegDiv.getElementsByTagName("input");
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = newValue[i];
    }
}

function getFreq1Reg() {
    let freq1RegDiv = document.getElementById("freq1RegDiv");
    let inputs = freq1RegDiv.getElementsByTagName("input");
    let concatenatedValue = "";
    for (let i = 0; i < inputs.length; i++) {
        concatenatedValue += inputs[i].value;
    }
    return concatenatedValue;
}

function setFreq1Reg(newValue) {
    let freq1RegDiv = document.getElementById("freq1RegDiv");
    let inputs = freq1RegDiv.getElementsByTagName("input");
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = newValue[i];
    }
}

function getPhaseAccumulator() {
    let phaseAccumulatorDiv = document.getElementById("phaseAccumulatorDiv");
    let inputs = phaseAccumulatorDiv.getElementsByTagName("input");
    let concatenatedValue = "";
    for (let i = 0; i < inputs.length; i++) {
        concatenatedValue += inputs[i].value;
    }
    return concatenatedValue;
}

function setPhaseAccumulator(newValue) {
    let phaseAccumulatorDiv = document.getElementById("phaseAccumulatorDiv");
    let inputs = phaseAccumulatorDiv.getElementsByTagName("input");
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = newValue[i];
    }
}

function getPhase0Reg() {
    let phase0RegDiv = document.getElementById("phase0RegDiv");
    let inputs = phase0RegDiv.getElementsByTagName("input");
    let concatenatedValue = "";
    for (let i = 0; i < inputs.length; i++) {
        concatenatedValue += inputs[i].value;
    }
    return concatenatedValue;
}

function setPhase0Reg(newValue) {
    let phase0RegDiv = document.getElementById("phase0RegDiv");
    let inputs = phase0RegDiv.getElementsByTagName("input");
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = newValue[i];
    }
}

function getPhase1Reg() {
    let phase1RegDiv = document.getElementById("phase1RegDiv");
    let inputs = phase1RegDiv.getElementsByTagName("input");
    let concatenatedValue = "";
    for (let i = 0; i < inputs.length; i++) {
        concatenatedValue += inputs[i].value;
    }
    return concatenatedValue;
}

function setPhase1Reg(newValue) {
    let phase1RegDiv = document.getElementById("phase1RegDiv");
    let inputs = phase1RegDiv.getElementsByTagName("input");
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = newValue[i];
    }
}

function getControlRegister() {
    let controlRegisterDiv = document.getElementById("controlRegisterDiv");
    let inputs = controlRegisterDiv.getElementsByTagName("input");
    let concatenatedValue = "";
    for (let i = 0; i < inputs.length; i++) {
        concatenatedValue += inputs[i].value;
    }
    return concatenatedValue;
}

function setControlRegister(newValue) {
    let controlRegisterDiv = document.getElementById("controlRegisterDiv");
    let inputs = controlRegisterDiv.getElementsByTagName("input");
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = newValue[i];
    }
}
