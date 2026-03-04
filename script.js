import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxX35ldMY11bmT81_muSZZ84EAQMagv6A",
  authDomain: "korawitapp.firebaseapp.com",
  projectId: "korawitapp",
  storageBucket: "korawitapp.firebasestorage.app",
  messagingSenderId: "225570538790",
  appId: "1:225570538790:web:e3c9994a526b6375cd6de7",
  measurementId: "G-NKV0MW4WZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const candidateList = document.getElementById('candidate-list');

// ฟังก์ชันดึงข้อมูลผู้สมัคร
async function loadCandidates() {
    if (localStorage.getItem('hasVoted')) {
        showVotedStatus();
        return;
    }

    const querySnapshot = await getDocs(collection(db, "candidates"));
    candidateList.innerHTML = ""; // ล้างหน้าจอ

    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>เบอร์ ${data.number}</h3>
            <h4>${data.name}</h4>
            <button onclick="vote('${docSnap.id}')">ลงคะแนน</button>
        `;
        candidateList.appendChild(card);
    });
}

// ฟังก์ชันการโหวต
window.vote = async function(candidateId) {
    if (confirm("ยืนยันการลงคะแนนใช่หรือไม่?")) {
        try {
            const candidateRef = doc(db, "candidates", candidateId);
            await updateDoc(candidateRef, {
                votes: increment(1)
            });
            
            localStorage.setItem('hasVoted', 'true');
            showVotedStatus();
            alert("ขอบคุณสำหรับคะแนนเสียงครับ!");
        } catch (error) {
            console.error("Error voting: ", error);
            alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
        }
    }
}

function showVotedStatus() {
    candidateList.classList.add('hidden');
    document.getElementById('voted-message').classList.remove('hidden');
}

loadCandidates();
