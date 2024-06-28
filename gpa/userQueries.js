// Import createDatabase into each file to open database in order to access and mutate references
import createDatabase from "../createDatabase.js";
import { loadGoals } from "./scriptGoal.js";
createDatabase();

// Repeated initation to open the SchoolDatabase
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

// Function to get query parameter value by name
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Retrieve the student ID from the URL
const studentID = getQueryParam("studentID");

// Checks if studentID is valid (exists)
if (studentID) {
    dbPromise.then((db) => {
        const transaction = db.transaction("students", "readonly");
        const store = transaction.objectStore("students");

        const idIndex = store.index("student_id");
        const idQuery = idIndex.get([studentID]);   

        // Onsuccess function executes code
        idQuery.onsuccess = function () {
            // Validating if idQuery is a real result, loads goals if a result
            if (idQuery.result) {
                loadGoals(studentID);
            } else {
                alert("User Query Failed");
            }
        };
        
        // Onerror function for precautions
        idQuery.onerror = function (event) {
            console.error("Request error: ", event.target.error);
        };
    }).catch((error) => {
        console.error("Failed to open database:", error);
    });    
} else {
    alert("Student ID not provided.");
}

