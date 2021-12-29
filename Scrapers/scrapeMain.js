const requestPromise= require("request-promise");
const cheerio= require("cheerio");
const fastcsv = require('fast-csv');
const fs = require('fs');
const fastcsv2 = require('fast-csv');
var fs2 = require('fs');

module.exports = {
    
    scrapeUrl: function (urlToScrape) {
        requestPromise(urlToScrape, (error, response, html) => {
            if(!error && response.statusCode==200) {
                const $= cheerio.load(html);
                var spellData = [];
                var spellHREF = [];
                var http_or_https = (urlToScrape.indexOf("https") == 0 ? "https:" : "http:" );
                const datarow= $(".cargoTable");                
                
                //clear second file contents before appending.
                fs2.truncate('out2.csv', () => { });
                fs2.appendFile('out2.csv', 'Damage (Projectile), Damage (Explosion), Damage (Melee), Damage (Electric), Damage (Fire), Damage (Slice), Damage (Ice), Damage (Drill)'+'\r\n', function (err) {
                    if (err) throw err;
                    //console.log('Saved!');
                  });

                $("tr").each((i, data) => {     
                    var csvDataRow = $(data).text().replaceAll('\n', ',');

                    //console.log(datarow.toString());
                    if(csvDataRow.toString().includes('Spread Modifier (DEG)')) { //just looking for anything unique to ID the header rows. Not fully sure how to just see if it's the <th tag.
                        spellData.push(csvDataRow.substring(0,csvDataRow.length-1));
                    } else {
                        spellData.push(csvDataRow.substring(1,csvDataRow.length-1));
                    }

                    var hrefBase = $("a").attr("href");
                    var href = ($(data).find("td > a").attr("href") === undefined ? "" : $(data).find("td > a").attr("href"));
                    spellHREF.push(http_or_https + hrefBase + href);
                    
                    module.exports.scrapeSubUrl(http_or_https + hrefBase + href, href.replace("/wiki/", ""));
                    //console.log(href);
                }) 

                //console.log(spellData.length);
                //console.log(spellHREF);     
                
                        const ws = fs.createWriteStream("out.csv");
                        fastcsv.write(spellData, { headers: false, delimiter: '' }).pipe(ws);
            }
        });
        
    }, // end scrapeUrl

    scrapeSubUrl: function (urlToScrape, baseSpellName) {

        requestPromise(urlToScrape, (error, response, html) => {
            if(!error && response.statusCode==200) {
                const $= cheerio.load(html);
                var spellDamageLabelArr = [];
                var spellDamageValueArr = [];
                var spellInfoArr = [];
                var http_or_https = (urlToScrape.indexOf("https") == 0 ? "https" : "http" );
                const datarow= $("div.wds-tab__content.wds-is-current");
               
                var regExPattern = /^(damage).*(.*[^0-9]$)/; //find strings that end with 0-9, and ignore them. ^ asserts position at start of a line. $ asserts position at the end of a line.

                var spellDivArr = [];
                spellDivArr = $('div.pi-item.pi-data').get().map(x => $(x).attr('data-source')).filter(e => regExPattern.test(e));
                //console.log("Spell DIV Array Results: " + spellDivArr);

                $("div.pi-item.pi-data").each((i, data) => {
                    var spellDamageLabel = "";
                    var spellDamageValue = "";
                    var damageType = "";

                    damageType = $(data).get().map(x => $(x).attr('data-source'));
                    
                    for (var x = 0; x<spellDivArr.length; x++) {
                        if (spellDivArr[x] == damageType) {
                            
                            spellDamageLabel = $(data).find(".pi-data-label").clone().children().remove().end().text().trim();
                            spellDamageValue = $(data).find(".pi-data-value").clone().children().remove().end().text().trim();

                            spellDamageLabelArr.push(spellDamageLabel);
                            spellDamageValueArr.push(spellDamageValue);                            
                            spellInfoArr.push(spellDamageLabel + "," + spellDamageValue);

                            //console.log(x + ": Match Check for: " + baseSpellName + " Damage Type to Div: " + damageType + " is found : " + spellDivArr[x] + " " + spellDamageLabel + " " + spellDamageValue);
                        }
                     }

                })   
                
                //console.log()
                //const ws2 = fs2.appendFile("out2.csv");
                //fastcsv2.write(spellInfoArr, { flag: 'a', headers: false, delimiter: '' }).pipe(ws2);

                if(spellInfoArr.toString().length > 10)
                for (var x=0; x<spellDamageLabelArr.length;x++) {
                    console.log(spellDamageLabelArr[x]);
                    //Damage (Projectile)
                    if(spellDamageLabelArr[x]=='Damage (Projectile)')
                        fs2.appendFile('out2.csv', spellDamageValueArr[x] + ',', function (err) { if (err) throw err; /*console.log('Saved!');*/ });
                    else
                        fs2.appendFile('out2.csv', ',', function (err) { if (err) throw err; /*console.log('Saved!');*/ });                    
                    //Damage (Explosion)
                    if(spellDamageLabelArr[x]=='Damage (Explosion)')
                        fs2.appendFile('out2.csv', spellDamageValueArr[x] + ',', function (err) { if (err) throw err; /*console.log('Saved!');*/ });
                    else
                        fs2.appendFile('out2.csv', ',', function (err) { if (err) throw err; /*console.log('Saved!');*/ });                    
                    //Damage (Melee)
                    if(spellDamageLabelArr[x]=='Damage (Melee)')
                        fs2.appendFile('out2.csv', spellDamageValueArr[x] + ',', function (err) { if (err) throw err; /*console.log('Saved!');*/ });
                    else
                        fs2.appendFile('out2.csv', ',', function (err) { if (err) throw err; /*console.log('Saved!');*/ });                    
                    //Damage (Electric)
                    if(spellDamageLabelArr[x]=='Damage (Electric)')
                        fs2.appendFile('out2.csv', spellDamageValueArr[x] + ',', function (err) { if (err) throw err; /*console.log('Saved!');*/ });
                    else
                        fs2.appendFile('out2.csv', ',', function (err) { if (err) throw err; /*console.log('Saved!');*/ });                    
                    //Damage (Fire)
                    if(spellDamageLabelArr[x]=='Damage (Fire)')
                        fs2.appendFile('out2.csv', spellDamageValueArr[x] + ',', function (err) { if (err) throw err; /*console.log('Saved!');*/ });
                    else
                        fs2.appendFile('out2.csv', ',', function (err) { if (err) throw err; /*console.log('Saved!');*/ });                    
                    //Damage (Slice)
                    if(spellDamageLabelArr[x]=='Damage (Slice)')
                        fs2.appendFile('out2.csv', spellDamageValueArr[x] + ',', function (err) { if (err) throw err; /*console.log('Saved!');*/ });
                    else
                        fs2.appendFile('out2.csv', ',', function (err) { if (err) throw err; /*console.log('Saved!');*/ });                    
                    //Damage (Ice)
                    if(spellDamageLabelArr[x]=='Damage (Ice)')
                        fs2.appendFile('out2.csv', spellDamageValueArr[x] + ',', function (err) { if (err) throw err; /*console.log('Saved!');*/ });
                    else
                        fs2.appendFile('out2.csv', ',', function (err) { if (err) throw err; /*console.log('Saved!');*/ });     

                    //Damage (Drill)
                    if(spellDamageLabelArr[x]=='Damage (Drill)')
                        fs2.appendFile('out2.csv', spellDamageValueArr[x] + '\r\n', function (err) { if (err) throw err; /*console.log('Saved!');*/ });
                    else
                        fs2.appendFile('out2.csv', '\r\n', function (err) { if (err) throw err; /*console.log('Saved!');*/ });                         

                }

            }
        });
    }    // end scrapeSubUrl

}
    
