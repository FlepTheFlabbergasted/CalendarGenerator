
/**
 * Desc.
 * @param {Number} a 
 * @param {Number} b
 * @return {Number} sum
 */

/*
  console.log("log: Test");
  console.error("error: Test");
  console.info("info: Test");
  console.warn("warn: Test");
*/ 

// Mouse button handling for stupid browsers (Like, really Firefox, really!?)
var isMouseDown = false;
document.addEventListener('mouseup', function(){
  isMouseDown = false; 
});
document.addEventListener('mousedown', function(){
  isMouseDown = true;
});

/**
 * Main tableObj object containing info about the calendar and functions to work on the tableObj.
 */
var calendar = {
  tableObj: null, 
  currentYear: -1, 
  startMonthNr: -1,
  months: [],
  nrMonths: 3,
  monthsColspan: [0, 0, 0],
  monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  weeks: [],
  startWeek: -1,
  nrWeeks: -1,
  firstWeekDayMonday: false,
  changeStartWeek: false,
  dates: [],
  names: [],
  nrNames: -1,
  maxNrNames: 99,
  paletteColorArray: ["","red", "yellow", "dodgerblue", "olive"],
  paletteColor: "",
  cellLetterArray: ["", "X", "X", "P", "H"],
  cellLetter: "",
  monthRow: null,
  weekRow: null,
  dateRow: null,
  nameRows: [],
  nameRowClassName: "nameRow",
  justChangeMonths: false,

  /**
   * Main function for generating the table. Called when clicking the "Generate" button.
   */
  generate : function() {
    console.info("[FUNCTION]: Entering calendar.generate()");

    // Make sure the table is cleared before generating the new table.
    this.reset();

    /* Get the months, weeks and days for the selected months
    *  Weeks are calculated by the days, therefore we retreive them first.
    */
    this.getMonths();
    this.getDates();
    this.getWeeks();

    this.createRows();
    this.style();
    
    this.enableEditing();
  },

  /**
   * Initiate parameters in calendar object that can be set at document load.
   */
  init : function() {
    console.info("[FUNCTION]: Entering calendar.init()");
    try {
      this.tableObj = document.getElementById("calendarTable");
      this.currentYear = new Date().getFullYear();
      if(!this.tableObj) throw "Could not get calendar tableObj";
      if(!this.currentYear) throw "Could not set current year";
    } catch(err) {
      console.error("init() threw error: " + err);
    }
  },

  /**
   * Clear the table to be able to generate next table and reset some parameters.
   */
  reset : function() {
    console.info("[FUNCTION]: Entering calendar.reset()");
    while(this.tableObj.hasChildNodes()) {
      this.tableObj.removeChild(this.tableObj.lastChild);
    }
    this.months = [];
    this.weeks = [];
    this.changeStartWeek = false;
    this.firstWeekDayMonday = false;
    this.monthsColspan = [0,0,0];
    this.dates = [];

    // If the user only wants to change the generated months/weeks/days, do not clear the names
    if(this.justChangeMonths === false) {
      this.names = [];
    }
    this.nameRows = [];
  },

  /**
   * Get months from the select element in the html file, save start month number and months.
   */
  getMonths : function() {
    console.info("[FUNCTION]: Entering calendar.getMonths()");
    var i = 0;
    try {
      this.startMonthNr = parseInt(document.getElementById("startMonth").value, 10);
      if(this.startMonthNr < 0) throw "Start month is less than zero";
    } catch(err) {
      console.error("getMonths() threw error: " + err);
    }      
    finally {
      // Save the names for all the months in an array of strings.
      for(i = this.startMonthNr; i < (this.nrMonths + this.startMonthNr); i++) {
        if(i <= 11) {
          this.months.push(this.monthNames[i]);
        } else {
          console.log("Over dec");
          this.months.push(this.monthNames[i - 12]);
        }
      }
      console.log("[LOG]: Nr months in calendar: " + this.months.length);
      console.log("[LOG]: Months in calendar: " + this.months);
    }
  },

  /**
   * Get all the dates for all the selected months and save them.
   */
  getDates: function() {
    console.info("[FUNCTION]: Entering calendar.getDates()");
    // The first week can contain days from previous month and requires special handling.
    var firstWeekInMonth = true;

    // If the calendar stretches over to the next year.
    var monthOverflow = 0;
    var nrDaysInMonth = 0;
    // To be able to account for the week starting on a Saturday or Sunday.
    var nrDaysPreviousMonth = daysInMonth(this.currentYear, this.startMonthNr - 1);
    var previousMonthDate = null;
    var dayOfWeek = null;
    var monthsColspanCounter = 0;

    // Loop iterators
    var month = 0, day = 0, i = 0;
    
    // TODO: Able to do shorter/more beautiful/readable code?
    // Loops through all the months and days to save the dates.
    for(month = this.startMonthNr; month < (this.startMonthNr + this.nrMonths); month++) {
      // January = 0, December = 11
      if(month <= 11) {
          nrDaysInMonth = daysInMonth(this.currentYear, month);
      } else {
          nrDaysInMonth = daysInMonth(this.currentYear + 1, monthOverflow);
          monthOverflow++;
      }
  
      /* Loop through all the dates in the current month and save the dates. 
       * Var 'day' starts on '1' because function Date() gives month's number
       * of days otherwise.
       */ 
      for(day = 1; day < (nrDaysInMonth + 1); day++) {
        if(month <= 11) {
          dayOfWeek = new Date(this.currentYear, month, day).getDay();
        } else {
          dayOfWeek = new Date(this.currentYear + 1, monthOverflow - 1, day).getDay();
        }
  
        // Saturday = 6, Sunday = 0, Monday = 1
        if(firstWeekInMonth) {
          if(dayOfWeek != 1) {
            /* If start of month is on a Saturday or Sunday the starting week needs to be
            * moved forward 1 week to get correct date and week matching. This is because this
            * calendar only deals with workdays and when the month starts with a weekend those
            * weekend days is in the previous week (that we don't care about) causing a -1 diff 
            * for the starting week. 
            * TODO: tl;dr
            */
            if(dayOfWeek == 0 || dayOfWeek == 6) {
              this.changeStartWeek = true;
              console.log("[LOG]: Month starts with Sat/Sun, start week to be changed");
            } else {
              // Insert the missing days in the week from the last month.
              previousMonthDate = nrDaysPreviousMonth - (dayOfWeek - 2);
              for(i = 0; i < (dayOfWeek - 1); i++) {
                this.dates.push(previousMonthDate);
                previousMonthDate++;
                this.monthsColspan[monthsColspanCounter]++;
              }
            }
          } else {
            // First day of the moth is a monday, save this flag to later check if the 
            // starting week needs to be changed.             
            this.firstWeekDayMonday = true;
          }
          firstWeekInMonth = false;
        }
        // Save dates between Monday to Friday (working week).
        if(dayOfWeek >= 1 && dayOfWeek <= 5) {
          this.monthsColspan[monthsColspanCounter]++;
          this.dates.push(day);
        }
      }
      // Count up the next month's colspan in the next iteration.
      monthsColspanCounter++;
    }
    console.log("[LOG]: Nr dates in calendar: " + this.dates.length);
    console.log("[LOG]: Dates in calendar: " + this.dates);
  },

  /**
   * Get all the weeks for all the selected months and save them.
   */
  getWeeks: function() {
    console.info("[FUNCTION]: Entering calendar.getWeeks()");

    var nrDaysToStartMonth = 0;
    var nrDaysInYear = 0;
    var nrWeeksInYear = 0;
    var i = 0;
    
    // Get the nr of days up until the start month and for the full year.
    for (i = 0; i < 12; i++) {
      if(i < this.startMonthNr) {
        nrDaysToStartMonth += daysInMonth(this.currentYear, i);
      }
      nrDaysInYear += daysInMonth(this.currentYear, i);
    }
  
    this.startWeek = Math.ceil(nrDaysToStartMonth/7);
    this.nrWeeks = Math.round(this.dates.length/5);
    nrWeeksInYear = Math.round(nrDaysInYear/7);
  
    /* If the first month starts on a Sat or Sunday, or if January was selected.
     * Alternatively if the month starts with a monday and the day of the year is evenly divided by 7.
     */
    if(this.changeStartWeek || this.startMonthNr == 0) {
      console.log("[LOG]: Changing start week with +1");
      this.startWeek++;
    } else if (this.firstWeekDayMonday && (nrDaysToStartMonth % 7 == 0)) {
      // This shit only happens once or twice a year: https://www.timeanddate.com/calendar/weekday-monday-1
      console.log("[LOG]: Month starts with Monday and day of the year is evenly dividable by 7, start week +1");
      this.startWeek++;
    }
  
    for(i = this.startWeek; i < (this.nrWeeks + this.startWeek); i++) {
      if(i > nrWeeksInYear) {
        this.weeks.push(i - nrWeeksInYear);
      } else {
        this.weeks.push(i);
      } 
    }
  
    /* Calculating weeks depends on the functions ceil() and round(), that
    *  can make them prone to +-1 errors, therefore log useful info for debugging.
    */
    console.log("[LOG]: Nr weeks in the year: "         + nrDaysInYear/7);
    console.log("[LOG]: Nr weeks in the year .round(): "+ nrWeeksInYear);
    console.log("[LOG]: Start week: "                   + nrDaysToStartMonth/7);
    console.log("[LOG]: Start week.ceil(): "            + this.startWeek);
    console.log("[LOG]: Nr weeks in calendar: "         + this.dates.length/5);
    console.log("[LOG]: Nr weeks in calendar .round(): "+ this.nrWeeks);
    console.log("[LOG]: Nr weeks saved: " + this.weeks.length);
    console.log("[LOG]: Weeks: " + this.weeks);
  },

  /**
   * Creates and attaches the month, week, date and all the member rows to the calendar.
   */
  createRows : function() {
    console.info("[FUNCTION]: Entering calendar.createRows()");
    var cell = null;
    var allCells = null;
    var weekColor = "";
    var nameRows = null;
    var i = 0, j = 0;
    
    this.monthRow = this.tableObj.insertRow(0);
    this.weekRow = this.tableObj.insertRow(1);
    this.dateRow = this.tableObj.insertRow(2);

    this.monthRow.id = "monthRow";
    this.weekRow.id = "weekRow";
    this.dateRow.id = "dateRow";

    cell = this.monthRow.insertCell(0);
    cell.innerHTML = "Month";
    cell = this.weekRow.insertCell(0);
    cell.innerHTML = "Week";
    cell = this.dateRow.insertCell(0);
    cell.innerHTML = "Date";

    // Insert all the months.
    for(i = 0; i < this.months.length; i++) {
      cell = this.monthRow.insertCell(-1);
      cell.innerHTML = this.months[i];
    }

    // Insert all the weeks.
    for(i = 0; i < this.weeks.length; i++) {
      cell = this.weekRow.insertCell(-1);
      cell.innerHTML = "Week " + this.weeks[i];
    }

    // Insert all the dates.
    for(i = 0; i < this.dates.length; i++) {
      cell = this.dateRow.insertCell(-1);
      if(this.dates[i] < 10) {
        cell.innerHTML = "0" + this.dates[i];    
      } else {
        cell.innerHTML = this.dates[i];   
      }
    }
    
    // Insert all the names.
    for(i = 0; i < this.names.length; i++) {
      this.nameRows.push(this.tableObj.insertRow(-1));
      this.nameRows[i].className = this.nameRowClassName;
      cell = this.nameRows[i].insertCell(-1);
      cell.innerHTML = this.names[i];
      
      for(j = 0; j < this.dates.length; j++) {
        cell = this.nameRows[i].insertCell(-1);
      }
    }
  },

  /**
   * Sets the style of the calendar by calling three minor styling functions.
   */
  style : function() {
    console.info("[FUNCTION]: Entering calendar.style()");
    this.styleRows();
    this.styleCells();
    this.styleTable();
  },

  /**
   * Sets the style of month, week and date rows.
   */
  styleRows : function(){
    console.info("[FUNCTION]: Entering calendar.styleRows()");
    var i = 0;
    
    // Change colspan and color the cells for the month row.
    for(i = 0; i < this.months.length; i++) {
        this.monthRow.cells[i + 1].colSpan = this.monthsColspan[i];
        this.monthRow.cells[i + 1].style.backgroundColor = randomColor();
    }

    // Change colspan (working week is 5 days) and color the cells for the week row.
    weekColor = randomColor();
    for(i = 0; i < this.weeks.length; i++) {
        this.weekRow.cells[i + 1].colSpan = 5;
        if(i % 2 == 1) {
            this.weekRow.cells[i].style.backgroundColor = weekColor;
        } else if(i == this.weeks.length - 1){
            this.weekRow.cells[i+1].style.backgroundColor = weekColor;
        }
    }
    
    this.monthRow.style.fontWeight = "bold";
    this.weekRow.style.fontWeight = "bold";
    this.dateRow.style.fontWeight = "bold";
  },

  /**
   * Sets the style of all the cells in the calendar.
   */
  styleCells : function(){
    console.info("[FUNCTION]: Entering calendar.styleCells()");
    var allCells = null;
    var cellPadding = "4px 1px 4px 1px";
    var cellBorder = "1px solid black";
    var i = 0;

    // Set the padding and border of every cell in the table.
    allCells = this.tableObj.getElementsByTagName("td");
    for(i = 0; i < allCells.length; i++) {
        allCells[i].style.padding = cellPadding;
        allCells[i].style.border = cellBorder;
    }
  },

  /**
   * Sets the style of the calendar itself.
   */
  styleTable : function(){
    console.info("[FUNCTION]: Entering calendar.styleTable()");
    this.tableObj.style.textAlign = "center";
    this.tableObj.style.fontFamily = "calibri";
    this.tableObj.style.width = "100%";
    this.tableObj.style.borderCollapse = "collapse";
    this.tableObj.style.whiteSpace = "nowrap";
    this.tableObj.style.backgroundColor = "white";
    this.tableObj.style.marginTop = "2%";
    this.tableObj.style.marginBottom = "2%";
  },

  /**
   * Gets the pasted calendar code from the text area input, parses it and assigns 
   * it to the table on the page. Then call the functions to enable editing 
   * on the table.
   */
  pasted : function() {
    // TODO: Set all variables possible in calendar object.
    console.info("[FUNCTION]: Entering calendar.pasted()");

    var calendarTableCode = "";
    var nameRowsClass = null;
    var i = 0;
    
    calendarTableCode = document.getElementById("editPastedCalendar").value;
    // Remove everything not inside "<table> </table>" from the pasted text.
    calendarTableCode = calendarTableCode.substring(calendarTableCode.lastIndexOf("<table"),calendarTableCode.lastIndexOf("</table>")+8);
    
    if(calendarTableCode === "") {
      console.log("[LOG]: No pasted calendar code was found, returning");
      return;
    }

    // Make sure we start clean.
    this.reset();

    // Assign the pasted code to the table element on the page.
    this.tableObj.innerHTML = calendarTableCode;
    
    // Save the rows so they can be accessed easy later.
    this.monthRow = document.getElementById("monthRow"); // Not used as of v2.0
    this.weekRow = document.getElementById("weekRow");  // Noy used as of v2.0
    this.dateRow = document.getElementById("dateRow");
    this.dates = this.dateRow.cells;
    
    // Get the number of names in the pasted calendar.
    nameRowsClass = this.tableObj.getElementsByClassName(this.nameRowClassName);
    for(i = 0; i < nameRowsClass.length; i++) {
        this.nameRows.push(nameRowsClass[i]);
    }
    // Needs to be reset here otherwise names get duplicated every time edit is pressed.
    this.names = [];
    // Populate the name array with names from the pasted calendar.
    for(i = 0; i < this.nameRows.length; i++) {
        this.names.push(this.nameRows[i].cells[0].innerHTML);
    }

    this.styleTable();
    this.enableEditing();

    console.log("[LOG]: Nr names found: " + this.names.length);
    console.log("[LOG]: The names found: " + this.names);
  },

  /**
   * Copies the calendar as text to the clipboard.
   */
  copy : function() {
    console.info("[FUNCTION]: Entering calendar.copy()");
    var calendarTableCode = null;
    var dummy = null;
    
    // Get the calendar code as a string.
    calendarTableCode = this.tableObj.outerHTML;
    // Remove <tbody></tbody> in code, the wiki doesn't like it for some reason.
    calendarTableCode = calendarTableCode.replace("<tbody>", "");
    calendarTableCode = calendarTableCode.replace("</tbody>", "");
    
    // Create a dummy input object (.select() only works on text objects). 
    dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute("id", "dummyId");
    dummy.setAttribute('value', calendarTableCode);
    // Select and copy the code for the calendar.
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    
    // Flash the copy button
    fadeOutnIn($('#copyButton'), 50);

    console.log("[LOG]: Calendar code has been copied to clipboard");
  },

  /**
   * Enable editing of the calendar through eventlisteners.
   */
  enableEditing : function() {
    console.info("[FUNCTION]: Entering calendar.enableEditing()");
    this.addCellListener();
    this.addDateCellListener();
    
    // Display more editing options.
    displayConfigureNames();
    displayCopyButton();
  },

  /**
   * Add event listeners to the name row cells. Color the cells
   * when clicked and dragged or just clicked.
   */
  addCellListener : function() {
    console.info("[FUNCTION]: Entering calendar.addCellListener()");
    
    // Find every cell in every name row and assign an eventlistener to it.
    $("." + this.nameRowClassName).find("td").each(function(index) {
      // Do not color the first cell in the row (where the name is).
      if($(this)[0].cellIndex != 0) {
        // When the mouse is dragged/moved over the cell.
        $(this).mousemove(function(e) {
          // If left mouse button is pressed, color the cell.
          if(e.which == 1 && isMouseDown == true) {
            $(this).css("background", calendar.paletteColor);
            $(this).html(calendar.cellLetter);
          }
        });

        // When the cell is clicked.
        $(this).on('click', function() {
          $(this).css("background", calendar.paletteColor);
          $(this).html(calendar.cellLetter);
        });
      }
    });
  },

  /**
   * Add eventlisteners to the date row. When clicking on a date, it colors the whole column as a holiday/red day.
   */
  addDateCellListener : function(){
    console.info("[FUNCTION]: Entering calendar.addDateCellListener()");
    var i = 0;
    
    // Find each cell in the date row and assign an eventlistener to it.
    $("#dateRow").find("td").each(function(index) {
      // Do not color the first cell in the row (where the 'Date' and names are).
      if(index > 0) {
        // When the cell is clicked.
        $(this).on('click', function() {
          // Go through all name rows and color the cell in the same column.
          for(i = 0; i < calendar.nameRows.length; i++) {
            var cellBgColor = calendar.nameRows[i].cells[index].style.background;
            if(cellBgColor == "") {
              calendar.nameRows[i].cells[index].style.background = "olive";
              calendar.nameRows[i].cells[index].innerHTML = "H";
            } else { 
              calendar.nameRows[i].cells[index].style.background = "";
              calendar.nameRows[i].cells[index].innerHTML = "";
            }
          } 
        }); // $(this).on('click', function() {

        // When hovering over days, change the cursor to a pointer so it's more clear to the user that it is clickable
        $(this).on('mouseenter', function() {
          $(this).css("cursor", "pointer");
        }); // $(this).on('mouseenter', function() {
      }
    });
  },

  /**
   * Add a extra name to the calendar.
   */
  addName : function() {
    console.info("[FUNCTION]: Entering calendar.addName()");
    var cell = null;
    var nameToAdd = document.getElementById("add_destroy_name").value;
    
    // Add default name if none was given.
    if(nameToAdd == ""){
      nameToAdd = "Name " + (this.names.length + 1);
    }

    // Add the name to the name list.
    this.names.push(nameToAdd);
    // Create a new row and for the new name.
    this.nameRows.push(this.tableObj.insertRow(-1));
    this.nameRows[this.nameRows.length - 1].className = this.nameRowClassName;
    cell = this.nameRows[this.nameRows.length - 1].insertCell(0);
    cell.innerHTML = nameToAdd;
    
    // Create new cells in the row minus the first cell.
    for(j = 0; j < this.dates.length - 1; j++) {
      cell = this.nameRows[this.nameRows.length - 1].insertCell(-1);
    }
    
    this.styleCells();
    this.addCellListener();
    
    console.log("[LOG]: Created: " + nameToAdd);
    console.log("[LOG]: Nr of names: " + this.names.length);
    console.log("[LOG]: Names: " + this.names);        
  },

  /**
   * Remove a name from the calendar.
   */
  destroyName : function() {
    console.info("[FUNCTION]: Entering calendar.destroyName()");
    var nameIndex = -1;
    var nameToDestroy = document.getElementById("add_destroy_name").value;

    // Search the name array for name to destroy.
    nameIndex = this.names.indexOf(nameToDestroy);

    // If a match was found.
    if(nameIndex != -1){
      // Remove the row from the calendar and remove the name from the name list.
      this.nameRows[nameIndex].parentNode.removeChild(this.nameRows[nameIndex]);
      this.nameRows.splice(nameIndex, 1);
      this.names.splice(nameIndex, 1);
      
      console.log("[LOG]: DESTROYED " + nameToDestroy);
      console.log("[LOG]: Nr of names: " + this.names.length);
      console.log("[LOG]: Names: " + this.names);
    } else {
      console.log("[LOG]: No such name in calendar: " + nameToDestroy);
    }
  },

  /**
   *  This flag will make sure no name rows are cleared when changing months for the generated calendar.
   *  This enables changing the months when for a calendar, without having to manually rewrite the names.
   *
   *  Called when pressing the "I just wanna change months" button.
   */
  iJustWannaChangeMonths : function () {
    console.info("[FUNCTION]: Entering calendar.iJustWannaChangeMonths()");
    // The value of justChangeMonths enum should only be changed from this function.
    // TODO: How to make sure this isn't used elsewhere? Maybe reset it in the reset() function somehow?

    this.justChangeMonths = true;
    this.generate();
    this.justChangeMonths = false;

    console.log("[LOG]: Changing months for currently generated calendar");
  }
};

/**
 * Get a random hex color as a string, e.g. "#ffffff".
 */
function randomColor() {
  return "#"+((1<<24)*Math.random()|0).toString(16) ;
}

/**
 * Get the number of days in selected month and year.
 */
function daysInMonth(year, month) {
  var d = new Date(year, month + 1, 0);
  return d.getDate();
}

$(document).ready(function() {
  // Check what browser is used
  if(typeof window.chrome != "object") {
    window.alert("Calendar Generator is only fully tested in Google Chrome.\nMay not work properly with other browsers.");
  }
    
  // Initiate the calendar object.
  calendar.init();

  // When clicking on the 'Generate' or 'Edit' button, scroll down to the calendar.
  $(".scroll").on('click', function(event) {
      $('html, body').animate({
        scrollTop: $("#calendarTable").offset().top
      }, 800, function(){
      });
  });

  /* Color picker colors has 'fixed' attribute to be able to expand
  * it to the right. Set each colors top value so we can see it.
  */
    $(".color").each(function(index) {
        $(this).css("top", index * 2 + "em");

        // Select red color from the start
        if(index == 1) {
          selectColor(1, this);
        }
    });


}); // $(document).ready(function() {


/**
 * Displays the 'copy' button so the calendar code can be copied.
 */
function displayCopyButton() {
  let copyButton = document.getElementById("copyButton");
  copyButton.style.display = "block";
}

/**
 * Displays buttons to add or delete a name from the calendar.
 */
function displayConfigureNames() {
  let div = document.getElementById("configureNames");
  div.style.display = "flex";
}

/**
 * Displays useful help texts besides the elements on the page.
 */
function displayHelp() {
  let helpTexts = document.getElementsByClassName("help_text");
  
  helpTexts[0].style.top = $("#editPastedCalendar").offset().top + "px";
  helpTexts[1].style.top = $("#edit_button").offset().top + "px";
  helpTexts[2].style.top = $("#startMonth").offset().top + "px";
  helpTexts[3].style.top = $("#generate").offset().top + "px";
  helpTexts[4].style.top = $("#configureNames").offset().top + "px";
  
  for(i = 0; i < helpTexts.length; i++){
    helpTexts[i].style.display = helpTexts[i].style.display == "block" ? "none" : "block";
  }
  
  if( $("#configureNames").css("display") != "flex" || helpTexts[0].style.display == "none"){
    helpTexts[4].style.display = "none";
  }
  
  let contact = document.getElementById("contact");
  contact.style.display = contact.style.display == "block" ? "none" : "block";

  // Displays the information below the generated/pasted calendar for extra help.
  let infoContainer = document.getElementById("info");
  infoContainer.style.display = infoContainer.style.display == "block" ? "none" : "block";
}

/**
 * Displays the 'copy' button so the calendar code can be copied.
 */
function selectColor(color, obj) {
  calendar.paletteColor = calendar.paletteColorArray[color];
  calendar.cellLetter = calendar.cellLetterArray[color];
  
  // Expand the color div and colorText span that was pressed and retract the other colors.
  $('.color').css('width','4em');
  $('.colorText').css('right','4.5em');

  obj.style.width = "7em";
  $( obj ).find( '.colorText' ).css("right", "7.5em");
  console.log("Picked color: " + calendar.paletteColor);
}

function fadeOutnIn(obj, speed) {
  obj.animate({opacity:0.3}, speed);
  obj.animate({opacity:1}, speed);
}