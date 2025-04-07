let totalReps = 0;
let totalDays = 0;
let exerciseData = {}; // Zbirka podatkov za vsak datum
let setsData = [];

// Nalaganje podatkov iz localStorage
function loadData() {
    const savedData = localStorage.getItem('exerciseData');
    if (savedData) {
        exerciseData = JSON.parse(savedData);
        totalReps = Object.values(exerciseData).reduce((acc, data) => acc + data.totalReps, 0);
        totalDays = Object.keys(exerciseData).length;
        setsData = Object.values(exerciseData).map(data => data.totalReps);
        updateStatistics();
        updateChart();
    }
}

// Shranjevanje podatkov v localStorage
function saveData() {
    localStorage.setItem('exerciseData', JSON.stringify(exerciseData));
}

function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function addExercise() {
    const date = getCurrentDate(); // Samodejno zaznamo trenutni datum
    const setsMorning = parseInt(document.getElementById('setsMorning').value);
    const repsMorning = parseInt(document.getElementById('repsMorning').value);
    const setsEvening = parseInt(document.getElementById('setsEvening').value);
    const repsEvening = parseInt(document.getElementById('repsEvening').value);
    const maxSetEvening = parseInt(document.getElementById('maxSetEvening').value); // Max set po 5x5 vadbi

    // 5x5 vadba je preprosta, število ponovitev bo samo število setov * ponovitev v setu
    const totalRepsForDay = (setsMorning * repsMorning) + (setsEvening * repsEvening) + maxSetEvening;

    // Preveri ali že obstaja vnos za ta datum
    if (exerciseData[date]) {
        exerciseData[date].totalReps += totalRepsForDay;
        exerciseData[date].entries.push(totalRepsForDay);
        exerciseData[date].maxSets.push(maxSetEvening); // Dodajanje max seta po 5x5
    } else {
        exerciseData[date] = {
            totalReps: totalRepsForDay,
            entries: [totalRepsForDay],
            maxSets: [maxSetEvening], // Dodajanje začetnega max seta po 5x5
        };
    }

    totalReps += totalRepsForDay;
    totalDays++;

    // Shrani podatke
    saveData();

    // Update statistics
    updateStatistics();

    // Save set data for chart
    setsData.push(totalRepsForDay);
    updateChart();
    updateGoalProgress();
}

function removeLastExercise() {
    if (setsData.length === 0) return; // Če ni podatkov, ne naredi nič

    const today = new Date().toISOString().split('T')[0]; // Današnji datum (YYYY-MM-DD)
    const lastDate = Object.keys(exerciseData).pop(); // Zadnji datum v podatkih

    if (lastDate === today) {
        // Prikaz modalnega okna za potrditev
        showModal();
        
        // Ko uporabnik potrdi
        document.getElementById("confirmBtn").onclick = function() {
            const lastRepsForDay = setsData.pop();
            totalReps -= lastRepsForDay;
            totalDays--;

            // Posodobimo statistiko
            updateStatistics();

            // Odstranimo zadnji vnos samo za današnji dan
            exerciseData[lastDate].totalReps -= lastRepsForDay;
            exerciseData[lastDate].entries.pop();
            exerciseData[lastDate].maxSets.pop(); // Odstranimo tudi max set

            // Če ni več vnosov za današnji dan, izbrišemo datum iz podatkov
            if (exerciseData[lastDate].entries.length === 0) {
                delete exerciseData[lastDate];
            }

            // Shranimo posodobljene podatke
            saveData();

            // Posodobimo graf
            updateChart();
            updateGoalProgress();

            showTemporaryMessage("Zadnji današnji vnos je bil odstranjen."); // Samodejno obvestilo
            closeModal(); // Zapri modalno okno
        };
    } else {
        showTemporaryMessage("Danes še ni bilo nobenega vnosa za brisanje.");
    }
}

function showModal() {
    const modal = document.getElementById("confirmModal");
    modal.style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById("confirmModal");
    modal.style.display = "none";
}

function showTemporaryMessage(message) {
    let msgDiv = document.createElement("div");
    msgDiv.innerText = message;
    msgDiv.style.position = "fixed";
    msgDiv.style.bottom = "20px";
    msgDiv.style.left = "50%";
    msgDiv.style.transform = "translateX(-50%)";
    msgDiv.style.background = "#333";
    msgDiv.style.color = "#fff";
    msgDiv.style.padding = "10px 20px";
    msgDiv.style.borderRadius = "5px";
    msgDiv.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.1)";
    msgDiv.style.zIndex = "1000";
    document.body.appendChild(msgDiv);

    setTimeout(() => {
        msgDiv.remove(); // Po 1.5s se samodejno izbriše
    }, 1500);
}





function updateStatistics() {
    const averageRepsPerDay = totalDays > 0 ? totalReps / totalDays : 0;
    document.getElementById('totalReps').textContent = totalReps;
    document.getElementById('averagePerDay').textContent = averageRepsPerDay.toFixed(2);
}

let chartInstance = null;

function updateChart() {
    const ctx = document.getElementById('exerciseChart').getContext('2d');

    // Generate new data for the chart
    const labels = Object.keys(exerciseData);
    const data = Object.values(exerciseData).map(data => data.totalReps);
    const maxSetsData = Object.values(exerciseData).map(data => Math.max(...data.maxSets)); // Prikaz max seta

    // If chart already exists, destroy it before creating a new one
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Create a new chart with updated data
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Število ponovitev na dan',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1
            },
            {
                label: 'Max set',
                data: maxSetsData,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Nalaganje podatkov ob nalaganju strani
window.onload = loadData;
const savedGoal = localStorage.getItem("weeklyGoal");
  if (savedGoal) {
    document.getElementById("goalInput").value = savedGoal;
  }
  updateGoalProgress();

function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                scheduleDailyNotification();
            }
        });
    }
}

function scheduleDailyNotification() {
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(20, 0, 0, 0); // Nastavi čas na 20:00

    let delay = targetTime - now;
    if (delay < 0) {
        delay += 24 * 60 * 60 * 1000; // Če je ura že mimo, prestavi na naslednji dan
    }

    setTimeout(() => {
        showMotivationalNotification();
        setInterval(showMotivationalNotification, 24 * 60 * 60 * 1000); // Ponavljaj vsak dan
    }, delay);
}

function showMotivationalNotification() {
    if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification("💪 Čas za sklece!", {
                body: "Si danes naredil svoje sklece? Ne pozabi, da vsak trening šteje!",
                icon: "pushup-icon.png"
            });
        });
    }
}
const pushupData = JSON.parse(localStorage.getItem('pushupData')) || [];
const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

function savePushups(count) {
    pushupData.push({ date: today, count });
    localStorage.setItem('pushupData', JSON.stringify(pushupData));
}
console.log(localStorage.getItem('pushupData'));

function promptDeleteAllData() {
    document.getElementById("deleteModal").style.display = "block"; // Prikaže modalno okno
}

function closeDeleteModal() {
    document.getElementById("deleteModal").style.display = "none";
    document.getElementById("deleteCode").value = "";// Skrije modal
}

function verifyDeleteAllData() {
    let userInput = document.getElementById("deleteCode").value;

    if (userInput === "140197") {
        if (confirm("Ali res želiš izbrisati VSE podatke? Tega dejanja ni mogoče razveljaviti!")) {
            localStorage.clear(); // Pobriše vse podatke

            showTemporaryMessage("✅ Vsi podatki so bili uspešno izbrisani!");

            setTimeout(() => {
                location.reload();
            }, 1500);
        }
    } else {
        showTemporaryMessage("❌ Napačna koda! Podatki niso bili izbrisani.");
    }

    // Počisti vnosno polje
    closeDeleteModal(); // Zapre modal
}
function saveGoal() {
  const goal = parseInt(document.getElementById("goalInput").value);
  if (!isNaN(goal)) {
    localStorage.setItem("weeklyGoal", goal);
    localStorage.setItem("goalDate", new Date().toISOString());
    console.log(`Cilj shranjen: ${goal}`);
    updateGoalProgress();
  } else {
    console.log("Vnesen ni veljaven cilj.");
  }
}

function updateGoalProgress() {
  const today = new Date();
  const savedGoalDate = localStorage.getItem("goalDate");
  const goal = parseInt(localStorage.getItem("weeklyGoal") || "0");

  const isMonday = today.getDay() === 1;
  const goalDate = savedGoalDate ? new Date(savedGoalDate) : null;
  const weekExpired = goalDate && (today - goalDate > 7 * 24 * 60 * 60 * 1000);

  // Preverite, da se cilj ne izbriše, dokler teden ni res pretekel
  if (isMonday || !goal || weekExpired) {
    if (weekExpired) {
      console.log("Teden je potekel, cilj bo odstranjen.");
    }
    localStorage.removeItem("weeklyGoal");
    localStorage.removeItem("goalDate");
    document.getElementById("goalProgressText").textContent = "🆕 Nov teden – nastavi svoj cilj!";
    return;
  }

  // Izračun začetka tega tedna (ponedeljek)
  const startOfWeek = new Date(today);
  const day = today.getDay() === 0 ? 7 : today.getDay();
  startOfWeek.setDate(today.getDate() - (day - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  // 📦 Preberi podatke iz "exerciseData" (prej "pushups")
  const savedData = JSON.parse(localStorage.getItem("exerciseData") || "{}");

  // 🔍 Filtriraj le podatke iz tega tedna
  const thisWeekTotal = Object.entries(savedData)
    .filter(([date, _]) => new Date(date) >= startOfWeek)
    .reduce((sum, [_, data]) => sum + data.totalReps, 0);

  // 📊 Prikaz napredka
  document.getElementById("goalProgressText").textContent =
    `📈 Ta teden: ${thisWeekTotal}/${goal} sklec (${goal > 0 ? Math.floor((thisWeekTotal / goal) * 100) : 0}%)`;
}
function showBadge(award) {
    const awardsList = document.getElementById('awardsList');
    
    const awardItem = document.createElement('div');
    awardItem.classList.add('award');
    
    let badgeIcon;
    let badgeText;
    
    if (award === 'Začetnik') {
        badgeIcon = '⭐'; // Začetniška ikona
        badgeText = 'Začetnik - 7 dni streak';
    } else if (award === 'Srednji') {
        badgeIcon = '🏅'; // Srednji napredek ikona
        badgeText = 'Srednji - 14 dni streak';
    } else if (award === 'Napreden') {
        badgeIcon = '🏆'; // Napreden napredek ikona
        badgeText = 'Napreden - 30 dni streak';
    }
    
    // Prikaz badža
    awardItem.innerHTML = `${badgeIcon} ${badgeText}`;
    awardsList.appendChild(awardItem);
}

function checkForAwards(streak) {
    let awards = JSON.parse(localStorage.getItem('streakData')).awards || [];

    if (streak === 7 && !awards.includes('Začetnik')) {
        awards.push('Začetnik');
        showTemporaryMessage('Čestitamo! Zaslužili ste "Začetnik" badge za 7-dnevni streak!');
        showBadge('Začetnik');
    } else if (streak === 14 && !awards.includes('Srednji')) {
        awards.push('Srednji');
        showTemporaryMessage('Čestitamo! Zaslužili ste "Srednji" badge za 14-dnevni streak!');
        showBadge('Srednji');
    } else if (streak === 30 && !awards.includes('Napreden')) {
        awards.push('Napreden');
        showTemporaryMessage('Odlično! Zaslužili ste "Napreden" badge za 30-dnevni streak!');
        showBadge('Napreden');
    }

    let streakData = JSON.parse(localStorage.getItem('streakData'));
    streakData.awards = awards;
    localStorage.setItem('streakData', JSON.stringify(streakData));
}
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
