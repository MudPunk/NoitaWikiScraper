const requestPromise= require("request-promise");
const cheerio= require("cheerio");
const fs = require('fs');

/*
# References

## Helpful links

* https://stackoverflow.com/questions/44498314/promise-resolve-returning-2-arrays-one-undefined
    * Return object of arrays from promise

*/

module.exports = {

    scrapePrimaryUrl: async function(urlToScrape, debug) {

        var spellData = [];
        var spellHREF = [];

        const promise = new Promise (
            (resolve) => {
                requestPromise(
                    urlToScrape, (error, response, html) => {
                        if(!error && response.statusCode==200) {
                            const $= cheerio.load(html);
                            var http_or_https = (urlToScrape.indexOf("https") == 0 ? "https:" : "http:" );
                               
                            $("tr").each((i, data) => {
                                var csvDataRow = $(data).text().replaceAll('\n', ',');

                                if(csvDataRow.toString().includes('Spread Modifier (DEG)')) { //just looking for anything unique to ID the header rows. Not fully sure how to just see if it's the <th tag.

                                } else {
                                    spellData.push(csvDataRow.substring(1,csvDataRow.length-1));
                                    var hrefBase = $("a").attr("href");
                                    var href = ($(data).find("td > a").attr("href") === undefined ? "" : $(data).find("td > a").attr("href"));
                                    spellHREF.push(http_or_https + hrefBase + href);
                                    
                                }
                            }) 
                            if (debug == 1) {
                                console.log("spellHREF: " + spellHREF)
                                console.log("spellData: " + spellData)
                            }                            
                            resolve({spellHREF_Return: spellHREF, spellData_Return: spellData}); //returns object that contains the two arrays
                        } //if(!error && response.statusCode==200) {
                    }
                ) //requestPromise
            }
        );

        const spellHREFArrReturn = await promise;
        return spellHREFArrReturn;
    },

    scrapeSecondaryUrl: async function(urlToScrape, debug) {

        spellDamageLabelArr = [];
        spellDamageValueArr = [];
        spellInfoArr = [];

        const promise = new Promise (
            (resolve) => {
                requestPromise(
                    urlToScrape, (error, response, html) => {
                        if(!error && response.statusCode==200) {
                            const $= cheerio.load(html);
                            var regExPattern = /^(damage).*(.*[^0-9]$)/; //find strings that end with 0-9, and ignore them. ^ asserts position at start of a line. $ asserts position at the end of a line.

                            var spellDivArr = [];
                            spellDivArr = $('div.pi-item.pi-data').get().map(x1 => $(x1).attr('data-source')).filter(e1 => regExPattern.test(e1));
                            $("div.pi-item.pi-data").each(
                                (i, data) => {
                                    var spellDamageLabel = "";
                                    var spellDamageValue = "";
                                    var damageType = "";

                                    damageType = $(data).get().map(x2 => $(x2).attr('data-source'));
                                    for (var xxx = 0; xxx<spellDivArr.length; xxx++) {
                                        if (spellDivArr[xxx] == damageType) {
                                            spellDamageLabel = $(data).find(".pi-data-label").clone().children().remove().end().text().trim();
                                            spellDamageValue = $(data).find(".pi-data-value").clone().children().remove().end().text().trim();

                                            spellDamageLabelArr.push(spellDamageLabel);
                                            spellDamageValueArr.push(spellDamageValue);
                                            spellInfoArr.push(spellDamageLabel + "," + spellDamageValue);
                                            if (debug==1) console.log(spellDamageLabel + "," + spellDamageValue);
                                        }
                                    }
                                } // (i, data)
                            );
                            if (debug == 1) {
                                console.log("spellDamageLabelArr: " + spellDamageLabelArr)
                                console.log("spellDamageValueArr: " + spellDamageValueArr)
                            }
                            resolve({spellDamageLabelArr_Return: spellDamageLabelArr, spellDamageValueArr_Return: spellDamageValueArr});
                        } //if(!error && response.statusCode==200)
                    }
                ) //requestPromise
            }
        );
        const spellInfoArrReturn = await promise;
        return spellInfoArrReturn;
    },

    scrapePierceText: async function(urlToScrape, debug) { 
        var csvDataRow = '';
        var textWithPiercing = '';
        
        const promise = new Promise (
            (resolve) => {
            requestPromise(urlToScrape, (error, response, html) => {
                if(!error && response.statusCode==200) {
                    const $= cheerio.load(html);
        
                    $("ul").each((i, data) => {     
                        csvDataRow = $(data).find("li").clone().children().remove().end().text().trim();
                        if (csvDataRow.indexOf("piercing") > 0 || csvDataRow.indexOf("piercing") > 0) {
                            textWithPiercing = csvDataRow;                      
                        }                
                    }) 
                    if (debug==1) console.log('textWithPiercing: ' + textWithPiercing)
                    resolve(textWithPiercing);
                } // if(!error && response.statusCode==200)
            })
        }); 
        const returnValReturn = await promise;
        return returnValReturn;
    },

    scrapeINIT: async function(urlToScrape, debug) {

        fs.truncate('NoitaSpells.csv', () => { });
        fs.appendFile('NoitaSpells.csv', 'Spell,Uses,Mana drain,Radius,Spread (DEG),Speed,Lifetime,Cast delay (s),Recharge time (s),Spread Modifier (DEG),Speed modifier,Lifetime Modifier,Bounces,Critical chance (%),Damage (Projectile), Damage (Explosion), Damage (Melee), Damage (Electric), Damage (Fire), Damage (Slice), Damage (Ice), Damage (Drill), Has Piercing (subject to review)'+'\r\n', 
            function (err) {
                if (err) throw err;
                else console.log('Spells CSV cleared, Header reapplied.');
            });

        scrapePrimaryUrlArr = await module.exports.scrapePrimaryUrl(urlToScrape, debug);
        
        var scrapePierceTextText = '';

        var dmgString = 'Damage (Projectile),Damage (Explosion),Damage (Melee),Damage (Electric),Damage (Fire),Damage (Slice),Damage (Ice),Damage (Drill)';
        
        for(var x = 0; x < scrapePrimaryUrlArr.spellHREF_Return.length; x++) {

            scrapeSecondaryUrlArr = await module.exports.scrapeSecondaryUrl(scrapePrimaryUrlArr.spellHREF_Return[x], debug);
            scrapePierceTextText = await module.exports.scrapePierceText(scrapePrimaryUrlArr.spellHREF_Return[x], debug);

            dmgString = 'Damage (Projectile),Damage (Explosion),Damage (Melee),Damage (Electric),Damage (Fire),Damage (Slice),Damage (Ice),Damage (Drill)';
            for (var dmgValIndex=0; dmgValIndex<scrapeSecondaryUrlArr.spellDamageLabelArr_Return.length;dmgValIndex++) {
                
                if(scrapeSecondaryUrlArr.spellDamageLabelArr_Return[dmgValIndex]=='Damage (Projectile)')
                    dmgString = dmgString.replace('Damage (Projectile)', scrapeSecondaryUrlArr.spellDamageValueArr_Return[dmgValIndex]);

                if(scrapeSecondaryUrlArr.spellDamageLabelArr_Return[dmgValIndex]=='Damage (Explosion)')
                    dmgString = dmgString.replace('Damage (Explosion)', scrapeSecondaryUrlArr.spellDamageValueArr_Return[dmgValIndex]);

                if(scrapeSecondaryUrlArr.spellDamageLabelArr_Return[dmgValIndex]=='Damage (Melee)')
                    dmgString = dmgString.replace('Damage (Melee)', scrapeSecondaryUrlArr.spellDamageValueArr_Return[dmgValIndex]);

                if(scrapeSecondaryUrlArr.spellDamageLabelArr_Return[dmgValIndex]=='Damage (Electric)')
                    dmgString = dmgString.replace('Damage (Electric)', scrapeSecondaryUrlArr.spellDamageValueArr_Return[dmgValIndex]);

                if(scrapeSecondaryUrlArr.spellDamageLabelArr_Return[dmgValIndex]=='Damage (Fire)')
                    dmgString = dmgString.replace('Damage (Fire)', scrapeSecondaryUrlArr.spellDamageValueArr_Return[dmgValIndex]);

                if(scrapeSecondaryUrlArr.spellDamageLabelArr_Return[dmgValIndex]=='Damage (Slice)')
                    dmgString = dmgString.replace('Damage (Slice)', scrapeSecondaryUrlArr.spellDamageValueArr_Return[dmgValIndex]);

                if(scrapeSecondaryUrlArr.spellDamageLabelArr_Return[dmgValIndex]=='Damage (Ice)')
                    dmgString = dmgString.replace('Damage (Ice)', scrapeSecondaryUrlArr.spellDamageValueArr_Return[dmgValIndex]);

                if(scrapeSecondaryUrlArr.spellDamageLabelArr_Return[dmgValIndex]=='Damage (Drill)')
                    dmgString = dmgString.replace('Damage (Drill)', scrapeSecondaryUrlArr.spellDamageValueArr_Return[dmgValIndex]);
            
            }
    
            dmgString = dmgString.replace('Damage (Projectile)', '');
            dmgString = dmgString.replace('Damage (Explosion)', '');
            dmgString = dmgString.replace('Damage (Melee)', '');
            dmgString = dmgString.replace('Damage (Electric)', '');
            dmgString = dmgString.replace('Damage (Fire)', '');
            dmgString = dmgString.replace('Damage (Fire)', '');
            dmgString = dmgString.replace('Damage (Slice)', '');
            dmgString = dmgString.replace('Damage (Ice)', '');
            dmgString = dmgString.replace('Damage (Drill)', '');
            
            fs.appendFile('NoitaSpells.csv', scrapePrimaryUrlArr.spellData_Return[x] + ',' + dmgString + ',' + (scrapePierceTextText.length > 0 ? 'True' : 'False') + '\r\n', function (err) { if (err) throw err; /*console.log('Saved!');*/ });
        }
    }
};
