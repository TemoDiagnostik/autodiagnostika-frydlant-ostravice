
const calendarDiv = document.getElementById("calendar");

// الأيام المفتوحة للحجز (yyyy-mm-dd)
const availableDates = [
  "2025-05-10",
  "2025-05-11",
  "2025-05-13",
  "2025-05-15"
];

function generateCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${(month+1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("calendar-day");

    if (availableDates.includes(dateStr)) {
      dayDiv.textContent = dateStr;
      dayDiv.onclick = () => alert("Rezervace na " + dateStr + " byla přijata!");
    } else {
      dayDiv.textContent = dateStr;
      dayDiv.classList.add("disabled");
    }

    calendarDiv.appendChild(dayDiv);
  }
}

generateCalendar();
