function generateData()
{
    // значения html полей (тип данных число)
    let freq0Reg = parseInt(document.getElementById("freq0_reg").value, 2);
    let freq1Reg = parseInt(document.getElementById("freq1_reg").value, 2);
    let phaseAccumulator = parseInt(document.getElementById("phase_accumulator").value, 2);
    let phase0Reg = parseInt(document.getElementById("phase0_reg").value, 2);
    let phase1Reg = parseInt(document.getElementById("phase1_reg").value, 2);
    let controlRegister = parseInt(document.getElementById("control_register").value, 2);
    
    // значения регистров (тип данных boolean)
    let d0 = (controlRegister & 0b0_000_000_000_000_001) === 0; // reserved, must be 0
    let d1 = (controlRegister & 0b0_000_000_000_000_010) === 0; // 'true' for bypass "SIN ROM" and 'false' for "SIN ROM"
    let d2 = (controlRegister & 0b0_000_000_000_000_100) === 0; // reserved, must be 0
    let d3 = (controlRegister & 0b0_000_000_000_001_000) === 0; // ?
    let d4 = (controlRegister & 0b0_000_000_000_010_000) === 0; // reserved, must be 0
    let d5 = (controlRegister & 0b0_000_000_000_100_000) === 0; // ?
    let d6 = (controlRegister & 0b0_000_000_001_000_000) === 0; // ?
    let d7 = (controlRegister & 0b0_000_000_010_000_000) === 0; // ?
    let d8 = (controlRegister & 0b0_000_000_100_000_000) === 0; // ?
    let d9 = (controlRegister & 0b0_000_001_000_000_000) === 0; // reserved, must be 0
    let d10 = (controlRegister & 0b0_000_010_000_000_000) === 0; // 'true' for "PHASE1 REG" and 'false' for "PHASE0 REG"
    let d11 = (controlRegister & 0b0_000_100_000_000_000) === 0; // 'true' for "FREQ1 REG" and 'false' for "FREQ0 REG"
    let d12 = (controlRegister & 0b0_001_000_000_000_000) === 0; // ?
    let d13 = (controlRegister & 0b0_010_000_000_000_000) === 0; // ?
    let d14 = (controlRegister & 0b0_100_000_000_000_000) === 0; // ?
    let d15 = (controlRegister & 0b1_000_000_000_000_000) === 0; // ?
    
    let xCoordinates = [];
    let yCoordinates = [];
    
    // phaseAccumulator already defined
    let centralSum = 0;
    let sinRomOutput = 0;
    let DAC10bit = 0;
    for (let i = 0; i < 1_000; i++)
    {
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
        
        xCoordinates.push(i);
        yCoordinates.push(DAC10bit);
    }
    
    const graphData = [{
        x: xCoordinates,
        y: yCoordinates,
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
    
    Plotly.newPlot("graphContainer", graphData, graphLayout);
    
}

