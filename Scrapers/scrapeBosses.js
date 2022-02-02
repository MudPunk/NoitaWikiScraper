const requestPromise= require("request-promise");
const cheerio= require("cheerio");
const fs = require('fs');
const { Console } = require("console");
/*
# References

## Helpful links

* https://stackoverflow.com/questions/44498314/promise-resolve-returning-2-arrays-one-undefined
    * Return object of arrays from promise

*/

module.exports = {

    scrapePrimaryUrl: async function(urlToScrape, debug) {

        var bossName = [];
        var bossHREF = [];
        var possibleDataFound = "";

        const promise = new Promise (
            (resolve) => {
                requestPromise(
                    urlToScrape, (error, response, html) => {
                        if(!error && response.statusCode==200) {
                            const $= cheerio.load(html);
                            var http_or_https = (urlToScrape.indexOf("https") == 0 ? "https:" : "http:" );

                            $("div#mw-customcollapsible-spoiler1 > div.mw-collapsible-content.spoiler-shown > div").each((i, data) => {
                                possibleDataFound = $(data).text().trim();
                                var href = ($(data).find("div > a").attr("href") === undefined ? "" : $(data).find("div > a").attr("href")).trim();
                                var hrefBase = $("div > a").attr("href");

                                if (possibleDataFound.length > 0) {
                                    bossName.push(possibleDataFound);                                 
                                }

                                if (href.length > 0) {
                                    bossHREF.push(http_or_https + hrefBase + href);
                                }
                                
                            })

                            if (debug == 1) {
                                console.log("bossHREF: " + bossHREF)
                                console.log("bossName: " + bossName)
                            }
                            resolve({bossName_Return: bossName, bossHREF_Return: bossHREF}); //returns object that contains the two arrays
                        } //if(!error && response.statusCode==200) {
                    }
                ) //requestPromise
            }
        );

        const spellHREFArrReturn = await promise;
        return spellHREFArrReturn;
    },

    scrapeSecondaryUrl: async function(urlToScrape, debug) {

        var damageModifierValue = [];
        var damageModifierLabel = [];        
        var damageMultiplier = ["damage mult melee", "damage mult drill", "damage mult projectile", "damage mult slice", "damage mult fire", "damage mult ice", "damage mult electricity", "damage mult explosion", "damage mult radioactive"];

        const promise = new Promise (
            (resolve) => {
                requestPromise(
                    urlToScrape, (error, response, html) => {
                        if(!error && response.statusCode==200) {
                            const $= cheerio.load(html);                            
                            
                            if (debug==1) console.log("\n\n******************************************************************************************\n\n\n")
                            if (debug==1) console.log("urlToScrape: " + urlToScrape);
                            $("aside > section > div > section > section").each(
                                (i, data) => {
                                    
                                    const h3 = $(data).find('section > h3').map((i, data) => $(data).text()).get()
                                    const div = $(data).find('section > div').map((i, data) => $(data).text().replace('x','')).get()

                                    if ( damageMultiplier.includes($(data).find('section > h3').attr("data-source"))) {
                                         
                                        damageModifierLabel.push(h3)//[x]);
                                         if (debug==1) console.log("h3  > data-source - True: " + h3);

                                    } else {
                                        
                                         if (debug==1) console.log("h3  > data-source - False: " + h3);

                                    }  

                                    if ( damageMultiplier.includes($(data).find('section > div').attr("data-source"))) {
                                         
                                        damageModifierValue.push(div)//[x]);
                                         if (debug==1) console.log("div > data-source - True: " + div);

                                    } else {                                         
                                         if (debug==1) console.log("div > data-source - False: " + div);
                                    }                                  
                                } // (i, data)
                               
                            );                        
                            resolve({damageModifierValue_Return: damageModifierValue, damageModifierLabel_Return: damageModifierLabel});
                        } //if(!error && response.statusCode==200)
                    }
                ) //requestPromise
            }
        );
        const spellInfoArrReturn = await promise;
        return spellInfoArrReturn;
    },

    scrapeINIT: async function(urlToScrape, debug) {

        fs.truncate('NoitaBosses.csv', () => { });
        fs.appendFile('NoitaBosses.csv', 'Real Name, Common Name, Melee,Drill,Proj.,Slice,Fire,Ice,Elec.,Expl.,Tox.'+'\r\n', 
            function (err) {
                if (err) throw err;
                else console.log('Bosses CSV cleared, Header reapplied.');
            });        

        var scrapePrimaryUrlArr = await module.exports.scrapePrimaryUrl(urlToScrape, debug);
        
        for(var x = 0; x < scrapePrimaryUrlArr.bossHREF_Return.length; x++) {

            var scrapeSecondaryUrlArr = await module.exports.scrapeSecondaryUrl(scrapePrimaryUrlArr.bossHREF_Return[x], debug);
            
            if (debug == 1) console.log("Boss Name: " + scrapePrimaryUrlArr.bossName_Return[x].replace('\n',','));
            if (debug == 1) console.log("Damage Modifier Label: " + scrapeSecondaryUrlArr.damageModifierLabel_Return);
            if (debug == 1) console.log("Damage Modifier Value: " + scrapeSecondaryUrlArr.damageModifierValue_Return);
   
            fs.appendFile('NoitaBosses.csv', scrapePrimaryUrlArr.bossName_Return[x].replace('\n',',') + ',' + scrapeSecondaryUrlArr.damageModifierValue_Return + '\r\n', function (err) { if (err) throw err; /*console.log('Saved!');*/ });

        }
    }
};
