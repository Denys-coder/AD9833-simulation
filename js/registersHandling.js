const otpInputs = document.querySelectorAll(".single-cell-input-fields input");

otpInputs.forEach((input, index) => {
    input.addEventListener("keydown", (event) => {
        const key = event.key;
        if (key === "0" || key === "1") {
            otpInputs[index].value = key;
            event.preventDefault(); // prevent input from being displayed
            if (index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        } else if (key === "Backspace") {
            otpInputs[index].value = "";
            if (index > 0) {
                otpInputs[index - 1].focus();
            }
        } else if (key === "ArrowLeft") {
            if (index > 0) {
                otpInputs[index - 1].focus();
            }
        } else if (key === "ArrowRight") {
            if (index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        } else if (key === "Enter") {
            if (index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        } else {
            // Ignore any other input and prevent it from being displayed
            event.preventDefault();
            return;
        }
    });
});
