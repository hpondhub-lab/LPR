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
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = { /* ... ข้อมูลเดิมของคุณ ... */ };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// --- ระบบ Drag & Drop ---
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
let selectedFile = null;

dropZone.onclick = () => fileInput.click();
dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('dragover'); };
dropZone.ondragleave = () => dropZone.classList.remove('dragover');
dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    selectedFile = e.dataTransfer.files[0];
    document.getElementById('file-preview').innerText = `ไฟล์ที่เลือก: ${selectedFile.name}`;
};
fileInput.onchange = (e) => {
    selectedFile = e.target.files[0];
    document.getElementById('file-preview').innerText = `ไฟล์ที่เลือก: ${selectedFile.name}`;
};

// --- บันทึกข้อมูลผู้สมัคร ---
document.getElementById('btn-save-candidate').onclick = async () => {
    const num = document.getElementById('reg-number').value;
    const name = document.getElementById('reg-name').value;
    const grade = document.getElementById('reg-grade').value;
    const party = document.getElementById('reg-party').value;
    const policy = document.getElementById('reg-policy').value;

    if (!num || !name || !selectedFile) return alert("กรุณากรอกข้อมูลและเลือกรูปภาพ");

    try {
        // 1. อัปโหลดรูปภาพ
        const storageRef = ref(storage, `candidates/no_${num}_${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, selectedFile);
        const imgUrl = await getDownloadURL(snapshot.ref);

        // 2. บันทึกข้อมูลลง Firestore
        await setDoc(doc(db, "candidates", `no_${num}`), {
            number: parseInt(num),
            name: name,
            grade: grade,
            party: party,
            policy: policy,
            imageUrl: imgUrl,
            votes: 0
        });

        alert("ลงทะเบียนผู้สมัครสำเร็จ!");
        location.reload();
    } catch (e) { console.error(e); alert("เกิดข้อผิดพลาด"); }
};

// --- ปรับปรุงการแสดงผล (ในฟังก์ชัน renderVoting) ---
function renderVoting(candidates) {
    const list = document.getElementById('candidate-list');
    list.innerHTML = candidates.map(c => `
        <div class="antique-card">
            <div class="candidate-num">เบอร์ ${c.number}</div>
            <img src="${c.imageUrl || 'default-avatar.png'}" class="candidate-img">
            <div class="leader-name">${c.name}</div>
            <span class="grade-badge">ชั้น ${c.grade || 'ไม่ระบุ'}</span>
            <div class="party-name">พรรค: ${c.party}</div>
            <div class="policy-box"><strong>นโยบาย:</strong> ${c.policy || '-'}</div>
            <button class="antique-button" style="margin-top:15px" onclick="vote('${c.id}')">ลงคะแนนเสียง</button>
        </div>
    `).join('');
}
startApp();
