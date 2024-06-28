// Executes ALL javascript code after HTML page has fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Creation of variables to be changed later
    const gradeInputs = document.querySelectorAll("#analysis .input-box input[type='text']");
    const resultBtn = document.getElementById("result-btn");
    const resetBtn = document.getElementById("reset-btn");
    const resultsContainer = document.querySelector("#analysis .inputs .results");

    // Function of resultBtn after a click
    resultBtn.addEventListener("click", function() {

        // Variables from user input
        let currentGrade = parseFloat(gradeInputs[0].value);
        let whatIfGrade = parseFloat(gradeInputs[1].value);

        // Check if inputs are within valid range
        if (isNaN(currentGrade) || isNaN(whatIfGrade) || currentGrade < 0 || currentGrade > 100 || whatIfGrade < 0 || whatIfGrade > 100) {
            resultsContainer.textContent = "Error: Grades must be percentages between 0.0 and 100.0";
            resultsContainer.classList.add("show");
            return;
        }

        // Calculate the change in GPA
        let currentGPA = 0.0;
        let whatIfGPA = 0.0;
        

        if (currentGrade >= 90) {
            currentGPA = 4.0;
        } else if (currentGrade >= 80) {
            currentGPA = 3.0;
        } else if (currentGrade >= 70) {
            currentGPA = 2.0;
        } else if (currentGrade >= 60) {
            currentGPA = 1.0;
        }

        if (whatIfGrade >= 90) {
            whatIfGPA = 4.0;
        } else if (whatIfGrade >= 80) {
            whatIfGPA = 3.0;
        } else if (whatIfGrade >= 70) {
            whatIfGPA = 2.0;
        } else if (whatIfGrade >= 60) {
            whatIfGPA = 1.0;
        }

        let changeInGPA = whatIfGPA - currentGPA;
        
        // Display results
        if (currentGPA > whatIfGPA) {
            if (Math.abs(changeInGPA) == 1) {
                resultsContainer.textContent = `Your GPA will decrease by ${Math.abs(changeInGPA).toFixed(2)} unit.`;
            } else {
                resultsContainer.textContent = `Your GPA will decrease by ${Math.abs(changeInGPA).toFixed(2)} units.`;
            }
        } else if (currentGPA < whatIfGPA) {
            if (Math.abs(changeInGPA) == 1) {
                resultsContainer.textContent = `Your GPA will increase by ${Math.abs(changeInGPA).toFixed(2)} unit.`;
            } else {
                resultsContainer.textContent = `Your GPA will increase by ${Math.abs(changeInGPA).toFixed(2)} units.`;
            }
        } else {
            resultsContainer.textContent = "No change in GPA.";
        }

        // Outputs results
        resultsContainer.classList.add("show");
    });

    resetBtn.addEventListener("click", function() {
        // Reset input and output values
        gradeInputs.forEach(input => {
            input.value = "";
        });
        resultsContainer.textContent = "";

        // Hides results
        resultsContainer.classList.remove("show");
    });
});
