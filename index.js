const youPromiseMe = require("./Scrapers/scrapeSpells.js");
const somePromiseYouMade = require("./Scrapers/scrapeBosses.js");

var Parameter1 = '';
var urlToBosses = 'https://noita.fandom.com/wiki/Enemies'

var urlToSpells = 'https://noita.fandom.com/wiki/Spell_Information_Table'

var debug = true;
var helpFlagged = false;

process.argv.forEach(function (val, index, array) {

    if ((array.length==2 && index==1) || (index==2 && array.length==3 && (['-h', '-help', 'help', 'usage', '-usage'].indexOf(val) >= 0))) {
        helpFlagged = true;
        console.log("Usage: Supply 2 parameters\n1: What section to scrape: 'Bosses', 'Spells', or 'Enemies'\n2: Debug Flag of 1 or 0.")
    }

    if (helpFlagged == false) {
        if (index == 2) {
            Parameter1 = val;          
        }
        if (index = 3) {
            debug = val;
        }    
    }
});

if (helpFlagged == false) {
    if (Parameter1 == 'Spells')
        youPromiseMe.scrapeINIT(urlToSpells, debug);
    else if (Parameter1 == 'Bosses')
        somePromiseYouMade.scrapeINIT(urlToBosses, debug);
    else {
        console.log("Invalid Input: 1st Parameter must be 'Bosses', 'Spells', or 'Enemies'")
    }
}