let UI = {
    btn: {
        search: $("#btnSearch"),
        openEmail: $("#btnOpenEmailForm"),
        sendReminder: $("#reminderOK"),
        cancelReminder: $("#reminderCancel"),
    },
    input: {
        date: $("#date"),
        time: $("#time"),
        origin: $("#inputOrigin"),
        destination: $("#inputDestination"),
        tripIndex: $("#tripIndex"),
        email: $("#inputReminderEmail"),
        minutes: $("#inputReminderMinutes"),
    },
    container: {
        logo: $("#logoDiv"),
        progressBg: $("#backgroundOne"),
        progressBar: $("#searchProgressBar"),
        trips: $("#listContainer"),
        reminderBg: $("#reminderFormBg"),
        popUp: $("#popUp"),
        email: $("#emailForm"),
    },
    text: {
        counter: $("#counter"),
        counterInfo: $("#counterInfo"),
    },

}

let intern = {
    tripLocalArray: [],
    rtCheckInterval: 0,
    upCounterInterval: 0,
    chosenTrip: {},
}

$(document).ready(() => {
    UI.btn.search.click(sendSearchForm);
    UI.input.date.val(getTodayDate());
    UI.input.time.val(getNowTime());
    UI.btn.cancelReminder.click(cancelReminder);
    UI.btn.sendReminder.click(startReminder);
    UI.btn.openEmail.click(openEmailForm);
    UI.container.logo.click(() => {
        document.location.href = "/";
    });
});

function getTodayDate() {
    let today = new Date();
    let dd = today.getDate();
    if (dd < 10) {
        dd = '0' + dd;
    }
    let mm = today.getMonth() + 1;
    if (mm < 10) {
        mm = '0' + mm;
    }
    let yyyy = today.getFullYear();
    return yyyy + '-' + mm + '-' + dd;
}

function getNowTime() {
    let today = addTime(new Date(), 5);
    let hh = today.getHours();
    if (hh < 10) {
        hh = '0' + hh;
    }
    let MM = today.getMinutes();
    if (MM < 10) {
        MM = '0' + MM;
    }
    return hh + ':' + MM;
}

function getOrigins() {
    $("#originList").empty();
    let textData = UI.input.origin.val();
    fetch('http://localhost:8080/siteinfo', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: textData
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        for (let key in data) {
            let option = document.createElement("OPTION");
            option.setAttribute("value", data[key].Name);
            option.classList.add("form-control")

            $("#originList").append(option);
        }
    });
}

function getDests() {
    $("#destList").empty();
    let textData = UI.input.destination.val();
    fetch('http://localhost:8080/siteinfo', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: textData
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        for (let key in data) {
            let option = document.createElement("OPTION");
            option.setAttribute("value", data[key].Name);
            option.classList.add("form-control")

            $("#destList").append(option);
        }
    });
}

function searchTrip() {
    UI.container.progressBg.removeClass('invisible');
    UI.container.progressBg.addClass('visible');
    UI.container.progressBar.attr('aria-valuenow', '10%').css('width', '10%');
    UI.container.trips.empty();
    let origin = UI.input.origin.val();
    let destination = UI.input.destination.val();
    let date = UI.input.date.val();
    let time = UI.input.time.val();

    let obj = {
        originId: origin,
        destId: destination,
        date: date,
        time: time
    };

    let str = 'originName=' + origin + '&destName=' + destination + '&date=' + date + '&time=' + time;

    UI.container.progressBar.attr('aria-valuenow', '98%').css('width', '98%');

    fetch('http://localhost:8080/search', {
        method: 'post',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: str
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        UI.container.progressBar.attr('aria-valuenow', '100%').css('width', '100%');
        intern.tripLocalArray = data;
        parseTrip(data);
    });


}

function validateSearchForm() {
    if (UI.input.origin.val() === "" ||
        UI.input.destination.val() === "" ||
        UI.input.date.val() === "" ||
        UI.input.time.val() === "") {
        return false;
    } else {
        return true;
    }
}

function sendSearchForm() {
    if (validateSearchForm()) {
        searchTrip();
    } else {
        console.log('Form not valid');
    }
}


function parseTrip(output) {

    for (let row in output) {

        let trip = output[row];

        let travelTime = '';

        if (trip.hours === "") {
            travelTime = trip.minutes + 'min';
        } else {
            travelTime = trip.hours + ' h  ' + trip.minutes + ' min';
        }

        let startTime = trip.startTime.substring(0, 5);
        let endTime = trip.endTime.substring(0, 5);


        let resultDiv = document.createElement("DIV");
        resultDiv.classList.add("py-2", "my-3");
        resultDiv.setAttribute("id", "resultDiv");
        resultDiv.setAttribute("data-toggle", "collapse");
        resultDiv.setAttribute("href", "#detail" + row);

        let tripDiv = document.createElement("DIV");
        tripDiv.innerHTML = '<div class="d-flex justify-content-between">' +
            '<p><span>' + startTime + '</span> <i class="fas fa-long-arrow-alt-right"></i> <span>' + endTime + '</span></p>' +
            '<p>Restid: <span>' + travelTime + '</span></p>' +
            '</div>' +
            '<div class="d-flex justify-content-between align-items-center">' +
            '<p><span>' + trip.originName + '</span> <i class="fas fa-long-arrow-alt-right"></i> <span>' + trip.destName + '</span></p>' +
            '<button class="btn btn-reminder btn-link reminderButton" value="' + row + '" type="button" id="reminderBtn' + row + '"><i class="fas fa-bell"></i></button>' +
            '</div>'
            ;
        tripDiv.classList.add("m-4");

        let list = trip.legList;

        for (let detail in list) {
            let leg = list[detail];
            let o = leg.Origin;
            let d = leg.Destination;

            let startTime = o.time.substring(0, 5);
            let endTime = d.time.substring(0, 5);

            console.log(leg.name);


            let legIcon = '';
            if (leg.name === 'TUNNELBANA  13') {
                legIcon = '<i class="fas fa-subway text-danger"></i>';
            }


            console.log(legIcon);

            let detailDiv = document.createElement("DIV");
            detailDiv.setAttribute("id", "detail" + row);
            detailDiv.classList.add("collapse");
            detailDiv.innerHTML = '<div id="detailDiv">' +
                '<div class="dropdown-divider"></div>' +
                '<p>&emsp;<i class="fas fa-angle-double-down"></i> <span>' + startTime + '</span> <span>' + o.name + '</span></p>' +
                '<p>&emsp;&emsp;' + legIcon + '&emsp;<span>' + leg.name + '</span> mot <span>' + leg.direction + '</span></p>' +
                '<p>&emsp;<i class="fas fa-angle-double-right"></i> <span>' + endTime + '</span> <span>' + d.name + '</span></p>' +
                '</div>'
                ;
            tripDiv.appendChild(detailDiv);
        }

        resultDiv.appendChild(tripDiv);
        UI.container.trips.append(resultDiv);
        $("#reminderBtn" + row).click(showReminderForm);
        UI.container.progressBar.attr('aria-valuenow', '0%').css('width', '0%');
        UI.container.progressBg.removeClass('visible');
        UI.container.progressBg.addClass('invisible');
    }
}

function showReminderForm() {
    UI.container.reminderBg.removeClass('invisible');
    UI.container.reminderBg.addClass('visible');
    UI.input.tripIndex.val($(this).val());

    intern.chosenTrip = intern.tripLocalArray[UI.input.tripIndex.val()];
    let expectedDep = parsedTimeTableTime(intern.chosenTrip.startTime);
    intern.rtCheckInterval = setInterval(() => {
        fetch('http://localhost:8080/checktime', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(intern.chosenTrip)
        }).then(function (response) {
            return response.text();
        }).then(function (data) {
            expectedDep = parseTime(data);
        });
    }, 5000);
    intern.upCounterInterval = setInterval(() => {
        updateCounter(new Date(), expectedDep);
    }, 1000);
}

function cancelReminder() {
    clearInterval(intern.rtCheckInterval);
    clearInterval(intern.upCounterInterval);

    UI.container.popUp.css('top', '50%');
    UI.btn.openEmail.removeClass("myInvisible");
    UI.container.email.addClass("myInvisible");
    UI.btn.sendReminder.addClass("myInvisible");

    UI.container.reminderBg.removeClass('visible');
    UI.container.reminderBg.addClass('invisible');
    UI.text.counter.text('00:00');
    UI.btn.openEmail.prop('disabled', false);


}

function startReminder() {
    intern.chosenTrip = intern.tripLocalArray[UI.input.tripIndex.val()];
    let email = UI.input.email.val();
    let reminderMinutes = UI.input.minutes.val();
    intern.chosenTrip.email = email;
    intern.chosenTrip.reminderMinutes = reminderMinutes;
    fetch('http://localhost:8080/reminder', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(intern.chosenTrip)
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        if (data) {
            console.log('Reminder set');
        } else {
            console.log('Could not set reminder');
        }

    });

}

function updateCounter(now, departure) {
    console.log('cnow: ' + now);
    console.log('cdep: ' + departure);
    let diff = departure - now;
    console.log('timediff ' + diff)

    if (diff < 0) {
        UI.text.counter.text('00:00');
        UI.text.counterInfo.text('Avgångstiden har passerat');
        UI.btn.openEmail.prop('disabled', true);
    } else {
        UI.text.counterInfo.text('Avgång om');
        UI.btn.openEmail.prop('disabled', false);
        let counterMinutes = Math.floor(diff / 60000);
        let counterSeconds = Math.floor((diff % 60000) / 1000);
        alertDeparture(counterSeconds, counterMinutes, UI.input.minutes.val());
        if (counterSeconds < 10) {
            counterSeconds = '0' + counterSeconds;
        }
        if (counterMinutes < 10) {
            counterMinutes = '0' + counterMinutes;
        }
        UI.text.counter.text(counterMinutes + ':' + counterSeconds);
    }
}

function addTime(date, min) {
    return new Date(date.getTime() + min * 60000);
}

function parseTime(dateStr) {
    let year = dateStr.substring(0, 4);
    let month = Number(dateStr.substring(5, 7)) - 1;
    let day = dateStr.substring(8, 10);
    let h = dateStr.substring(11, 13);
    let m = dateStr.substring(14, 16);
    let s = dateStr.substring(17, 19);
    let parsedDate = new Date(year, month, day, h, m, s);
    // console.log('parsed: ' + parsedDate);
    return parsedDate;
}

function parsedTimeTableTime(timeTableTime) {
    let h = timeTableTime.substring(0, 2);
    let m = timeTableTime.substring(3, 5);
    let s = timeTableTime.substring(6);
    let timeTableDate = new Date();
    timeTableDate.setHours(h, m, s);
    return timeTableDate;

}

function openEmailForm() {
    UI.btn.openEmail.addClass("myInvisible");
    UI.container.email.removeClass("myInvisible");
    UI.btn.sendReminder.removeClass("myInvisible");
}

function alertDeparture(seconds, minutes, reminderMinutes) {
    console.log('reminder minutes: ' + reminderMinutes);
    if (reminderMinutes == minutes && seconds == 0) {
        UI.container.popUp.css('top', '15%');

    }
}