function changePreset() {
    const selectedOption = document.getElementById("presets").value;
    if (selectedOption === 'preset 1') {
        updateRegisters('0110011000111001101001110001',
            '0110011000111001101001110001',
            '0110011000111001101001110001',
            '011001100011',
            '011001100011',
            '0110011000111001');
    } else if (selectedOption === 'preset 2') {
        updateRegisters('0110011011111101001001110001',
            '0111010110110110111000110011',
            '0110001011101101101101010001',
            '001011101010',
            '001101011010',
            '0011010100100010');
    } else if (selectedOption === 'preset 3') {
        updateRegisters('0110110110111011011111110101',
            '0101011011101101001000100101',
            '0110011001001011111001010101',
            '011100001101',
            '010001001111',
            '0111010110101011');
    }
    updateMuxes();
}

function updateRegisters(freq0Reg, freq1Reg, phaseAccumulator, phase0Reg, phase1Reg, controlRegister) {
    document.querySelector('#freq0_reg').value = freq0Reg;
    document.querySelector('#freq1_reg').value = freq1Reg;
    document.querySelector('#phase_accumulator').value = phaseAccumulator;
    document.querySelector('#phase0_reg').value = phase0Reg;
    document.querySelector('#phase1_reg').value = phase1Reg;
    document.querySelector('#control_register').value = controlRegister;
}

function unselectPreset() {
    const presetsSelect = document.querySelector('#presets');
    if (presetsSelect.selectedIndex !== 0) {
        presetsSelect.selectedIndex = 0;
    }
}

function mux1Changed() {
    const first = document.getElementById("mux1_first");
    const second = document.getElementById("mux1_second");
    const controlRegister = document.getElementById("control_register");

    // 5 символ - 1 то freq0Reg, 0 - freq1Reg

    if (first.checked) {
        // symbol with index 4 should be '0'
        controlRegister.value = controlRegister.value.substring(0, 4) + '0' + controlRegister.value.substring(5);
    }

    if (second.checked) {
        // symbol with index 4 should be '1'
        controlRegister.value = controlRegister.value.substring(0, 4) + '1' + controlRegister.value.substring(5);
    }
}

function mux2Changed() {
    const first = document.getElementById("mux2_first");
    const second = document.getElementById("mux2_second");
    const controlRegister = document.getElementById("control_register");

    // 6 символ - 1 то phase1Reg, 0 - phase0Reg

    if (first.checked) {
        // symbol with index 5 should be '0'
        controlRegister.value = controlRegister.value.substring(0, 5) + '0' + controlRegister.value.substring(6);
    }

    if (second.checked) {
        // symbol with index 5 should be '1'
        controlRegister.value = controlRegister.value.substring(0, 5) + '1' + controlRegister.value.substring(6);
    }

}

function mux4Changed() {
    const first = document.getElementById("mux4_first");
    const second = document.getElementById("mux4_second");
    const controlRegister = document.getElementById("control_register");

    // 15 символ - 1 то sinRomOutput, 0 - sinRomInput

    if (first.checked) {
        // symbol with index 14 should be '1'
        controlRegister.value = controlRegister.value.substring(0, 14) + '1' + controlRegister.value.substring(15);
    }

    if (second.checked) {
        // symbol with index 14 should be '0'
        controlRegister.value = controlRegister.value.substring(0, 14) + '0' + controlRegister.value.substring(15);
    }
}

function updateMuxes() {
    let controlRegister = parseInt(document.getElementById("control_register").value, 2);

    // registers data (datatype is boolean)
    let d1 = (controlRegister & 0b0_000_000_000_000_010) === 0; // 'true' for bypass "SIN ROM" and 'false' for "SIN ROM"
    let d10 = (controlRegister & 0b0_000_010_000_000_000) === 0; // 'true' for "PHASE1 REG" and 'false' for "PHASE0 REG"
    let d11 = (controlRegister & 0b0_000_100_000_000_000) === 0; // 'true' for "FREQ1 REG" and 'false' for "FREQ0 REG"

    // update mux1 if needed
    if (d11) {
        document.getElementById("mux1_first").checked = true;
    } else {
        document.getElementById("mux1_second").checked = true;
    }

    // update mux2 if needed
    if (d10) {
        document.getElementById("mux2_first").checked = true;
    } else {
        document.getElementById("mux2_second").checked = true;
    }

    // update mux4 if needed
    if (d1) {
        document.getElementById("mux4_second").checked = true;
    } else {
        document.getElementById("mux4_first").checked = true;
    }

}

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

        let startRangeX = 0;
        if (i > 100) {
            startRangeX += i - 100;
        }
        let endRangeX = 100;
        if (i > 100) {
            endRangeX += i - 100;
        }

        let layoutUpdate = Object.assign({}, graphLayout);
        layoutUpdate.xaxis.range = [startRangeX, endRangeX];
        Plotly.animate("graphContainer", {layout: layoutUpdate}, {
            transition: {
                duration: 1000 / baseFrequency,
                easing: "linear"
            }
        });
        Plotly.extendTraces("graphContainer", {x: [[i]], y: [[DAC10bit]]}, [0]);

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
        dragmode: 'pan',
    };
}