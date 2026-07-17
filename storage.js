// Task: Storage & Roster Logic (Adaptive Framework)

function getStudents() {
    const data = localStorage.getItem('miko_students');
    return data ? JSON.parse(data) : [];
}

function saveStudents(students) {
    localStorage.setItem('miko_students', JSON.stringify(students));
}

function addStudent(name) {
    const students = getStudents();
    const newStudent = { 
        id: Date.now().toString(), 
        name: name, 
        currentLevel: 1, // Default L1
        dailyStatus: 'waiting', 
        sessions: [] 
    };
    students.push(newStudent);
    saveStudents(students);
    return newStudent;
}

function updateStudentStatus(studentId, status) {
    const students = getStudents();
    const student = students.find(s => s.id === studentId);
    if (student) {
        student.dailyStatus = status; // 'waiting', 'done', 'absent'
        saveStudents(students);
    }
}

function saveSession(studentId, sessionData, newLevel) {
    const students = getStudents();
    const student = students.find(s => s.id === studentId);
    if (student) {
        student.sessions.push({
            timestamp: Date.now(),
            ...sessionData
        });
        student.currentLevel = newLevel; // Update level from Nudge
        student.dailyStatus = 'done';
        saveStudents(students);
    }
}

function resetDailyQueue() {
    const students = getStudents();
    students.forEach(s => s.dailyStatus = 'waiting');
    saveStudents(students);
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

initDB();
