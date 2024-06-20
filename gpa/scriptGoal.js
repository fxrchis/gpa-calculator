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
        console.log("Opened from Goal script");
    };
});

// Function to add a new goal
function addGoal(goalText, save = true) {
    const goalDisplay = document.getElementById('goal-display');

    // Create a new goal item
    const goalItem = document.createElement('div');
    goalItem.classList.add('goal-item');
    
    // Create a checkbox for completion status
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', function() {
        // Toggle completed class when checkbox is checked/unchecked
        goalItem.classList.toggle('completed');
        saveGoals(studentID);
    });

    // Create a span element for the goal text
    const goalSpan = document.createElement('span');
    goalSpan.textContent = goalText;

    // Create a button to remove the goal
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', function() {
        goalItem.remove();
        saveGoals(studentID); // Save goals after removing one
    });

    // Append checkbox, goal text, and remove button to the goal item
    goalItem.appendChild(checkbox);
    goalItem.appendChild(goalSpan);
    goalItem.appendChild(removeButton);

    // Append the goal item to the goal display container
    goalDisplay.appendChild(goalItem);

    // Save the goal to IndexedDB if not loading
    if (save) {
        saveGoals(studentID);
    }
}

// Function to handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    const goalInput = document.getElementById('goal');
    const goalText = goalInput.value.trim();

    // Check if the maximum limit of goals has been reached
    if (document.querySelectorAll('.goal-item').length >= 12) {
        alert("You've reached the maximum limit of goals (12). Please complete or remove existing goals before adding more.");
        return;
    }
    
    if (goalText !== '') {
        addGoal(goalText);
        goalInput.value = ''; // Clear input field after adding goal
    }
}

// Function to save goals to IndexedDB
function saveGoals(studentID) {
    dbPromise.then((db) => {
        const transaction = db.transaction("students", "readwrite");
        const store = transaction.objectStore("students");

        const idIndex = store.index("student_id");
        const idQuery = idIndex.get([studentID]);

        idQuery.onsuccess = function () {
            const studentData = idQuery.result;
            if (studentData) {
                const goals = [];
                const goalItems = document.querySelectorAll('.goal-item');
                goalItems.forEach(item => {
                    const goalText = item.querySelector('span').textContent;
                    const completed = item.classList.contains('completed');
                    goals.push({ text: goalText, completed: completed });
                });
                studentData.goals = goals;
                const updateRequest = store.put(studentData);

                updateRequest.onsuccess = function () {
                    console.log("Goals updated successfully.");
                };

                updateRequest.onerror = function (event) {
                    console.log("Failed to update goals: ", event.target.error);
                    alert("Failed to update goals.");
                };
            } else {
                console.error("Student not found.");
                alert("Student not found.");
            }
        };

        idQuery.onerror = function (event) {
            console.error("Transaction error: ", event.target.error);
            alert("Failed to update goals.");
        };
    }).catch((error) => {
        console.error("Failed to open database:", error);
    });
}

// Function to load goals from IndexedDB
export function loadGoals(studentID) {
    dbPromise.then((db) => {
        const transaction = db.transaction("students", "readonly");
        const store = transaction.objectStore("students");

        const idIndex = store.index("student_id");
        const idQuery = idIndex.get([studentID]);

        idQuery.onsuccess = function () {
            const studentData = idQuery.result;
            if (studentData && studentData.goals) {
                // Clear the current goals display
                document.getElementById('goal-display').innerHTML = '';
                
                studentData.goals.forEach(goal => {
                    addGoal(goal.text, false);  // Pass false to avoid saving during load
                    const goalItem = document.querySelector('.goal-item:last-child');
                    if (goal.completed) {
                        goalItem.classList.add('completed');
                        goalItem.querySelector('input[type="checkbox"]').checked = true;
                    }
                });
            } else {
                console.log("No goals found for this student.");
            }
        };

        idQuery.onerror = function (event) {
            console.error("Transaction error: ", event.target.error);
            alert("Failed to load goals.");
        };
    }).catch((error) => {
        console.error("Failed to open database:", error);
    });
}

// Load goals when the page loads
if (studentID) {
    loadGoals(studentID);
} else {
    alert("Student ID not provided.");
}

// Event listener for form submission
const goalForm = document.getElementById('goal-form');
goalForm.addEventListener('submit', handleFormSubmit);
