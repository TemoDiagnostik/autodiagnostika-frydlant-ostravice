document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');
    const availableDates = ["2025-05-10", "2025-05-13", "2025-05-15"];

    const daysContainer = document.createElement('div');
    availableDates.forEach(date => {
        const dayBox = document.createElement('div');
        dayBox.textContent = date;
        dayBox.className = 'day available';
        daysContainer.appendChild(dayBox);
    });

    calendar.appendChild(daysContainer);
});
