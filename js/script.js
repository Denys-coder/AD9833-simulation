let graphData = getGraphData();
let graphLayout = getGraphLayout();
Plotly.newPlot("graphContainer", graphData, graphLayout, {displayModeBar: false});

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

    const controlRegister = document.getElementById("control_register");
    if (controlRegister.value.length < 5) {
        return;
    }

    const first = document.getElementById("mux1_first");
    const second = document.getElementById("mux1_second");

    // 5 символ - 1 то freq0Reg, 0 - freq1Reg
    if (first.checked) {
        // symbol with index 4 should be '0'
        controlRegister.value = controlRegister.value.substring(0, 4) + '0' + controlRegister.value.substring(5);
    }
    if (second.checked) {
        // symbol with index 4 should be '1'
        controlRegister.value = controlRegister.value.substring(0, 4) + '1' + controlRegister.value.substring(5);
    }

    updateSchema();
}

function mux2Changed() {

    const controlRegister = document.getElementById("control_register");
    if (controlRegister.value.length < 6) {
        return;
    }

    const first = document.getElementById("mux2_first");
    const second = document.getElementById("mux2_second");

    // 6 символ - 1 то phase1Reg, 0 - phase0Reg
    if (first.checked) {
        // symbol with index 5 should be '0'
        controlRegister.value = controlRegister.value.substring(0, 5) + '0' + controlRegister.value.substring(6);
    }
    if (second.checked) {
        // symbol with index 5 should be '1'
        controlRegister.value = controlRegister.value.substring(0, 5) + '1' + controlRegister.value.substring(6);
    }

    updateSchema();

}

function mux4Changed() {

    const controlRegister = document.getElementById("control_register");
    if (controlRegister.value.length < 15) {
        return;
    }

    const first = document.getElementById("mux4_first");
    const second = document.getElementById("mux4_second");

    // 15 символ - 1 то sinRomOutput, 0 - sinRomInput
    if (first.checked) {
        // symbol with index 14 should be '1'
        controlRegister.value = controlRegister.value.substring(0, 14) + '1' + controlRegister.value.substring(15);
    }
    if (second.checked) {
        // symbol with index 14 should be '0'
        controlRegister.value = controlRegister.value.substring(0, 14) + '0' + controlRegister.value.substring(15);
    }

    updateSchema();
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

    updateSchema();

}

function updateSchema() {
    const mux1First = document.getElementById("mux1_first").checked;
    const mux1Second = document.getElementById("mux1_second").checked;
    const mux2First = document.getElementById("mux2_first").checked;
    const mux2Second = document.getElementById("mux2_second").checked;
    const mux4First = document.getElementById("mux4_first").checked;
    const mux4Second = document.getElementById("mux4_second").checked;

    const image = document.getElementById('scheme_image');

    if (mux1First && mux2First && mux4First) {
        image.src = '../images/schema-pictures/FREQ0_PHASE0_bypass-SIN-ROM.png';
    }

    if (mux1First && mux2First && mux4Second) {
        image.src = '../images/schema-pictures/FREQ0_PHASE0_SIN-ROM.png';
    }

    if (mux1First && mux2Second && mux4First) {
        image.src = '../images/schema-pictures/FREQ0_PHASE1_bypass-SIN-ROM.png';
    }

    if (mux1First && mux2Second && mux4Second) {
        image.src = '../images/schema-pictures/FREQ0_PHASE1_SIN-ROM.png';
    }

    if (mux1Second && mux2First && mux4First) {
        image.src = '../images/schema-pictures/FREQ1_PHASE0_bypass-SIN-ROM.png';
    }

    if (mux1Second && mux2First && mux4Second) {
        image.src = '../images/schema-pictures/FREQ1_PHASE0_SIN-ROM.png';
    }

    if (mux1Second && mux2Second && mux4First) {
        image.src = '../images/schema-pictures/FREQ1_PHASE1_bypass-SIN-ROM.png';
    }

    if (mux1Second && mux2Second && mux4Second) {
        image.src = '../images/schema-pictures/FREQ1_PHASE1_SIN-ROM.png';
    }
}

let freq0Reg;
let freq1Reg;
let phaseAccumulator;
let phase0Reg;
let phase1Reg;
let controlRegister;
let baseFrequency;
let centralSum = 0;
let sinRomOutput = 0;
let DAC10bit = 0;
let totalExecutedTacts = 0;
let startRangeX = 0;
let endRangeX = 100;
let state = "stopped"; // can be "running" or "stopped"
let tactsToRun;
let d1;
let d10;
let d11;

function onRun(newTactsToRun = Infinity, continueGenerate = false) {

    if (state === "running") {
        alert("График и так запущен");
        return;
    }

    let inputFieldsCorrect = checkInputFields();
    if (!inputFieldsCorrect) {
        alert("Некоторые поля введены некорректно");
        return;
    }

    // values of html fields (datatype is number)
    if (continueGenerate === false) {
        freq0Reg = parseInt(document.getElementById("freq0_reg").value, 2);
        freq1Reg = parseInt(document.getElementById("freq1_reg").value, 2);
        phaseAccumulator = parseInt(document.getElementById("phase_accumulator").value, 2);
        phase0Reg = parseInt(document.getElementById("phase0_reg").value, 2);
        phase1Reg = parseInt(document.getElementById("phase1_reg").value, 2);
        controlRegister = parseInt(document.getElementById("control_register").value, 2);
        baseFrequency = 1 / (parseInt(document.getElementById("base_frequency").value) * parseInt(document.getElementById("base_frequency_unit").value));

        document.getElementById("current_freq0_reg").value = document.getElementById("current_freq0_reg").value + " " + freq0Reg;
        document.getElementById("current_freq1_reg").value = document.getElementById("current_freq1_reg").value + " " + freq1Reg;
        document.getElementById("current_phase_accumulator").value = document.getElementById("current_phase_accumulator").value + " " + phaseAccumulator;
        document.getElementById("current_phase0_reg").value = document.getElementById("current_phase0_reg").value + " " + phase0Reg;
        document.getElementById("current_phase1_reg").value = document.getElementById("current_phase1_reg").value + " " + phase1Reg;
        document.getElementById("current_control_register").value = document.getElementById("current_control_register").value + " " + controlRegister;

        // registers data (datatype is boolean)
        d1 = (controlRegister & 0b0_000_000_000_000_010) === 0; // 'true' for bypass "SIN ROM" and 'false' for "SIN ROM"
        d10 = (controlRegister & 0b0_000_010_000_000_000) === 0; // 'true' for "PHASE1 REG" and 'false' for "PHASE0 REG"
        d11 = (controlRegister & 0b0_000_100_000_000_000) === 0; // 'true' for "FREQ1 REG" and 'false' for "FREQ0 REG"
    }

    state = "running";
    if (tactsToRun !== undefined) {
        tactsToRun = newTactsToRun;
    }

    graphData = getGraphData();
    graphLayout = getGraphLayout();

    let handler = function () {

        if (state === "stopped" || tactsToRun === 0) {
            clearInterval(intervalID);
        }

        let mux1 = d11 ? freq0Reg : freq1Reg;
        phaseAccumulator = (mux1 + phaseAccumulator) & 0xfffffff;
        document.getElementById("current_phase_accumulator").value = document.getElementById("current_phase_accumulator").value + " " + phaseAccumulator;
        let mux2 = d10 ? phase0Reg : phase1Reg;
        centralSum = phaseAccumulator + mux2;
        document.getElementById("current_central_sum").value = document.getElementById("current_central_sum").value + " " + centralSum;
        // angle in radians
        let sinRomInput = ((2 * Math.PI) / (Math.pow(2, 12) - 1)) * centralSum;
        let sinRom = Math.sin(sinRomInput + sinRomInput);
        sinRomOutput = (1 / (Math.pow(2, 10) - 1)) * sinRom;
        document.getElementById("current_sin_rom").value = document.getElementById("current_sin_rom").value + " " + sinRomOutput;
        let mux4 = d1 ? sinRomOutput : sinRomInput;
        DAC10bit = (DAC10bit + ((0.7 / (Math.pow(2, 10) - 1)) * mux4));
        document.getElementById("current_10_bit_dac").value = document.getElementById("current_10_bit_dac").value + " " + DAC10bit;

        if (totalExecutedTacts > 100) {
            startRangeX += totalExecutedTacts - 100;
        }
        if (totalExecutedTacts > 100) {
            endRangeX += totalExecutedTacts - 100;
        }

        let layoutUpdate = Object.assign({}, graphLayout);
        layoutUpdate.xaxis.range = [startRangeX, endRangeX];
        Plotly.animate("graphContainer", {layout: layoutUpdate}, {
            transition: {
                duration: 1000 / baseFrequency,
                easing: "linear"
            }
        });
        Plotly.extendTraces("graphContainer", {x: [[totalExecutedTacts]], y: [[DAC10bit]]}, [0]);

        totalExecutedTacts++;
        tactsToRun -= 1;

    };

    let intervalID = setInterval(handler, baseFrequency * 1000);

}

function runNTacts() {
    let tactsToRun = document.getElementById("tactsToRunInput").value;
    onRun(tactsToRun);
}

function onStop() {
    if (state === "stopped") {
        alert("График и так остановлен");
        return;
    }
    state = "stopped";
}

function onContinue() {
    if (state === "running") {
        alert("График и так запущен");
        return;
    }
    onRun(undefined, true);
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
            title: "tacts",
            range: [0, 100],
        },
        yaxis: {
            title: "VOUT",
        },
        dragmode: 'pan',
    };
}

function checkInputFields() {
    let freq0Reg = document.getElementById("freq0_reg").value;
    let freq1Reg = document.getElementById("freq1_reg");
    let phaseAccumulator = document.getElementById("phase_accumulator").value;
    let phase0Reg = document.getElementById("phase0_reg").value;
    let phase1Reg = document.getElementById("phase1_reg").value;
    let controlRegister = document.getElementById("control_register").value;
    let baseFrequency = document.getElementById("base_frequency").value;

    if (isBinaryString(freq0Reg) && freq0Reg.length !== 28) {
        return false;
    }

    if (isBinaryString(freq1Reg) && freq1Reg.length !== 28) {
        return false;
    }

    if (isBinaryString(phaseAccumulator) && phaseAccumulator.length !== 28) {
        return false;
    }

    if (isBinaryString(phase0Reg) && phase0Reg.length !== 12) {
        return false;
    }

    if (isBinaryString(phase1Reg) && phase1Reg.length !== 12) {
        return false;
    }

    if (isBinaryString(controlRegister) && controlRegister.length !== 16) {
        return false;
    }

    if (isBinaryString(baseFrequency) && baseFrequency.length > 9) {
        return false;
    }

    return true;
}

function isBinaryString(str) {
    return /^[01]+$/.test(str);
}