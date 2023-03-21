// добавить
// поле: базовой частоты (сколько тактов в секунду)
// время такта = 1 / базовая частота


// сохраняемые поля между тактами
// • phase a cumulator
// • sum
// • sin rom
// • 10 bit dac

<!--
    1. пользователь заполняет 6 полей, нажимает на кнопку generate и поля для генерации графика принимают значения,
    каждый такт обновляются и каждый такт график дорисовывается
2. пользователь меняет одно или несколько полей и нажимает кнопку generate и поля для генерации графика меняют значения
-->


<!--        какие вещи хранят значения между тактами-->
<!--        получается что финкция будет циклична между 6 тактами, это ж не будет похожу на синус если будет всего 6 точек между циклами-->

let functionGraphWasDrawn = false;
let freq0Reg;
let freq1Reg;
let phaseAccumulator;
let phase0Reg;
let phase1Reg;
let controlRegister;
let d0;
let d1;
let d2;
let d3;
let d4;
let d5;
let d6;
let d7;
let d8;
let d9;
let d10;
let d11;
let d12;
let d13;
let d14;
let d15;
let mux1;
let phaseAccumulatorOutput28bit;
let mux2;
let centralSum12bits;
let sinRomInput;
let sinRom;
let sinRomOutput;
let mux4;
let DAC10bit;

function generateData()
{
    // поля
    freq0Reg = parseInt(document.getElementById("freq0_reg").value, 2);
    freq1Reg = parseInt(document.getElementById("freq1_reg").value, 2);
    phaseAccumulator = parseInt(document.getElementById("phase_accumulator").value, 2);
    phase0Reg = parseInt(document.getElementById("phase0_reg").value, 2);
    phase1Reg = parseInt(document.getElementById("phase1_reg").value, 2);
    controlRegister = parseInt(document.getElementById("control_register").value, 2);
    
    d0 = controlRegister & 0b0_000_000_000_000_001; // reserved, must be 0
    d1 = controlRegister & 0b0_000_000_000_000_010; // 0 for "SIN ROM" and 1 for bypass "SIN ROM"
    d2 = controlRegister & 0b0_000_000_000_000_100; // reserved, must be 0
    d3 = controlRegister & 0b0_000_000_000_001_000; // ?
    d4 = controlRegister & 0b0_000_000_000_010_000; // reserved, must be 0
    d5 = controlRegister & 0b0_000_000_000_100_000; // ?
    d6 = controlRegister & 0b0_000_000_001_000_000; // ?
    d7 = controlRegister & 0b0_000_000_010_000_000; // ?
    d8 = controlRegister & 0b0_000_000_100_000_000; // ?
    d9 = controlRegister & 0b0_000_001_000_000_000; // reserved, must be 0
    d10 = controlRegister & 0b0_000_010_000_000_000; // 0 for "PHASE0 REG" and 1 for "PHASE1 REG"
    d11 = controlRegister & 0b0_000_100_000_000_000; // 0 for "FREQ0 REG" and 1 for "FREQ1 REG"
    d12 = controlRegister & 0b0_001_000_000_000_000; // ?
    d13 = controlRegister & 0b0_010_000_000_000_000; // ?
    d14 = controlRegister & 0b0_100_000_000_000_000; // ?
    d15 = controlRegister & 0b1_000_000_000_000_000; // ?
    mux1 = d11 ? freq0Reg : freq1Reg;
    phaseAccumulatorOutput28bit = (mux1 + +phaseAccumulator) & 0xfffffff;
    mux2 = d10 ? phase0Reg : phase1Reg;
    centralSum12bits = (phaseAccumulatorOutput28bit + mux2) & 0xfff;
    sinRomInput = ((2 * Math.PI) / (Math.pow(2, 12) - 1)) * centralSum12bits; // angle in radians
    sinRom = Math.sin(sinRomInput);
    sinRomOutput = (1 / (Math.pow(2, 10) - 1)) * sinRom;
    mux4 = d1 ? sinRomOutput : sinRomInput;
    DAC10bit = (0.7 / (Math.pow(2, 10) - 1)) * mux4;
    
    let generatedData = "";
    generatedData += "mux1 = " + mux1 + "<br>";
    generatedData += "phaseAccumulatorOutput28bit = " + phaseAccumulatorOutput28bit + "<br>";
    generatedData += "mux2 = " + mux2 + "<br>";
    generatedData += "centralSum12bits = " + centralSum12bits + "<br>";
    generatedData += "sinRomInput = " + sinRomInput + "<br>";
    generatedData += "sinSin = " + sinRom + "<br>";
    generatedData += "sinRomOutput = " + sinRomOutput + "<br>";
    generatedData += "<br>";
    let dataDiv = document.getElementById("data_div");
    dataDiv.innerHTML = generatedData;
    
    if (!functionGraphWasDrawn)
    {
        drawChart();
    }
}

function drawChart()
{
    while (true)
    {
    
    }
}

