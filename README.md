# CalendarGenerator 2.0

Tool to generate a calendar (html table) for a chosen number of people so that absence can be filled in for specific days.
The calendar contains months, weeks, days and the chosen names.

![alt text](https://user-images.githubusercontent.com/34168761/33567842-cbb877d6-d924-11e7-90fc-75f669364bcb.png)
**X** with ![#FF0000](https://placehold.it/15/FF0000/000000?text=+) Red background = On vacation/Absent </br>
**X** with ![#FFFF00](https://placehold.it/15/FFFF00/000000?text=+) Yellow background = On vacation/Absent part of day  </br>
**P** with ![#0000FF](https://placehold.it/15/0000FF/000000?text=+) Blue background = Parental leave  </br>
**H** with ![##808000](https://placehold.it/15/808000/000000?text=+) Olive background = Public Holiday  </br>

## How to
Download the CalendarGenerator **folder**. </br>
**Unzip** that folder!. </br>
Open the **index.html** file in **Google Chrome** (not tested with other browsers). </br>
Additional help can be displayed by pressing the “Help” button in the top left corner. </br>

Appearance of the main panel:
![alt text](https://user-images.githubusercontent.com/34168761/33568562-243da988-d927-11e7-83fd-614d44175860.png)

## Versions
**2017-10-18 Version 1.0**
-	Initial functionality.

**2017-10-29 Version 1.1**
-	Changed table cellpadding.
-	When pasting and editing an existing table, the table gets styled in case the style  has changed in later versions.

**2017-11-17 Version 1.2**
-	Coloring cells is now done with first selecting a color with the color picker. Choose a color to color the cells with.
-	You can now color cells with clicking and dragging the mouse over the them with the selected color (also just clicking once). Multiple clicks are no longer necessary and will not change the color differently from the selected one.
-	Able to color a whole column olive (holiday) by clicking on the above date. Click again on the date to un-color the column.
-	When clicked, cells is now also filled with a letter like it was when using only the wiki syntax for a calendar. This hopefully helps represent what kind of absence/leave it is easier.

**2017-11-20 Version 1.3**
-	Now you can add or delete members from an existing calendar (or newly generated, same thing really) by name! Add or delete your problems away!
-	Can no longer color name cells in the calendar a color and fill it with a letter! It’s idiot proof I promise (I double dare you)!
-	Now the generator is in separate files (.html, .css, .js) to help structure stuff and get a little better overview! That means you have to download the whole folder in order for it to work! 

**2017-11-22 Version 1.3.1**
-	Minor code cleanup.
-	Fixed bug where you couldn’t edit copied and pasted calendars.
-	Fixed bug where you couldn’t add new or delete members from a copied and pasted calendar.

**2017-11-28 Version 2.0**
-	Major code change, meaning that this version is not compatible with previous calendar versions. Earlier version will be removed shortly (probably Jan 2018).
-	Cleaned up code and added (hopefully) more informative log prints.
-	Now the generator automatically removes text that isn’t inside the <table></table> tags when editing an existing calendar. So now you can paste any text (like the whole wiki page text) as long as it contains the calendar and only get the calendar code back.

## TODOs
-	Cross browser support (only tested in Chrome as of v2.0)
-	Be able to generate wikitable code as well?
-	Automatically color Swedish public holidays olive.
-	Be able to color a whole month or week a selected color. First select the name and then click on the month or week to color it.
-	Check for version when pasting a calendar.
-	Structure/cleanup html and css code

<!-- ![alt text](https://user-images.githubusercontent.com/34168761/33568622-5d65fe36-d927-11e7-8a0a-76206eba32b3.png) -->
