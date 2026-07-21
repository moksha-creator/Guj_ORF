// Task: Storage & Roster Logic (Adaptive Framework)

function getConfig() {
    const data = localStorage.getItem('miko_config');
    return data ? JSON.parse(data) : null;
}

function saveConfig(config) {
    localStorage.setItem('miko_config', JSON.stringify(config));
}

function importRoster(namesString) {
    const names = namesString.split('\n').map(n => n.trim()).filter(n => n);
    const students = getStudents();
    names.forEach(name => {
        // Prevent duplicate names in simple import
        if (!students.find(s => s.name === name)) {
            students.push({ 
                id: Date.now().toString() + Math.floor(Math.random()*1000), 
                name: name, 
                currentLevel: 1, 
                dailyStatus: 'waiting', 
                sessions: [] 
            });
        }
    });
    saveStudents(students);
}

function getStudents() {
    const data = localStorage.getItem('miko_students');
    let students = data ? JSON.parse(data) : [];
    // Backwards compatibility for old records
    students = students.map(s => {
        if(!s.currentLevel) s.currentLevel = 1;
        else s.currentLevel = parseInt(s.currentLevel, 10);
        
        if(!s.dailyStatus) s.dailyStatus = 'waiting';
        return s;
    });
    return students;
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

function setStudentLevel(studentId, level) {
  const students = getStudents();
  const s = students.find(x => x.id === studentId);
  if (s) { 
      s.currentLevel = Math.max(1, Math.min(4, parseInt(level, 10) || 1)); 
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
