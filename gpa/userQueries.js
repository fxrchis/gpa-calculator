// Import createDatabase into each file to open database in order to access and mutate references
import createDatabase from "../createDatabase.js";
import { loadGoals } from "./scriptGoal.js";
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

// Function to get query parameter value by name
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Retrieve the student ID from the URL
const studentID = getQueryParam("studentID");

if (studentID) {
    // Use the student ID to fetch user data from local storage

    dbPromise.then((db) => {
        const transaction = db.transaction("students", "readonly");
        const store = transaction.objectStore("students");

        const idIndex = store.index("student_id");
        const idQuery = idIndex.get([studentID]);   

        idQuery.onsuccess = function () {
            if (idQuery.result) {
                //console.log("User Query working: ", idQuery.result);
                loadGoals(studentID);
            } else {
                alert("User Query Failed");
            }
        };

        idQuery.onerror = function (event) {
            console.error("Request error: ", event.target.error);
        };
    }).catch((error) => {
        console.error("Failed to open database:", error);
    });    
} else {
    alert("Student ID not provided.");
}

