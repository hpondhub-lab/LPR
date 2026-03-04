import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCxX35ldMY11bmT81_muSZZ84EAQMagv6A",
    authDomain: "korawitapp.firebaseapp.com",
    projectId: "korawitapp",
    storageBucket: "korawitapp.firebasestorage.app",
    messagingSenderId: "225570538790",
    appId: "1:225570538790:web:e3c9994a526b6375cd6de7",
    measurementId: "G-NKV0MW4WZS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ฟังก์ชันสลับ Tab
window.openTab = (tabId) => {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.remove('hidden');
    event.currentTarget.classList.add('active');
}

// ฟังการเปลี่ยนแปลงข้อมูลแบบ Real-time
function startApp() {
    const candidatesCol = collection(db, "candidates");

    onSnapshot(candidatesCol, (snapshot) => {
        const candidates = [];
        snapshot.forEach(doc => candidates.push({ id: doc.id, ...doc.data() }));
        
        // จัดเรียงตามเบอร์
        candidates.sort((a, b) => a.number - b.number);
        
        renderVoting(candidates);
        renderResults(candidates);
    });
}

// แสดงหน้าลงคะแนน
function renderVoting(candidates) {
    const list = document.getElementById('candidate-list');
    if (localStorage.getItem('hasVoted')) {
        document.getElementById('candidate-list').classList.add('hidden');
        document.getElementById('voted-message').classList.remove('hidden');
        return;
    }

    list.innerHTML = candidates.map(c => `
        <div class="antique-card">
            <div class="candidate-num">หมายเลข ${c.number}</div>
            <div class="party-name">พรรค: ${c.party || 'ไม่ระบุพรรค'}</div>
            <div class="leader-name">หัวหน้าพรรค: ${c.name}</div>
            <button class="tab-btn active" style="width:100%" onclick="vote('${c.id}')">ลงคะแนน</button>
        </div>
    `).join('');
}

// แสดงหน้าผลคะแนน (แถบสี)
function renderResults(candidates) {
    const resultsDiv = document.getElementById('live-results');
    const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);

    resultsDiv.innerHTML = candidates.map(c => {
        const percentage = totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(1) : 0;
        return `
            <div class="result-item">
                <strong>หมายเลข ${c.number} - ${c.party}</strong> (คะแนน: ${c.votes || 0})
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%">${percentage}%</div>
                </div>
            </div>
        `;
    }).join('') + `<p style="text-align:center">คะแนนรวมทั้งหมด: ${totalVotes} เสียง</p>`;
}

// ฟังก์ชันโหวต
window.vote = async (id) => {
    if (confirm("ยืนยันการเลือกผู้สมัครท่านนี้?")) {
        await updateDoc(doc(db, "candidates", id), { votes: increment(1) });
        localStorage.setItem('hasVoted', 'true');
        location.reload(); // รีโหลดเพื่อไปหน้าแสดงผล
    }
}

startApp();
