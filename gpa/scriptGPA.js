// Import createDatabase into each file to open database in order to access and mutate references
import createDatabase from "../createDatabase.js";
createDatabase();

// Hold request of studentID to obtain data from SchoolDatabase
const urlParams = new URLSearchParams(window.location.search);
const studentID = urlParams.get("studentID");

const dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open("SchoolDatabase", 1);

    request.onerror = function (event) {
        console.error("An error occurred with IndexedDB");
        reject("Database error");
    };

    request.onsuccess = function (event) {
        resolve(request.result);
        console.log("Opened from GPA script");
    };
});

document.addEventListener("DOMContentLoaded", function () {
    let sections = document.querySelectorAll('section');
    let navLinks = document.querySelectorAll('header nav a');
    window.onscroll = () => {
        sections.forEach(sec => {
            let top = window.scrollY;
            let offset = sec.offsetTop - 150;
            let height = sec.offsetHeight;
            let id = sec.getAttribute('id');
            if  (top >= offset && top < offset + height) {
                    navLinks.forEach(links => {
                    links.classList.remove('active');
                    document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
                });
            };
        });
    };

    // Function to clear localStorage
    function clearLocalStorage() {
        localStorage.removeItem("enrollment");
        localStorage.removeItem("classTypes");
        localStorage.removeItem("grades");
        localStorage.removeItem("gpa"); // Remove GPA data
    }

    // Function to reset enrollment input styles
    function resetEnrollmentInput() {
        const enrollmentInput = document.querySelector(".enroll");
        enrollmentInput.style.maxWidth = "200px";
        enrollmentInput.style.opacity = "1";
        enrollmentInput.value = ""; // Clear the value of enrollment input
    }

    // Function to convert numeric grade to letter grade
    function gradeToLetter(grade) {
        if (grade === 4) return "A";
        if (grade === 3) return "B";
        if (grade === 2) return "C";
        if (grade === 1) return "D";
        if (grade === 0) return "F";
        return "";
    }

    // Function to calculate GPA
    function calculateGPA() {
        const enrollmentYear = parseInt(localStorage.getItem("enrollment")) || 0;
        const savedClassTypes = JSON.parse(localStorage.getItem("classTypes")) || [];
        const savedGrades = JSON.parse(localStorage.getItem("grades")) || [];
        let unweightedCredits = 0.0;
        let weightedCredits = 0.0;
    
        if (savedClassTypes.length !== savedGrades.length) {
            return { uw: "N/A", w: "N/A" }; // Exit early if data is inconsistent
        }
    
        const gradeToPoints = {
            A: 4.0,
            B: 3.0,
            C: 2.0,
            D: 1.0,
            F: 0.0
        };
    
        const getWeightedPoints = (grade, type) => {
            const points = gradeToPoints[grade];
            if (enrollmentYear <= 2022) {
                if (type === "AP" || type === "AICE" || type === "Dual Enrollment") return points + 0.08;
                if (type === "Honors") return points + 0.04;
            } else {
                if (type === "AP" || type === "AICE" || type === "Dual Enrollment") return points + 1.0;
                if (type === "Honors") return points + 0.5;
            }
            return points;
        };
    
        for (let i = 0; i < savedClassTypes.length; i++) {
            let gradeLetter = gradeToLetter(parseFloat(savedGrades[i]));
            unweightedCredits += gradeToPoints[gradeLetter];
            weightedCredits += getWeightedPoints(gradeLetter, savedClassTypes[i]);
        }
    
        const unweightedGPA = (unweightedCredits / savedClassTypes.length).toFixed(2);
        const weightedGPA = (weightedCredits / savedClassTypes.length).toFixed(2);
    
        return { uw: unweightedGPA, w: weightedGPA };
    }
    

    // Clear localStorage and reset enrollment input styles on page load
    clearLocalStorage();
    resetEnrollmentInput();

    // Retrieve data from local storage
    const savedEnrollment = localStorage.getItem("enrollment");
    let savedClassTypes = JSON.parse(localStorage.getItem("classTypes")) || [];
    let savedGrades = JSON.parse(localStorage.getItem("grades")) || [];

    // Set enrollment input value
    const enrollmentInput = document.querySelector(".enroll");
    if (savedEnrollment) {
        enrollmentInput.value = savedEnrollment;
    }

    // Display saved classes
    const tableBody = document.querySelector("#class-table tbody");
    for (let i = 0; i < savedClassTypes.length; i++) {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${savedEnrollment}</td>
            <td>${savedClassTypes[i]}</td>
            <td>${gradeToLetter(savedGrades[i])}</td>
        `;
        tableBody.appendChild(newRow);
    }

    // Creation of buttons and text display
    const addButton = document.querySelector(".new-class-btn");
    const clearButton = document.querySelector(".clear");
    const calculateButton = document.querySelector(".calculate");
    const weightedDiv = document.getElementById("weighted");
    const unweightedDiv = document.getElementById("unweighted");
    const gpaDiv = document.querySelector(".gpa-box");
    const results = document.querySelector(".con");

    addButton.addEventListener("click", function () {
        const classTypeSelect = document.querySelector(".class-type");
        const gradeSelect = document.querySelector(".grade");

        const enrollment = enrollmentInput.value;
        const classType = classTypeSelect.options[classTypeSelect.selectedIndex].text;
        const grade = gradeSelect.value;
    
        if (enrollment && classType !== "Class Type" && grade !== "") {
            // Save data to local storage
            localStorage.setItem("enrollment", enrollment);
            savedClassTypes.push(classType);
            savedGrades.push(parseInt(grade));
            localStorage.setItem("classTypes", JSON.stringify(savedClassTypes));
            localStorage.setItem("grades", JSON.stringify(savedGrades));
    
            // Add a short delay before hiding the enrollment input
            setTimeout(function () {
                enrollmentInput.style.maxWidth = "0";
                enrollmentInput.style.opacity = "0";
            }, 100);
    
            // Add new row to the table
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td>${enrollment}</td>
                <td>${classType}</td>
                <td>${gradeToLetter(parseInt(grade))}</td>
            `;
            tableBody.appendChild(newRow);
    
            // Clear input fields after adding the class
            classTypeSelect.selectedIndex = 0;
            gradeSelect.selectedIndex = 0;
        } else {
            alert("Please fill in all fields before adding a class.");
        }
    });

    calculateButton.addEventListener("click", function () {
        const gpa = calculateGPA();
        const unweightedGPA = gpa.uw;
        const weightedGPA = gpa.w;

        dbPromise.then((db) => {
            const transaction = db.transaction("students", "readwrite");
            const store = transaction.objectStore("students");
    
            const idIndex = store.index("student_id");
            const idQuery = idIndex.get([studentID]);  
    
            idQuery.onsuccess = function () {
                const studentData = idQuery.result;
                if (studentData) {
                    studentData.weighted = weightedGPA.toLocaleString();
                    studentData.unweighted = unweightedGPA.toLocaleString();
                    const request = store.put(studentData);

                    request.onsuccess = function () {
                        console.log("updated")
                    };

                    request.onerror = function () {
                        console.log("not updated")
                    };
                } else {
                    console.log("failed");
                }  
            };
    
            idQuery.onerror = function (event) {
                console.error("Transaction error: ", event.target.error);
                alert("Failed to update gpa information.");
            };
        }).catch((error) => {
            console.error("Failed to open database:", error);
        });

        unweightedDiv.textContent = `Unweighted GPA: ${unweightedGPA}`;
        unweightedDiv.style.opacity = "1";
    
        weightedDiv.textContent = `Weighted GPA: ${weightedGPA}`;
        weightedDiv.style.opacity = "1";

        gpaDiv.style.opacity = "1";

        results.style.height = "300px";
        results.style.padding = "8px";
        
        //Update report
        const gpaReport = document.getElementById('gpaReport');
        
        if (unweightedGPA >= 4.0) {
            gpaReport.textContent = 'Good Job! You are on track to become a Principals Honor Roll student! Keep working hard and make sure to not fall behind on any work!';
        } else if (unweightedGPA >= 3.0) {
            gpaReport.textContent = 'Well done! You seem to be doing great right now! If you want to get a 4.0 GPA make sure to go to the tutoring table, study, and practice work materials!';
        } else if (unweightedGPA >= 2.5) {
            gpaReport.textContent = 'You are currenlty in the range to graduate highschool. However, if you want to improve your GPA, it is best to turn in work on time, go to the tutoring table, do extra credit, and more! Make sure to speak to your guidance counselor if you\'re having trouble.';
        } else if (unweightedGPA >= 0.0) {
            gpaReport.textContent = 'Your GPA is below range for the graduation requirement. It is not too late to give up! It is best to speak to your counselor, ask questions to the teacher, go to the tutoring table, ask for extra credit, and other options.';
        } else {
            gpaReport.textContent = 'No information to display currently.';
        }
    });
    

    clearButton.addEventListener("click", function () {
        // Clear localStorage
        clearLocalStorage();
        // Reset enrollment input styles
        resetEnrollmentInput();

        // Clear the table
        tableBody.innerHTML = "";
        // Clear GPA result
        unweightedDiv.textContent = "";
        unweightedDiv.style.opacity = "0"; // Reset GPA result opacity
        weightedDiv.textContent = "";
        weightedDiv.style.opacity = "0"; // Reset GPA result opacity
        results.style.height = "0px";
        results.style.padding = "0px";

        savedGrades = []
        savedClassTypes = []

        const gpaReport = document.getElementById('gpaReport');
        gpaReport.textContent = 'No information to display currently.';

    });
});
