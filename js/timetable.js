
var currentSelectedWeekDay;
var filler = ' ';
var weekDay = '';
var currentCalendarWeekAndYear;
var selectedClass;
var currentYear;
var timeTableEntryIndex;
var jobStorage;
var dropDownJob;
var dropDownClass;
var selectedJob;
var classStorage;

/*
Wenn Dropdownindex für die Berufe gewechselt wird,
werden alle anderen Elemente ausgeblendet und
KlassenDropdown für den ausgewählten Index befüllt.
*/
$('#job').change(function(){
  $('#weekLabel').fadeOut();
  $('#btn-nextWeek').fadeOut();
  $('#btn-lastWeek').fadeOut();
  $('#calendarTable').fadeOut();
  jobStorage = $('#job').val();
  fillClassDropdown();
});

/*
initialisiert beim Wechsel des Klassendropdownindex die Variable
"classStorage" und triggert die function um die Studenplantabelle zu befüllen.
*/
$('#schoolClass').change(function(){
  classStorage = $('#schoolClass').val();
  fillTable();
});

/*
parsed aus der Wochen-Jahr Variable die Woche heraus.
überprüft ob es einen Jahreswechsel gibt.
setzt dann die Wochen-Jahr Variable mit der neuen Werten zusammen und
triggert die function um die Stundenplantabelle neu zu laden.
*/
$('#btn-lastWeek').click(function(){
    var currentCalendarWeek = parseInt(currentCalendarWeekAndYear.split("-")[0]);
    if((currentCalendarWeek-1) < 1){
      currentYear --;
      currentCalendarWeek  = 53;
    }
    currentCalendarWeek -= 1;
    currentCalendarWeekAndYear = currentCalendarWeek + '-' + currentYear;
    if(selectedClass > 0){
      clearCalendarTable();
      setCalendar(selectedClass);
    }
});

/*
parsed aus der Wochen-Jahr Variable die Woche heraus.
überprüft ob es einen Jahreswechsel gibt.
setzt dann die Wochen-Jahr Variable mit der neuen Werten zusammen und
triggert die function um die Stundenplantabelle neu zu laden.
*/
$('#btn-nextWeek').click(function(){
    var currentCalendarWeek = parseInt(currentCalendarWeekAndYear.split("-")[0]);
    if((currentCalendarWeek+1) > 52){
      currentYear ++;
      currentCalendarWeek  = 0;
    }
    currentCalendarWeek += 1;
    currentCalendarWeekAndYear = currentCalendarWeek + '-' + currentYear;
    if(selectedClass > 0){
      clearCalendarTable();
      setCalendar(selectedClass);
    }
});

/*
initialisert die variablen
triggert die function für das laden der berufe
initialisiert die aktuelle Kalenderwoche und das aktuelle Jahr
*/
$(document).ready(function(){
    jobStorage = localStorage.getItem("job");
    classStorage = localStorage.getItem("class");
    dropDownJob = document.querySelector("#job");
    dropDownClass = document.querySelector('#schoolClass');
    setJobs();
    currentCalendarWeekAndYear = getCurrentCalendarWeekAndYear();
});
/*
initialisert die Berufe aus dem JSON-Response und mapt value des Dropdowns
auf die berufs-ID und den Text auf den berufs-Name
-wenn eine localStorage verfügbar ist, wird diese im Dropdown selektiert.
- schlägt der Request fehl, wird eine Fehlermeldung angezeigt.
*/
function setJobs(){
  $.getJSON('http://home.gibm.ch/interfaces/133/berufe.php',function(response){
      $.each(response,function(index,job){
          $('#job').append($('<option/>',{
              value: job['beruf_id'],
              text : job['beruf_name']
          }));
      });
            if(jobStorage){
              dropDownJob.value = jobStorage;
              fillClassDropdown();
              if(classStorage){
                selectedClass = classStorage;
                dropDownClass.value = classStorage;
                fillTable();
                  }
                }
          })
          .fail(function() { alert('getJSON request failed! '); })
}

/*
Wenn ein Beruf ausgewählt wird der Request für die dazugehörigen klassen
gesendet.
Für jede Klasse im response wird die value und der Text gemapt.
Wenn sich etwas im local storage befindet wird diese Klasse selektiert.
Schlägt der Request fehl wird eine Meldung angezeigt.
*/
function setClasses(selectedJob){
  if(selectedJob > 0 && selectedJob !== '' ){
    $.getJSON('http://home.gibm.ch/interfaces/133/klassen.php','beruf_id='+selectedJob,function(response){
      clearSchoolClassDropdown();
        $('#schoolClass').append($('<option/>',{
                text : "Bitte auswählen"}));
        $.each(response,function(schoolClassID,schoolClass){
          $('#schoolClass').append($('<option/>',{
              value: schoolClass['klasse_id'],
              text: schoolClass['klasse_longname']
          }));
        });
          if(classStorage){
            $('#schoolClass').val(classStorage);
            selectedClass = classStorage;
          }
         $('#classDropdown').fadeIn();
      })
        .fail(function() { alert('getJSON request failed! '); })
    }}

/*
Funktion um die selktierte Klasse zu löschen.
*/
function clearSchoolClassDropdown(){
  $('#schoolClass').empty();
}

/*
Funktion um die KlassenDropdown zu füllen, ebenfalls wird hier eine local
storage variable für den ausgewählten Beruf gesetzt.
*/
function fillClassDropdown(){
  clearCalendarTable();
  selectedJob =  $('#job').val();
  setClasses(selectedJob);
  localStorage.setItem('job', selectedJob);
}

/*
Funktion um die Stundenplantabelle zu füllen, ebenso wird eine local storage
variable für die ausgewählte Klasse gesetzt.
*/
function fillTable(){
  clearCalendarTable();
  setCalendar(classStorage);
  selectedClass = $('#schoolClass').val();
  localStorage.setItem("class",  classStorage);
}

/*
Funktion um den Kalender zu initialisieren.
Wenn für die gewählte Woche kein Unterricht zur Verfügung steht,
wird eine Meldung eingeblendet, welche den User darauf hinweist.
Für jeden Tag wird ein Switch durchgeführt um den Text dazu zu setzen.

*/
function setCalendar(selectedClass){
    // Woche und Jahr getrennt mit -
    $.getJSON('http://home.gibm.ch/interfaces/133/tafel.php?klasse_id='+selectedClass+'&woche='+currentCalendarWeekAndYear,function(result){
      document.getElementById('weekLabel').innerHTML = currentCalendarWeekAndYear;
      $('#weekLabel').fadeIn();
      localStorage.setItem("weekAndYear",  currentCalendarWeekAndYear);
      $('#btn-nextWeek').fadeIn();
      $('#btn-lastWeek').fadeIn();
      if(result.length == 0){
          $('#calendarTable').fadeOut();
          $('#noClassThisWeek').fadeIn();
      }
      else{
        $('#noClassThisWeek').fadeOut();
        $('#calendarTable').fadeIn();

       $.each(result, function(index, field){
         if(field.tafel_wochentag !== currentSelectedWeekDay &&  timeTableEntryIndex !==0){
           var emptyCalendarRow = '<tr><td>' + filler + '</td><td>' + filler + '</td><td>' +filler + '</td><td>' + filler
            + '</td><td>' + filler + '</td><td>' + filler + '</td><td>' + filler + '</td></tr>';
           $('#calendarTable').append(emptyCalendarRow);
                }
                switch(field.tafel_wochentag){
                  case "1":
                  weekDay = 'Montag';
                  break;
                  case "2":
                  weekDay = 'Dienstag';
                  break;
                  case "3":
                  weekDay = 'Mittwoch';
                  break;
                  case "4":
                  weekDay = 'Donnerstag';
                   break;
                  case "5":
                  weekDay = 'Freitag';
                  break;
                  case "6":
                  weekDay = 'Samstag';
                  break;
                  case "7":
                  weekDay = 'Sonntag';
                  break;
                }
        var calendarRow = '<tr><td>' + field.tafel_datum + '</td><td>' + weekDay + '</td><td>' + field.tafel_von + '</td><td>' + field.tafel_bis
          + '</td><td>' + field.tafel_lehrer + '</td><td>' + field.tafel_fach + '</td><td>' + field.tafel_raum + '</td></tr>';
         $('#calendarTable').append(calendarRow);
         setCurrentLesson(field, calendarRow);
         currentSelectedWeekDay = field.tafel_wochentag;
       })
      };
    })
    .fail(function() { alert('getJSON request failed! '); })
}

/*
Returned die aktuelle Woche + das aktuelle Jahr im MM-YYYY Format.
*/
function getCurrentCalendarWeekAndYear(){
    Date.prototype.getWeek = function() {
        var onejan = new Date(this.getFullYear(), 0, 1);
        return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    };
    currentYear = (new Date()).getFullYear();
    return calendarWeek = (new Date()).getWeek() + '-' +currentYear;
  }

/*
Funktion um die Studenplantabelle zu leeren.
*/
  function clearCalendarTable(){
    $('#calendarTable tbody').empty();
  }

/*
berechnet die aktuelle aktive Stund und highlighted diese in der Tabelle.
*/
  function setCurrentLesson(field, calendarRow){
    var todayDateTime = new Date();
    var currentDateTime = new Date();

    currentDateTime.setFullYear(field.tafel_datum.split("-")[0]);
    currentDateTime.setMonth(field.tafel_datum.split("-")[1]);
    currentDateTime.setMonth(currentDateTime.getMonth() -1); // Weil Monate bei [0] beginnen
    currentDateTime.setDate(field.tafel_datum.split("-")[2]);
    var startTime = field.tafel_von;
    var endTime = field.tafel_bis;

    var startDateTime =new Date(currentDateTime.getTime());
    startDateTime.setHours(startTime.split(":")[0]);
    startDateTime.setMinutes(startTime.split(":")[1]);
    startDateTime.setSeconds(startTime.split(":")[2]);

    var endDateTime = new Date(currentDateTime.getTime());
    endDateTime.setHours(endTime.split(":")[0]);
    endDateTime.setMinutes(endTime.split(":")[1]);
    endDateTime.setSeconds(endTime.split(":")[2]);

    if(startDateTime.getDate() == todayDateTime.getDate() && startDateTime.getMonth() == todayDateTime.getMonth() && startDateTime.getYear() == todayDateTime.getYear() && startDateTime < currentDateTime && endDateTime > currentDateTime){
      var currentIndex = $('#calendarTable').find(`tr`).length-1;
      $('#calendarTable').find(`tr`).eq(currentIndex).attr('style','background-color: yellow;');
    }
  }
