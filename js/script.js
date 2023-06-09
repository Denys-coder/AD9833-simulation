let graphData = [{
    x: [],
    y: [],
    mode: "lines"
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
};
Plotly.newPlot("graphContainer", graphData, graphLayout, {displayModeBar: false});

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

    let inputFieldsCorrect = checkInputFields();
    if (!inputFieldsCorrect) {
        alert("Деякі поля введені некоректно");
        return;
    }

    if (continueGenerate === false) {
        freq0Reg = parseInt(document.getElementById("freq0_reg_input").value, 2);
        freq1Reg = parseInt(document.getElementById("freq1_reg_input").value, 2);
        phaseAccumulator = parseInt(document.getElementById("phase_accumulator_input").value, 2);
        phase0Reg = parseInt(document.getElementById("phase0_reg_input").value, 2);
        phase1Reg = parseInt(document.getElementById("phase1_reg_input").value, 2);
        controlRegister = parseInt(document.getElementById("control_register_input").value, 2);
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
            console.log("paused");
            clearInterval(intervalID);
        }

        if (state === "paused") {
            console.log("paused");
            clearInterval(intervalID);
        }

        document.getElementById("current_freq0_reg").textContent = freq0Reg.toString(2).padStart(28, '0');
        document.getElementById("current_freq1_reg").textContent = freq1Reg.toString(2).padStart(28, '0');
        document.getElementById("current_phase_accumulator").textContent = phaseAccumulator.toString(2).padStart(28, '0');
        document.getElementById("current_phase0_reg").textContent = phase0Reg.toString(2).padStart(12, '0');
        document.getElementById("current_phase1_reg").textContent = phase1Reg.toString(2).padStart(12, '0');
        document.getElementById("current_control_register").textContent = controlRegister.toString(2).padStart(16, '0');

        let mux1 = d11 === 0 ? freq0Reg : freq1Reg;
        phaseAccumulator = mux1 & 0xfffffff;
        let phaseAccumulator12Bit = mux1 >> 16;
        let mux2 = d10 === 0 ? phase0Reg : phase1Reg;
        centralSum = (centralSum + phaseAccumulator12Bit + mux2) & 0xfff;
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
            updateRegisterInput('0110011000111001101001110001',
                '0110011000111001101001110001',
                '0110011000111001101001110001',
                '011001100011',
                '011001100011',
                '0110011000111001');
            break;
        case 'preset 2':
            updateRegisterInput('0110011011111101001001110001',
                '0111010110110110111000110011',
                '0110001011101101101101010001',
                '001011101010',
                '001101011010',
                '0011010100100010');
            break;
        case 'preset 3':
            updateRegisterInput('0110110110111011011111110101',
                '0101011011101101001000100101',
                '0110011001001011111001010101',
                '011100001101',
                '010001001111',
                '0111010110101011');
            break;
    }

    updateMuxes();
}

function updateRegisterInput(freq0Reg, freq1Reg, phaseAccumulator, phase0Reg, phase1Reg, controlRegister) {

    document.getElementById('freq0_reg_input').value = freq0Reg;
    document.getElementById('freq1_reg_input').value = freq1Reg;
    document.getElementById('phase_accumulator_input').value = phaseAccumulator;
    document.getElementById('phase0_reg_input').value = phase0Reg;
    document.getElementById('phase1_reg_input').value = phase1Reg;
    document.getElementById('control_register_input').value = controlRegister;
}

function unselectPreset() {

    document.getElementById('preset_select').selectedIndex = 0;
}

function mux1Changed() {

    unselectPreset();

    updateSchema();

    const controlRegisterInput = document.getElementById("control_register_input");
    if (controlRegisterInput.value.length < 5) {
        return;
    }

    const firstOption = document.getElementById("mux1_first");
    const secondOption = document.getElementById("mux1_second");

    // mux1_first: 5 символ - 0
    if (firstOption.checked) {
        // symbol with index 4 should be '0'
        controlRegisterInput.value = controlRegisterInput.value.substring(0, 4) + '0' + controlRegisterInput.value.substring(5);
    }
    if (secondOption.checked) {
        // symbol with index 4 should be '1'
        controlRegisterInput.value = controlRegisterInput.value.substring(0, 4) + '1' + controlRegisterInput.value.substring(5);
    }
}

function mux2Changed() {

    unselectPreset();

    updateSchema();

    const controlRegisterInput = document.getElementById("control_register_input");
    if (controlRegisterInput.value.length < 6) {
        return;
    }

    // mux2_first: 6 символ - 0
    const first = document.getElementById("mux2_first");
    const second = document.getElementById("mux2_second");

    if (first.checked) {
        // symbol with index 5 should be '0'
        controlRegisterInput.value = controlRegisterInput.value.substring(0, 5) + '0' + controlRegisterInput.value.substring(6);
    }
    if (second.checked) {
        // symbol with index 5 should be '1'
        controlRegisterInput.value = controlRegisterInput.value.substring(0, 5) + '1' + controlRegisterInput.value.substring(6);
    }
}

function mux4Changed() {

    unselectPreset();

    updateSchema();

    const controlRegisterInput = document.getElementById("control_register_input");
    if (controlRegisterInput.value.length < 15) {
        return;
    }

    // mux4_first - 15 символ - 1
    const first = document.getElementById("mux4_first");
    const second = document.getElementById("mux4_second");

    if (first.checked) {
        // symbol with index 14 should be '1'
        controlRegisterInput.value = controlRegisterInput.value.substring(0, 14) + '1' + controlRegisterInput.value.substring(15);
    }
    if (second.checked) {
        // symbol with index 14 should be '0'
        controlRegisterInput.value = controlRegisterInput.value.substring(0, 14) + '0' + controlRegisterInput.value.substring(15);
    }
}

function updateMuxes() {

    const controlRegister = parseInt(document.getElementById("control_register_input").value, 2);

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
        alert("Графік все зупинен");
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

function checkInputFields() {

    let freq0Reg = document.getElementById("freq0_reg_input").value;
    let freq1Reg = document.getElementById("freq1_reg_input").value;
    let phaseAccumulator = document.getElementById("phase_accumulator_input").value;
    let phase0Reg = document.getElementById("phase0_reg_input").value;
    let phase1Reg = document.getElementById("phase1_reg_input").value;
    let controlRegister = document.getElementById("control_register_input").value;
    let baseFrequency = document.getElementById("base_frequency_input").value;

    if (!isBinaryString(freq0Reg) || freq0Reg.length !== 28) {
        return false;
    }

    if (!isBinaryString(freq1Reg) || freq1Reg.length !== 28) {
        return false;
    }

    if (!isBinaryString(phaseAccumulator) || phaseAccumulator.length !== 28) {
        return false;
    }

    if (!isBinaryString(phase0Reg) || phase0Reg.length !== 12) {
        return false;
    }

    if (!isBinaryString(phase1Reg) || phase1Reg.length !== 12) {
        return false;
    }

    if (!isBinaryString(controlRegister) || controlRegister.length !== 16) {
        return false;
    }

    if (!isBinaryString(baseFrequency) || baseFrequency.length > 9) {
        return false;
    }

    return true;
}

function isBinaryString(str) {

    return /^[01]+$/.test(str);
}