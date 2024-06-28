// Import necessary scripts
import createDatabase from "./createDatabase.js";
import showToast from "./extraFeatures.js";


// Import createDatabase into each file to open database in order to access and mutate references
createDatabase();

const dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open("SchoolDatabase", 1);

    request.onerror = function (event) {
        console.error("An error occurred with IndexedDB");
        reject("Database error");
    };

    request.onsuccess = function (event) {
        resolve(request.result);
    };
});

// Creation of elements in HTML
let loginForm = document.getElementById("loginForm");
let signupForm = document.getElementById("signupForm");
let title = document.getElementById("title");

// Function to change from Sign In form to Sign Up form
function showSignUpForm() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupForm").style.display = "block";
    title.innerHTML = "Sign Up";
}

// Function to change from Sign Up form to Sign In form
function showSignInForm() {
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
    title.innerHTML = "Sign In";
}

// Add event listeners for the links
document.getElementById("signupLink").querySelector("a").addEventListener("click", showSignUpForm);
document.getElementById("loginLink").querySelector("a").addEventListener("click", showSignInForm);

// Event listener to execute all code below singUpForm eventListener after submitting information
signupForm.addEventListener("submit", function(event) {
    event.preventDefault();

    // Hold values of inputs
    let firstName = document.getElementById("firstNameInput").value;
    let lastName = document.getElementById("lastNameInput").value;
    let newStudentID = document.getElementById("newstudentIDInput").value;
    let fullName = firstName.toUpperCase() + " " + lastName.toUpperCase();

    // Initiation of executing code for the database
    dbPromise.then((db) => {
        // Grabs reference of database structure
        const transaction = db.transaction("students", "readwrite");
        const store = transaction.objectStore("students");

        const idIndex = store.index("student_id");
        const idQuery = idIndex.get([newStudentID]);  
        
        // Onsuccess function executes code
        idQuery.onsuccess = function () {
            // Validating if idQuery is a real result, gives notification to tell user account already exists
            if (idQuery.result) {
                showToast('<i class="fa-solid fa-circle-exclamation"></i> Account already exists. Try and login.');
            } else {
                // If idQuery not located in database (does not exist), allow for creation of account
                const studentData = {
                    name: fullName,
                    student_number: newStudentID,
                    weighted: "0.0",
                    unweighted: "0.0",
                };
                
                // Creates dictionary/hashmap of current known student data and adds into database
                const request = store.add(studentData);

                // Onsuccess function to redirect user to main page
                request.onsuccess = function () {
                    window.location.href = "gpa/gpacalculator.html?studentID=" + encodeURIComponent(newStudentID);
                };

                request.onerror = function (event) {
                    console.error("Transaction error: ", event.target.error);
                    alert("Failed to add student.");
                };
            }
        };

        idQuery.onerror = function (event) {
            console.error("Request error: ", event.target.error);
            alert("Failed to check student ID. Please try again.");
        };

    }).catch((error) => {
        console.error("Failed to open database:", error);
    });
});

// Event listener to execute all code below loginForm eventListener to log into user account
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
                window.location.href = "gpa/gpacalculator.html?studentID=" + encodeURIComponent(studentID);
            } else {
                showToast('<i class="fa-solid fa-circle-exclamation"></i> Account does not exist. Please create an account.');
            }
        };

        idQuery.onerror = function (event) {
            console.error("Request error: ", event.target.error);
        };
    }).catch((error) => {
        console.error("Failed to open database:", error);
    });
});

