// добавить
// 1. поле базовой частоты (сколько тактов в секунду), время такта = 1 / базовая частота
// 2. отрисовку графика которая по скорости зависит от базовой частоты
// 3. сделать что б график рисовался в реальном времени
// 4. сделать что б график перерисовывался когда обновляются поля и нажимается кнопка "generate data"
// 5. сделать нормальный дизайн

// сохраняемые поля между тактами
// phase accumulator
// sum
// sin rom
// 10 bit dac

// ?
// с какими значениями тестировать (значение элементов и частоты процессора)
// какое время сделать деленеем координаты x

// как тестировать js в браузере или в браузерном окружении

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
    let d0 = (controlRegister & 0b0_000_000_000_000_001) !== 0; // reserved, must be 0
    let d1 = (controlRegister & 0b0_000_000_000_000_010) !== 0; // 0 for "SIN ROM" and 1 for bypass "SIN ROM"
    let d2 = (controlRegister & 0b0_000_000_000_000_100) !== 0; // reserved, must be 0
    let d3 = (controlRegister & 0b0_000_000_000_001_000) !== 0; // ?
    let d4 = (controlRegister & 0b0_000_000_000_010_000) !== 0; // reserved, must be 0
    let d5 = (controlRegister & 0b0_000_000_000_100_000) !== 0; // ?
    let d6 = (controlRegister & 0b0_000_000_001_000_000) !== 0; // ?
    let d7 = (controlRegister & 0b0_000_000_010_000_000) !== 0; // ?
    let d8 = (controlRegister & 0b0_000_000_100_000_000) !== 0; // ?
    let d9 = (controlRegister & 0b0_000_001_000_000_000) !== 0; // reserved, must be 0
    let d10 = (controlRegister & 0b0_000_010_000_000_000) !== 0; // 0 for "PHASE0 REG" and 1 for "PHASE1 REG"
    let d11 = (controlRegister & 0b0_000_100_000_000_000) !== 0; // 0 for "FREQ0 REG" and 1 for "FREQ1 REG"
    let d12 = (controlRegister & 0b0_001_000_000_000_000) !== 0; // ?
    let d13 = (controlRegister & 0b0_010_000_000_000_000) !== 0; // ?
    let d14 = (controlRegister & 0b0_100_000_000_000_000) !== 0; // ?
    let d15 = (controlRegister & 0b1_000_000_000_000_000) !== 0; // ?
    
    let xCoordinates = [];
    let yCoordinates = [];
    
    let phaseAccumulator28bit;
    let centralSum12bits;
    let sinRomOutput;
    let DAC10bit;
    for (let i = 0; i < 100_000; i++)
    {
        let mux1 = d11 ? freq0Reg : freq1Reg;
        phaseAccumulator28bit = (mux1 + phaseAccumulator) & 0xfffffff;
        let mux2 = d10 ? phase0Reg : phase1Reg;
        centralSum12bits = (phaseAccumulator28bit + mux2) & 0xfff;
        let sinRomInput = ((2 * Math.PI) / (Math.pow(2, 12) - 1)) * centralSum12bits; // angle in radians
        let sinRom = Math.sin(sinRomInput);
        sinRomOutput = (1 / (Math.pow(2, 10) - 1)) * sinRom;
        let mux4 = d1 ? sinRomOutput : sinRomInput;
        DAC10bit = (0.7 / (Math.pow(2, 10) - 1)) * mux4;
        
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

