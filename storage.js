// Task 3: Class Roster, Student Identity, Saving/Reporting
// Task 4: MediaRecorder / IndexedDB storage

// --- LocalStorage for Roster and Scores ---
function getStudents() {
    const data = localStorage.getItem('miko_students');
    return data ? JSON.parse(data) : [];
}

function addStudent(name) {
    const students = getStudents();
    const newStudent = { id: Date.now().toString(), name: name, sessions: [] };
    students.push(newStudent);
    localStorage.setItem('miko_students', JSON.stringify(students));
    return newStudent;
}

function saveSession(studentId, sessionData) {
    const students = getStudents();
    const student = students.find(s => s.id === studentId);
    if (student) {
        student.sessions.push({
            timestamp: Date.now(),
            ...sessionData
        });
        localStorage.setItem('miko_students', JSON.stringify(students));
    }
}

// --- IndexedDB for Audio Blobs ---
const DB_NAME = 'MikoAudioDB';
const DB_VERSION = 1;
let db;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('recordings')) {
                db.createObjectStore('recordings', { keyPath: 'id' });
            }
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
        
        request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.error);
            reject(event.target.error);
        };
    });
}

function saveAudioBlob(studentId, activityType, blob) {
    if (!db) return;
    const transaction = db.transaction(['recordings'], 'readwrite');
    const store = transaction.objectStore('recordings');
    const id = `${studentId}_${activityType}_${Date.now()}`;
    store.put({ id, studentId, activityType, blob, timestamp: Date.now() });
}

function getAudioBlobsForStudent(studentId) {
    return new Promise((resolve, reject) => {
        if (!db) return resolve([]);
        const transaction = db.transaction(['recordings'], 'readonly');
        const store = transaction.objectStore('recordings');
        const request = store.getAll();
        
        request.onsuccess = () => {
            const all = request.result;
            resolve(all.filter(item => item.studentId === studentId));
        };
        request.onerror = (e) => reject(e);
    });
}

initDB();
