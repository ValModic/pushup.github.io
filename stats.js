// Pridobitev podatkov iz localStorage
const rawData = localStorage.getItem('pushupData');
console.log('Pushup data from localStorage:', rawData); // Preveri, če so podatki prisotni

const pushupData = rawData ? JSON.parse(rawData) : [];
console.log('Parsed pushup data:', pushupData); // Preveri, če so podatki pravilno razčlenjeni

// Preveri, če pushupData ni prazen
if (pushupData.length === 0) {
    console.log('Ni podatkov za prikaz');
}

// Objekti za shranjevanje tedenskih in mesečnih podatkov
const weeklyData = {};
const monthlyData = {};

// Funkcija za pridobitev prvega dneva tedna (ponedeljek) za določen datum
function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

// Obdelava podatkov
pushupData.forEach(entry => {
    const entryDate = entry.date;
    const entryCount = entry.count;

    // Tedenska statistika
    const weekStart = getMonday(entryDate);
    if (!weeklyData[weekStart]) {
        weeklyData[weekStart] = 0;
    }
    weeklyData[weekStart] += entryCount;

    // Mesečna statistika
    const month = entryDate.substring(0, 7); // 'YYYY-MM'
    if (!monthlyData[month]) {
        monthlyData[month] = 0;
    }
    monthlyData[month] += entryCount;
});

// Priprava podatkov za grafe
const weeklyLabels = Object.keys(weeklyData).sort();
const weeklyCounts = weeklyLabels.map(label => weeklyData[label]);

const monthlyLabels = Object.keys(monthlyData).sort();
const monthlyCounts = monthlyLabels.map(label => monthlyData[label]);

console.log('Weekly Labels:', weeklyLabels); // Preveri, če so nalepke tednov pravilno nastavljene
console.log('Weekly Counts:', weeklyCounts); // Preveri, če so številke tednov pravilno nastavljene
console.log('Monthly Labels:', monthlyLabels); // Preveri, če so nalepke mesecev pravilno nastavljene
console.log('Monthly Counts:', monthlyCounts); // Preveri, če so številke mesecev pravilno nastavljene

// Ustvarjanje tedenskega grafa
if (weeklyLabels.length > 0 && weeklyCounts.length > 0) {
    const ctxWeekly = document.getElementById('weeklyChart').getContext('2d');
    const weeklyChart = new Chart(ctxWeekly, {
        type: 'line',
        data: {
            labels: weeklyLabels,
            datasets: [{
                label: 'Število sklec na teden',
                data: weeklyCounts,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Teden, ki se začne na'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Število sklec'
                    }
                }
            }
        }
    });
} else {
    console.log('Tedenski podatki niso pravilno nastavljeni');
}

// Ustvarjanje mesečnega grafa
if (monthlyLabels.length > 0 && monthlyCounts.length > 0) {
    const ctxMonthly = document.getElementById('monthlyChart').getContext('2d');
    const monthlyChart = new Chart(ctxMonthly, {
        type: 'line',
        data: {
            labels: monthlyLabels,
            datasets: [{
                label: 'Število sklec na mesec',
                data: monthlyCounts,
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Mesec'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Število sklec'
                    }
                }
            }
        }
    });
} else {
    console.log('Mesečni podatki niso pravilno nastavljeni');
}

