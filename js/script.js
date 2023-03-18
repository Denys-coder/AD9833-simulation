function generateData()
{
    // поля
    let freq0Reg = parseInt(document.getElementById("freq0_reg").value, 2);
    let freq1Reg = parseInt(document.getElementById("freq1_reg").value, 2);
    let phaseAccumulator = parseInt(document.getElementById("phase_accumulator").value, 2);
    let phase0Reg = parseInt(document.getElementById("phase0_reg").value, 2);
    let phase1Reg = parseInt(document.getElementById("phase1_reg").value, 2);
    let controlRegister = parseInt(document.getElementById("control_register").value, 2);
    
    let d0 = controlRegister & 0b0_000_000_000_000_001; // reserved, must be 0
    let d1 = controlRegister & 0b0_000_000_000_000_010; // 0 for "SIN ROM" and 1 for bypass "SIN ROM"
    let d2 = controlRegister & 0b0_000_000_000_000_100; // reserved, must be 0
    let d3 = controlRegister & 0b0_000_000_000_001_000; // ?
    let d4 = controlRegister & 0b0_000_000_000_010_000; // reserved, must be 0
    let d5 = controlRegister & 0b0_000_000_000_100_000; // ?
    let d6 = controlRegister & 0b0_000_000_001_000_000; // ?
    let d7 = controlRegister & 0b0_000_000_010_000_000; // ?
    let d8 = controlRegister & 0b0_000_000_100_000_000; // ?
    let d9 = controlRegister & 0b0_000_001_000_000_000; // reserved, must be 0
    let d10 = controlRegister & 0b0_000_010_000_000_000; // 0 for "PHASE0 REG" and 1 for "PHASE1 REG"
    let d11 = controlRegister & 0b0_000_100_000_000_000; // 0 for "FREQ0 REG" and 1 for "FREQ1 REG"
    let d12 = controlRegister & 0b0_001_000_000_000_000; // ?
    let d13 = controlRegister & 0b0_010_000_000_000_000; // ?
    let d14 = controlRegister & 0b0_100_000_000_000_000; // ?
    let d15 = controlRegister & 0b1_000_000_000_000_000; // ?
    let mux1 = d11 ? freq0Reg : freq1Reg;
    let phaseAccumulatorOutput28bit = (mux1 + +phaseAccumulator) & 0xfffffff;
    let mux2 = d10 ? phase0Reg : phase1Reg;
    let centralSum12bits = (phaseAccumulatorOutput28bit + mux2) & 0xfff;
    let sinRomInput = (centralSum12bits * 2 * Math.PI) / Math.pow(2, 12);
    let sinSin = Math.sin(sinRomInput);
    let sinRomOutput = sinSin / Math.pow(2, 12);
    let mux4 = d1 ? sinRomOutput : sinRomInput;
    let DAC10bit = mux4 >> 22;
    
    let generatedData = "";
    generatedData += "mux1 = " + mux1 + "<br>";
    generatedData += "phaseAccumulatorOutput28bit = " + phaseAccumulatorOutput28bit + "<br>";
    generatedData += "mux2 = " + mux2 + "<br>";
    generatedData += "centralSum12bits = " + centralSum12bits + "<br>";
    generatedData += "sinRomInput = " + sinRomInput + "<br>";
    generatedData += "sinSin = " + sinSin + "<br>";
    generatedData += "sinRomOutput = " + sinRomOutput + "<br>";
    generatedData += "<br>";
    let dataDiv = document.getElementById("data_div");
    dataDiv.innerHTML = generatedData;
    
    // нарисовать график, если он уже есть то перерисовать его
}