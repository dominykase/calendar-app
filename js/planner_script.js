const storage = window.sessionStorage;
const monthField = document.getElementById("month_field");
const yearField = document.getElementById("year_field");
const calendarContainer = document.getElementById("calendar_content_container");
const calendarGrid = document.getElementsByClassName("day");
const calendarHeader = document.getElementById("calendar_header");
const submitButton = document.getElementById("submit_button");
const createEventForm = document.getElementById("create_event_form");
const titleInput = document.getElementById("title_field");
const dateInput = document.getElementById("date_field");
const startTimeInput = document.getElementById("start_time_field");
const endTimeInput = document.getElementById("end_time_field");
const typeInput = document.getElementById("type_field");
const descriptionInput = document.getElementById("description_field");
const validationMessages = document.getElementsByClassName("validation_message");
const detailsTable = document.getElementById("details_table");
const detailFields = document.getElementsByClassName("details_field");
const deleteButton = document.getElementById("delete_button");

let selectedMonth;
let selectedYear;
let id;
let idPointer; // id of the selected event
let eventData = [];

if (storage.length == 0) {
    let prefillData = [
        {
            "id": 0,
            "title": "big meeting",
            "date": "2022-01-06",
            "starttime": "09:00",
            "endtime": "09:30",
            "type": "meeting",
            "description": "a meeting with boss"
        },
        {
            "id": 1,
            "title": "another meeting",
            "date": "2022-01-06",
            "starttime": "10:00",
            "endtime": "10:30",
            "type": "meeting",
            "description": "a meeting with another boss"
        },
        {
            "id": 2,
            "title": "meeting",
            "date": "2022-01-10",
            "starttime": "10:00",
            "endtime": "10:30",
            "type": "call",
            "description": "a call with boss"
        },
        {
            "id": 3,
            "title": "another meeting",
            "date": "2022-01-10",
            "starttime": "11:00",
            "endtime": "11:30",
            "type": "out_of_office",
            "description": "in person meeting"
        },
        {
            "id": 4,
            "title": "a long call",
            "date": "2022-01-12",
            "starttime": "10:00",
            "endtime": "13:30",
            "type": "call",
            "description": "a call"
        },
        {
            "id": 5,
            "title": "a meeting",
            "date": "2022-01-12",
            "starttime": "14:00",
            "endtime": "15:30",
            "type": "meeting",
            "description": "a meeting"
        },
    ];
    storage.setItem('data', JSON.stringify(prefillData)); 
}

id = JSON.parse(storage.getItem('data')).length;

const months = ["January", "February", "March", 
                "April", "May", "June", 
                "July", "August", "September", 
                "October", "November", "December"];

let daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
}

let getFirstDay = (month, year) => {
    let day = new Date(year, month, 1).getDay();
    if (day == 0) {
        day = 7;
    }
    return day - 1;
}

let getSelectedMonth = () => {
    let selectedMonth = monthField.innerHTML;

    for (let i = 0; i < 12; ++i) {
        if (selectedMonth == months[i]) {
            return i;
        }
    }
}

let initialize = () => {
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    
    monthField.innerHTML = months[month].toString();
    yearField.innerHTML = year.toString();
}

let loadCalendarContent = (month, year) => {
    let daysInSelectedMonth = daysInMonth(month, year);
    let firstDayOfSelectedMonth = getFirstDay(month, year);
    selectedMonthEvents = [];

    eventData = JSON.parse(storage.getItem("data"));

    for (let i = 0; i < 42; ++i) {
        if (i < firstDayOfSelectedMonth) {
            calendarGrid[i].className = "day hide";
            calendarGrid[i].id = "";
            calendarGrid[i].firstChild.innerHTML = "";
            calendarGrid[i].lastChild.innerHTML = "";
            calendarGrid[i].firstChild.className = "day_number";
            calendarGrid[i].lastChild.className = "day_events";
        } else if (i < (firstDayOfSelectedMonth + daysInSelectedMonth)) {
            let countOfEvents = 0;

            calendarGrid[i].className = "day";
            calendarGrid[i].firstChild.innerHTML = (i - firstDayOfSelectedMonth + 1).toString();
            calendarGrid[i].lastChild.innerHTML = "";
            calendarGrid[i].firstChild.className = "day_number";
            calendarGrid[i].lastChild.className = "day_events";

            for (let j = 0; j < eventData.length; ++j) {
                if (
                        new Date(eventData[j].date + 'T00:00:00').getTime() ===
                        new Date(selectedYear, selectedMonth, (i - firstDayOfSelectedMonth + 1)).getTime()
                ) {
                    let str = `
                        <div class="calendar_event ${eventData[j].type}" id="${eventData[j].id}e">
                            ${eventData[j].title}
                        </div>
                    `;
                    calendarGrid[i].lastChild.insertAdjacentHTML('beforeend', str);
                }
            }
        } else {
            calendarGrid[i].className = "day hide";
            calendarGrid[i].firstChild.innerHTML = "";
            calendarGrid[i].lastChild.innerHTML = "";
            calendarGrid[i].firstChild.className = "day_number";
            calendarGrid[i].lastChild.className = "day_events";
        }
    }
}

let adjustmentHandler = (e) => {
    switch (e.target.id) {
        case "month_top_arrow":
            selectedMonth = (selectedMonth + 1) % 12;
            monthField.innerHTML = months[selectedMonth].toString();
            loadCalendarContent(selectedMonth, selectedYear);
            break;
        case "month_bottom_arrow":
            selectedMonth = (selectedMonth - 1) % 12;
            if (selectedMonth < 0) {
                selectedMonth = 12 + selectedMonth;
            }
            monthField.innerHTML = months[selectedMonth].toString();
            loadCalendarContent(selectedMonth, selectedYear);
            break;
        case "year_top_arrow":
            selectedYear = parseInt(selectedYear) + 1;
            yearField.innerHTML = selectedYear.toString();
            loadCalendarContent(selectedMonth, selectedYear);
            break;
        case "year_bottom_arrow":
            selectedYear = parseInt(selectedYear) - 1;
            yearField.innerHTML = selectedYear.toString();
            loadCalendarContent(selectedMonth, selectedYear);
            break;
        default:
            break;
    }
}

let clickDayHandler = (e) => {
    let dayDiv = e.target;
    let tempId = 0;
    let tempIdString = (dayDiv.id).toString();

    clearDetails();
    createEventForm.className = "hide";
    submitButton.className = "hide";

    if (dayDiv.id === "") {
        return;
    }

    for (let i = 0; i <= tempIdString.length - 2; ++i) {
        tempId = tempId * 10;
        tempId += parseInt(tempIdString[i]);
    }

    for (let i = 0; i < eventData.length; ++i) {
        idPointer = tempId;
        if (eventData[i].id === tempId) {
            detailsTable.className = "";

            detailFields[0].innerHTML = `${eventData[i].title}`;
            detailFields[1].innerHTML = `${eventData[i].date}`;
            detailFields[2].innerHTML = `${eventData[i].starttime}`;
            detailFields[3].innerHTML = `${eventData[i].endtime}`;

            switch (eventData[i].type) {
                case "meeting":
                    detailFields[4].innerHTML = "Meeting";
                    break;
                case "call":
                    detailFields[4].innerHTML = "Call";
                    break;
                case "out_of_office":
                    detailFields[4].innerHTML = "Out of office";
                    break;
            }

            detailFields[5].innerHTML = `${eventData[i].description}`;
        }
        deleteButton.className = "";
        createEventForm.className = "";
        submitButton.className = "";
    }
}

let clearDetails = () => {
    detailsTable.className = "hide";
    deleteButton.className = "hide";
}

let submitHandler = () => {
    eventData = JSON.parse(storage.getItem('data'))

    if (validation()) {
        eventData.push({
            "id":id,
            "title":`${titleInput.value}`,
            "date":`${dateInput.value}`,
            "starttime":`${startTimeInput.value}`,
            "endtime":`${endTimeInput.value}`,
            "type":`${typeInput.value}`,
            "description":`${descriptionInput.value}`,
        });
        clearCreateEventFields();
        id++;
    }
    storage.setItem("data", JSON.stringify(eventData));
    loadCalendarContent(selectedMonth, selectedYear);
}

let validation = () => {
    let passedCheck = 1;

    for (let i = 0; i < validationMessages.length; ++i) {
        validationMessages[i].className = "validation_message hide";
    }

    if (titleInput.value === "") {
        validationMessages[0].className = "validation_message";
        validationMessages[0].innerHTML = "Title cannot be empty.";
        passedCheck = 0;
    }

    if (dateInput.value === "") {
        validationMessages[1].className = "validation_message";
        validationMessages[1].innerHTML = "Please enter a correct date.";
        passedCheck = 0;
    }

    if (startTimeInput.value === "") {
        validationMessages[2].className = "validation_message";
        validationMessages[2].innerHTML = "Please enter a correct start time.";
        passedCheck = 0;
    }

    if (endTimeInput.value === "") {
        validationMessages[3].className = "validation_message";
        validationMessages[3].innerHTML = "Please enter a correct end time.";
        passedCheck = 0;
        
    } else if ( startTimeInput.value != "" && 
                (
                    new Date('1970-01-01T' + startTimeInput.value + ':00') >=
                    new Date('1970-01-01T' + endTimeInput.value + ':00') 
                ) 
            ) {
                
        validationMessages[3].className = "validation_message";
        validationMessages[3].innerHTML = "End time must be later than start time.";
        passedCheck = 0;
    }
    
    if (passedCheck == 0) {
        return false;
    } else {
        return true;
    }
}

let clearCreateEventFields = () => {
    titleInput.value = "";
    dateInput.value = "";
    startTimeInput.value = "";
    endTimeInput.value = "";
    typeInput.selectedIndex = 0;
    descriptionInput.value = "";
}

let deleteEventHandler = () => {
    if (confirm("Are you sure you want to delete this event?")) {
        eventData = JSON.parse(storage.getItem('data'));
        eventData = eventData.filter(event => event.id !== idPointer);
        console.log(eventData);

        storage.setItem('data', JSON.stringify(eventData));
        clearDetails();
        loadCalendarContent(selectedMonth, selectedYear);
    }
}

initialize(); // sets initial state of the calendar to current month
selectedMonth = getSelectedMonth();
selectedYear = yearField.innerHTML;

loadCalendarContent(selectedMonth, selectedYear);

calendarHeader.addEventListener("click", adjustmentHandler, false);
calendarContainer.addEventListener("click", clickDayHandler, false);
submitButton.addEventListener("click", submitHandler, false);
deleteButton.addEventListener("click", deleteEventHandler, false);