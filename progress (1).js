// Funkcija za prenos napredka kot sliko
document.getElementById("downloadProgressBtn").addEventListener("click", function() {
    // Uporabimo html2canvas za zajem napredka
    html2canvas(document.getElementById("progressStats")).then(function(canvas) {
        // Pretvorimo canvas v podatkovno URL sliko
        const imageUrl = canvas.toDataURL("image/png");

        // Ustvarimo povezavo za prenos slike
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'napredek.png'; // Ime datoteke, ki bo prenesena

        // Simuliramo klik za prenos
        link.click();
    }).catch(function(error) {
        console.log('Napaka pri zajemu slike:', error);
    });
});

// Funkcija za posodobitev napredka
function updateProgress() {
    // Preberemo podatke iz localStorage
    const goal = parseInt(localStorage.getItem("weeklyGoal") || "0");
    const savedData = JSON.parse(localStorage.getItem("exerciseData") || "{}");

    // Preverimo, ali so podatki shranjeni
    if (Object.keys(savedData).length === 0) {
        document.getElementById("goalProgressText").textContent =
            "📈 Ta teden: 0/0 sklec (0%)";
        document.getElementById("allTimeStats").innerHTML =
            "Skupno število sklec: 0<br>Povprečje na dan: 0<br>Največji set: 0";
        return; // Če ni podatkov, prikažemo privzete vrednosti
    }

    // Izračun začetka tega tedna (ponedeljek)
    const today = new Date();
    const startOfWeek = new Date(today);
    const day = today.getDay() === 0 ? 7 : today.getDay();
    startOfWeek.setDate(today.getDate() - (day - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    // Filtriramo le podatke iz tega tedna
    const thisWeekTotal = Object.entries(savedData)
        .filter(([date, _]) => new Date(date) >= startOfWeek)
        .reduce((sum, [_, data]) => sum + data.totalReps, 0);

    // Prikaz napredka za ta teden
    document.getElementById("goalProgressText").textContent =
        `📈 Ta teden: ${thisWeekTotal}/${goal} sklec (${goal > 0 ? Math.floor((thisWeekTotal / goal) * 100) : 0}%)`;

    // Skupni podatki
    const totalReps = Object.values(savedData).reduce((sum, data) => sum + data.totalReps, 0);
    const avgPerDay = totalReps / Object.keys(savedData).length;
    const maxSet = Math.max(...Object.values(savedData).map(data => Math.max(...data.maxSets)));

    document.getElementById("allTimeStats").innerHTML = 
        `<strong>Skupno število sklec: ${totalReps}</strong><br>
         <strong>Povprečje na dan: ${avgPerDay.toFixed(2)}</strong><br>
         <strong>Največji set: ${maxSet}</strong>`;
}

// Takoj ob nalaganju strani posodobimo napredek
updateProgress();
// Obstoječa koda za shranjevanje vaj naj ostane

function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}

function loadExerciseData() {
    return JSON.parse(localStorage.getItem('exerciseData') || '{}');
}

function saveExerciseData(data) {
    localStorage.setItem('exerciseData', JSON.stringify(data));
}

function updateStreakSystem() {
    const data = loadExerciseData();
    const today = getTodayDateString();
    const dates = Object.keys(data).sort();

    if (dates.length === 0) {
        return {
            currentStreak: 0,
            maxStreak: 0,
            achievements: []
        };
    }

    let currentStreak = 1;
    let maxStreak = 1;
    let achievements = [];
    let streakStart = dates[0];

    for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);

        const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else if (diffDays > 1) {
            currentStreak = 1;
        }
    }

    // Preveri, ali današnji dan sploh ima podatke
    const didWorkoutToday = dates.includes(today);
    if (!didWorkoutToday) currentStreak = 0;

    // Dosežki
    const unlocked = [];
    if (maxStreak >= 3) unlocked.push("✨ 3-dnevni streak!");
   if (maxStreak >= 5) unlocked.push("🏅 5-dnevni streak!");
if (maxStreak >= 10) unlocked.push("🎖️ 10-dnevni streak!");
if (maxStreak >= 25) unlocked.push("🥉 25-dnevni streak!");
if (maxStreak >= 30) unlocked.push("💪 30-dnevni streak!");
if (maxStreak >= 50) unlocked.push("🥈 50-dnevni streak!");
if (maxStreak >= 75) unlocked.push("🥇 75-dnevni streak!");
if (maxStreak >= 100) unlocked.push("🏆 100-dnevni streak!");
if (maxStreak >= 150) unlocked.push("🔥 150-dnevni streak!");
if (maxStreak >= 200) unlocked.push("👑 200-dnevni streak!");
if (maxStreak >= 250) unlocked.push("🦾 250-dnevni streak!");
if (maxStreak >= 300) unlocked.push("🚀 300-dnevni streak!");


    return {
        currentStreak,
        maxStreak,
        achievements: unlocked
    };
}

function renderStreakDisplay() {
    const streakData = updateStreakSystem();
    const streakDisplay = document.getElementById('streakDisplay');

    streakDisplay.innerHTML = `
        <div class="streak-box">
            <h3>🔥 Trenutni streak: <span>${streakData.currentStreak}</span> dni</h3>
            <h4>🏆 Najdaljši streak: <span>${streakData.maxStreak}</span> dni</h4>
            <div class="achievements">
                <h4>🎯 Dosežki:</h4>
                <ul>
                    ${streakData.achievements.map(a => `<li>${a}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    renderStreakDisplay();
});
