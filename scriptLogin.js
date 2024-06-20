import createDatabase from "./createDatabase.js";

createDatabase();

const dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open("SchoolDatabase", 1);

    request.onerror = function (event) {
        console.error("An error occurred with IndexedDB");
        reject("Database error");
    };

    request.onsuccess = function (event) {
        resolve(request.result);
        console.log("Opened from Login script")
    };
});

let loginForm = document.getElementById("loginForm");
let signupForm = document.getElementById("signupForm");
let title = document.getElementById("title");

function showSignUpForm() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupForm").style.display = "block";
    title.innerHTML = "Sign Up";
}

function showSignInForm() {
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
    title.innerHTML = "Sign In";
}

// Add event listeners for the links
document.getElementById("signupLink").querySelector("a").addEventListener("click", showSignUpForm);
document.getElementById("loginLink").querySelector("a").addEventListener("click", showSignInForm);

signupForm.addEventListener("submit", function(event) {
    event.preventDefault();

    // Hold values of inputs
    let firstName = document.getElementById("firstNameInput").value;
    let lastName = document.getElementById("lastNameInput").value;
    let newStudentID = document.getElementById("newstudentIDInput").value;

    let fullName = firstName.toUpperCase() + " " + lastName.toUpperCase();

    dbPromise.then((db) => {
        const transaction = db.transaction("students", "readwrite");
        const store = transaction.objectStore("students");

        const studentData = {
            name: fullName,
            student_number: newStudentID,
            weighted: "0.0",
            unweighted: "0.0",
        };

        const request = store.add(studentData);

        request.onsuccess = function () {
            console.log("New student added");
            window.location.href = "gpa/gpacalculator.html?studentID=" + encodeURIComponent(newStudentID);
        };

        request.onerror = function (event) {
            console.error("Transaction error: ", event.target.error);
            alert("Failed to add student. Maybe the student ID already exists.");
        };
    }).catch((error) => {
        console.error("Failed to open database:", error);
    });
});

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    let studentID = document.getElementById("studentIDInput").value;

    dbPromise.then((db) => {
        const transaction = db.transaction("students", "readonly");
        const store = transaction.objectStore("students");

        const idIndex = store.index("student_id");
        const idQuery = idIndex.get([studentID]);   

        idQuery.onsuccess = function () {
            if (idQuery.result) {
                console.log("Student found: ", idQuery);
                window.location.href = "gpa/gpacalculator.html?studentID=" + encodeURIComponent(studentID);
            } else {
                alert("You don't have an account yet. Please sign up first.");
                //console.log("Student not found: ", idQuery.result, studentID);
            }
        };

        idQuery.onerror = function (event) {
            console.error("Request error: ", event.target.error);
        };
    }).catch((error) => {
        console.error("Failed to open database:", error);
    });
});

