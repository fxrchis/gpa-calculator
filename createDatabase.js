function createDatabase() {
  const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

// Creates database named SchoolDatabase
const request = indexedDB.open("SchoolDatabase", 1);


// Checks for errors when creating a request
request.onerror = function (event) {
    console.error("An error occurred with IndexedDB");
    console.error(event);
};

// Creates indexes if database was created
request.onupgradeneeded = function () {

    // Takes reference of request
    const db = request.result;
  
    // Creates objectStore or collections of students
    const store = db.createObjectStore("students", { keyPath: "id", autoIncrement: true});
  
    // Makes an index of student name, id, weighted and unweighted gpa 
    store.createIndex("student_name", ["name"], { unique: false });
    store.createIndex("student_id", ["student_number"], { unique: false });
    store.createIndex("weighted_gpa", ["weighted"], { unique: false });
    store.createIndex("unweighted_gpa", ["unweighted"], { unique: false });
    store.createIndex("goals", ["goal"], { unique: false });
};

// Function to run 
request.onsuccess = function () {
    console.log("Database opened successfully");
  };
}

export default createDatabase;