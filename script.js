const calendarDays = [];

// Obsługa wyświetlania pola dla zmiany "Święta"
document.getElementById("shift").addEventListener("change", function(){
  if(this.value === "SWIĘTA") {
    document.getElementById("customShift").style.display = "inline-block";
  } else {
    document.getElementById("customShift").style.display = "none";
  }
});

function generateCalendar() {
  const year = document.getElementById("year").value;
  const month = document.getElementById("month").value;
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  // Aktualizacja tytułu kalendarza (miesiąc i rok)
  const monthSelect = document.getElementById("month");
  const monthText = monthSelect.options[monthSelect.selectedIndex].text;
  document.querySelector("#calendarTitle .monthName").innerText = monthText;

  const daysContainer = document.getElementById("calendarGrid");
  daysContainer.innerHTML = "";
  calendarDays.length = 0;

  // Ustawienie siatki – 7 kolumn
  daysContainer.style.display = "grid";
  daysContainer.style.gridTemplateColumns = "repeat(7, 1fr)";

  let dayIndex = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < dayIndex; i++) {
    let emptyCell = document.createElement("div");
    emptyCell.className = "calendarCell empty";
    daysContainer.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    let dayCell = document.createElement("div");
    dayCell.className = "calendarCell";
    dayCell.innerHTML = `<span class="dayNumber">${day}</span><div class="workers"></div>`;
    // Ustalenie atrybutu data-day-of-week (pon = 1, wt = 2, …, niedziela = 7)
    let dateObj = new Date(year, month - 1, day);
    let jsDay = dateObj.getDay();
    let dayOfWeek = (jsDay === 0 ? 7 : jsDay);
    dayCell.dataset.dayOfWeek = dayOfWeek;
    // Jeśli dzień to sobota lub niedziela, dodajemy klasę "weekend"
    if(dayOfWeek === 6 || dayOfWeek === 7){
      dayCell.classList.add("weekend");
    }

    daysContainer.appendChild(dayCell);
    calendarDays.push(dayCell);

    // Kliknięcie na kafelek – toggle zaznaczenia (wybór dnia)
    dayCell.addEventListener("click", function() {
      this.classList.toggle("selected");
    });
  }
}

function assignWorker() {
  const name = document.getElementById("name").value.trim();
  let shiftVal = document.getElementById("shift").value;
  if (shiftVal === "SWIĘTA") {
    const custom = document.getElementById("customShift").value.trim();
    if (!custom) {
      alert("Podaj godziny dla zmiany Święta!");
      return;
    }
    shiftVal = custom;
  }
  
  if (!name || !shiftVal) {
    alert("Wpisz poprawne dane!");
    return;
  }
  
  // Pobieramy wszystkie zaznaczone dni (kafelki)
  let selectedCells = document.querySelectorAll(".calendarCell.selected");
  if (selectedCells.length === 0) {
    alert("Wybierz przynajmniej jeden dzień (kafelek)!");
    return;
  }
  
  // Sprawdzenie, czy wybrana zmiana pasuje do zaznaczonych dni
  for (const cell of selectedCells) {
    const dayOfWeek = parseInt(cell.dataset.dayOfWeek);
    if (["8-15", "15-22"].includes(document.getElementById("shift").value)) {
      if (dayOfWeek > 5) {
        alert("Zmiany Pon-Pt można wybrać tylko w dni robocze (poniedziałek–piątek)!");
        return;
      }
    }
    if (document.getElementById("shift").value === "10-18" && dayOfWeek !== 6) {
      alert("Sobotnią zmianę (10-18) można wybrać tylko w soboty!");
      return;
    }
    if (document.getElementById("shift").value === "10-14" && dayOfWeek !== 7) {
      alert("Niedzielną zmianę (10-14) można wybrać tylko w niedziele!");
      return;
    }
  }
  
  // Dodajemy pracownika do każdej zaznaczonej komórki
  selectedCells.forEach(cell => {
    if (cell.classList.contains("closed-day")) return;
    
    let workersList = cell.querySelector(".workers");
    
    // Sprawdzenie, czy ten sam pracownik (nazwa i zmiana) już istnieje w danym dniu
    let duplicate = false;
    Array.from(workersList.children).forEach(entry => {
      let entryName = entry.querySelector("strong") ? entry.querySelector("strong").innerText.trim().toLowerCase() : "";
      let entryShift = entry.querySelector(".shift") ? entry.querySelector(".shift").innerText.trim() : "";
      if(entryName === name.toLowerCase() && entryShift === shiftVal) {
        duplicate = true;
      }
    });
    
    if (duplicate) {
      alert(`Pracownik ${name} już został przypisany do zmiany ${shiftVal} w tym dniu!`);
    } else {
      if (workersList.children.length >= 4) {
        alert("Maksymalnie 4 pracowników na dzień!");
      } else {
        let workerEntry = document.createElement("p");
        workerEntry.classList.add("worker-entry");
        // Imię i zmiana w jednym wierszu
        workerEntry.innerHTML = `<strong>${name}</strong> <span class="shift">${shiftVal}</span>`;
        
        // Kliknięcie na wpis – toggle zaznaczenia do edycji/usunięcia
        workerEntry.addEventListener("click", function(e) {
          e.stopPropagation();
          this.classList.toggle("selected-worker");
        });
        
        workersList.appendChild(workerEntry);
      }
    }
    cell.classList.remove("selected");
  });
}

// Funkcja edycji zaznaczonych pracowników
function editWorker() {
  let selectedWorkers = document.querySelectorAll(".worker-entry.selected-worker");
  if (selectedWorkers.length === 0) {
    alert("Wybierz przynajmniej jednego pracownika do edycji (kliknij na wpis, aby zaznaczyć)");
    return;
  }
  const newName = document.getElementById("name").value.trim();
  const newShift = document.getElementById("shift").value === "SWIĘTA"
    ? document.getElementById("customShift").value.trim()
    : document.getElementById("shift").value;
  
  if (!newName || !newShift) {
    alert("Wpisz dane do edycji w polach formularza!");
    return;
  }
  
  selectedWorkers.forEach(worker => {
    worker.innerHTML = `<strong>${newName}</strong> <span class="shift">${newShift}</span>`;
    worker.classList.remove("selected-worker");
  });
}

// Funkcja usuwania zaznaczonych pracowników
function removeWorker() {
  let selectedWorkers = document.querySelectorAll(".worker-entry.selected-worker");
  if (selectedWorkers.length === 0) {
    alert("Wybierz przynajmniej jednego pracownika do usunięcia (kliknij na wpis, aby zaznaczyć)");
    return;
  }
  selectedWorkers.forEach(worker => {
    worker.remove();
  });
}

// Funkcja oznaczania/otwierania dni jako "Zamknięte" – działa na zaznaczonych dniach
function markClosed() {
  let selectedCells = document.querySelectorAll(".calendarCell.selected");
  if (selectedCells.length === 0) {
    alert("Wybierz przynajmniej jeden dzień (kafelek) do modyfikacji statusu!");
    return;
  }
  
  selectedCells.forEach(cell => {
    let dayNumber = cell.querySelector(".dayNumber").textContent;
    if (cell.classList.contains("closed-day")) {
      // Jeśli dzień był zamknięty – otwieramy (przywracamy normalny układ)
      cell.innerHTML = `<span class="dayNumber">${dayNumber}</span><div class="workers"></div>`;
      cell.classList.remove("closed-day");
    } else {
      // Oznaczamy dzień jako zamknięty
      cell.innerHTML = `<span class="dayNumber">${dayNumber}</span><div class="workers"><p class="closed">Zamknięte</p></div>`;
      cell.classList.add("closed-day");
    }
    cell.classList.remove("selected");
  });
}

// Eksport grafiku z marginesem 10px
document.getElementById("generateImage").addEventListener("click", () => {
  html2canvas(document.getElementById("calendarContainer")).then(canvas => {
    const padding = 10;
    const originalWidth = canvas.width;
    const originalHeight = canvas.height;
    const newCanvas = document.createElement("canvas");
    newCanvas.width = originalWidth + padding * 2;
    newCanvas.height = originalHeight + padding * 2;
    const ctx = newCanvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
    ctx.drawImage(canvas, padding, padding);
    const img = newCanvas.toDataURL("image/jpeg");
    const link = document.createElement("a");
    link.href = img;
    link.download = "grafik_pracy.jpg";
    link.click();
  });
});
