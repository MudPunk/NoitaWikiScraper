const requestPromise= require("request-promise");
const cheerio= require("cheerio");
const fs = require('fs');
fs.truncate('out.csv', () => { });
fs.appendFile('out.csv', 'Spell,Uses,Mana drain,Radius,Spread (DEG),Speed,Lifetime,Cast delay (s),Recharge time (s),Spread Modifier (DEG),Speed modifier,Lifetime Modifier,Bounces,Critical chance (%),Damage (Projectile), Damage (Explosion), Damage (Melee), Damage (Electric), Damage (Fire), Damage (Slice), Damage (Ice), Damage (Drill), Has Piercing (subject to review)'+'\r\n', 
    function (err) {
        if (err) throw err;
        else console.log('CSV cleared, Header reapplied.');
    });
var spellData = [];
var spellHREF = [];
var spellInfoArr = [];
var spellDamageLabelArr = [];
var spellDamageValueArr = [];

module.exports = {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

scrapePrimaryUrl: function(urlToScrape) { 

    requestPromise(urlToScrape, (error, response, html) => {
        if(!error && response.statusCode==200) {
            const $= cheerio.load(html);
            var http_or_https = (urlToScrape.indexOf("https") == 0 ? "https:" : "http:" );
            const datarow= $(".cargoTable");                

            $("tr").each((i, data) => {     
                var csvDataRow = $(data).text().replaceAll('\n', ',');

                if(csvDataRow.toString().includes('Spread Modifier (DEG)')) { //just looking for anything unique to ID the header rows. Not fully sure how to just see if it's the <th tag.
                    
                } else {
                    spellData.push(csvDataRow.substring(1,csvDataRow.length-1));
                    var hrefBase = $("a").attr("href");
                    var href = ($(data).find("td > a").attr("href") === undefined ? "" : $(data).find("td > a").attr("href"));
                    spellHREF.push(http_or_https + hrefBase + href);
                } 
            }) // end $("tr").each((i, data)                       
        
        } // end if(!error && response.statusCode==200) 
    }); // end requestPromise(urlToScrape, (error, response, html)    

    return new Promise(slowYourAssDown => {
            setTimeout(() => {slowYourAssDown(spellData);}, 300);
        }
    );  
}, 

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

scrapeSecondaryUrl: function(urlToScrape) { 
    
    spellDamageLabelArr = [];
    spellDamageValueArr = [];
    spellInfoArr = [];

    requestPromise(urlToScrape, (error, response, html) => {
        if(!error && response.statusCode==200) {
            const $= cheerio.load(html);

            var http_or_https = (urlToScrape.indexOf("https") == 0 ? "https" : "http" );
            const datarow= $("div.wds-tab__content.wds-is-current");
           
            var regExPattern = /^(damage).*(.*[^0-9]$)/; //find strings that end with 0-9, and ignore them. ^ asserts position at start of a line. $ asserts position at the end of a line.

            var spellDivArr = [];
            spellDivArr = $('div.pi-item.pi-data').get().map(x1 => $(x1).attr('data-source')).filter(e1 => regExPattern.test(e1));
            $("div.pi-item.pi-data").each((i, data) => {
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
                    }
                 }
            });      
        }
    });   

    return new Promise(slowYourAssDown => {
            setTimeout(() => {slowYourAssDown(spellDamageLabelArr);}, 300);
        }
    );  
},

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

scrapePierceText: function(urlToScrape) { 
    var csvDataRow = '';
    var returnVal = '';
    
    requestPromise(urlToScrape, (error, response, html) => {
        if(!error && response.statusCode==200) {
            const $= cheerio.load(html);
            var http_or_https = (urlToScrape.indexOf("https") == 0 ? "https:" : "http:" );
            const datarow= $("div.mw-parser-output");                

            $("ul").each((i, data) => {     
                csvDataRow = $(data).find("li").clone().children().remove().end().text().trim();
                if (csvDataRow.indexOf("piercing") > 0 || csvDataRow.indexOf("piercing") > 0) {
                    returnVal = csvDataRow;                    
                    console.log(csvDataRow);
                }                
            }) 
        } 
    }); 

    return new Promise(
        slowYourAssDown => {setTimeout(() => {slowYourAssDown(returnVal);}, 300);

        }
    );  
},

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

scrapeINIT: async function() {

    var scrapePrimaryUrlArr = [];
    
    scrapePrimaryUrlArr = await module.exports.scrapePrimaryUrl('https://noita.fandom.com/wiki/Spell_Information_Table');
    
    var dmgString = 'Damage (Projectile),Damage (Explosion),Damage (Melee),Damage (Electric),Damage (Fire),Damage (Slice),Damage (Ice),Damage (Drill)';
    
    var scrapeSecondaryUrlArr = [];
    
    var scrapePierceTextText = '';

    for (var primaryUrlIndex = 0; primaryUrlIndex < scrapePrimaryUrlArr.length; primaryUrlIndex++) {

        dmgString = 'Damage (Projectile),Damage (Explosion),Damage (Melee),Damage (Electric),Damage (Fire),Damage (Slice),Damage (Ice),Damage (Drill)';
        
        scrapeSecondaryUrlArr = await module.exports.scrapeSecondaryUrl(spellHREF[primaryUrlIndex]);
        scrapePierceTextText = await module.exports.scrapePierceText(spellHREF[primaryUrlIndex]);

        for (var dmgValIndex=0; dmgValIndex<scrapeSecondaryUrlArr.length;dmgValIndex++) {
            if(spellDamageLabelArr[dmgValIndex]=='Damage (Projectile)')
                dmgString = dmgString.replace('Damage (Projectile)', spellDamageValueArr[dmgValIndex]);
            if(spellDamageLabelArr[dmgValIndex]=='Damage (Explosion)')
                dmgString = dmgString.replace('Damage (Explosion)', spellDamageValueArr[dmgValIndex]);
            if(spellDamageLabelArr[dmgValIndex]=='Damage (Melee)')
                dmgString = dmgString.replace('Damage (Melee)', spellDamageValueArr[dmgValIndex]);
            if(spellDamageLabelArr[dmgValIndex]=='Damage (Electric)')
                dmgString = dmgString.replace('Damage (Electric)', spellDamageValueArr[dmgValIndex]);
            if(spellDamageLabelArr[dmgValIndex]=='Damage (Fire)')
                dmgString = dmgString.replace('Damage (Fire)', spellDamageValueArr[dmgValIndex]);
            if(spellDamageLabelArr[dmgValIndex]=='Damage (Slice)')
                dmgString = dmgString.replace('Damage (Slice)', spellDamageValueArr[dmgValIndex]);
            if(spellDamageLabelArr[dmgValIndex]=='Damage (Ice)')
                dmgString = dmgString.replace('Damage (Ice)', spellDamageValueArr[dmgValIndex]);
            if(spellDamageLabelArr[dmgValIndex]=='Damage (Drill)')
                dmgString = dmgString.replace('Damage (Drill)', spellDamageValueArr[dmgValIndex]);
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

        fs.appendFile('out.csv', scrapePrimaryUrlArr[primaryUrlIndex] + ',' + dmgString + ',' + (scrapePierceTextText.length > 0 ? 'True' : 'False') + '\r\n', function (err) { if (err) throw err; /*console.log('Saved!');*/ });
    }  
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   

};