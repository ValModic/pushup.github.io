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
}

function removeLastExercise() {
    if (setsData.length > 0) {
        const lastRepsForDay = setsData.pop();
        totalReps -= lastRepsForDay;
        totalDays--;

        // Update statistics
        updateStatistics();

        // Update exerciseData by removing last entry
        const lastDate = Object.keys(exerciseData).pop();
        exerciseData[lastDate].totalReps -= lastRepsForDay;
        exerciseData[lastDate].entries.pop();
        exerciseData[lastDate].maxSets.pop(); // Odstranimo tudi max set
        if (exerciseData[lastDate].entries.length === 0) {
            delete exerciseData[lastDate]; // Remove the date entry if no more exercises for that date
        }

        // Save updated data to localStorage
        saveData();

        // Update chart
        updateChart();
    }
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

