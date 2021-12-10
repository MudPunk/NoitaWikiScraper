const request= require("request-promise")
const cheerio= require("cheerio");
const uri = "https://noita.fandom.com/wiki/Spell_Information_Table"

function scrapeUrl (urlToScrape) {
    request(urlToScrape, (error, response, html) => {
        if(!error && response.statusCode==200) {
            const $= cheerio.load(html);
            var spellData = [];
            var spellHref = [];
            var http_or_https = (uri.indexOf("https") == 0 ? "https" : "http" );
            const datarow= $(".cargoTable");
            const output = datarow.find("th").text();
            $("tr").each((i, data) => {
                spellData.push($(data).text());
                
                var hrefBase = $("a").attr("href");
                var href = ($(data).find("td > a").attr("href") === undefined ? "" : $(data).find("td > a").attr("href"));
                spellHref.push(http_or_https + hrefBase + href);
                console.log(http_or_https + hrefBase + href);
            }) 

            for (var i = 0; i<spellData.length; i++) {
                if(spellData[i].indexOf("\n") == 0) //Remove pre-appended \n's that seem to be added for some reason.
                spellData[i] = spellData[i].replace("\n", "");
                spellData[i] = spellData[i].replaceAll("\n", ",");
                console.log(spellData[i]);
            }
 
            // for (var i = 0; i<spellHref.length; i++) {
            //     scrapeSubUrl(spellHref[i]);
            // }      
            //console.dir(spellData, {'maxArrayLength': null})      
            //console.log(spellData);
            //console.dir(spellHref, {'maxArrayLength': null})    
            //console.log(spellHref);
            

        }
    });
}

// function scrapeSubUrl (subUrlToScrape) {
//     request(subUrlToScrape, (error, response, html) => {
//         if(!error && response.statusCode==200) {
//             const $= cheerio.load(html);
//             var spellData = [];
//             var spellHref = [];
//             var http_or_https = (uri.indexOf("https") == 0 ? "https" : "http" );
//             const datarow= $(".pi_item.pi_data");

//             $("div").each((i, data) => {
//                 spellData.push($(data).text());

//                 var hrefBase = $("a").attr("href");
//                 var href = ($(data).find("td > a").attr("href") === undefined ? "" : $(data).find("td > a").attr("href"));
//                 spellHref.push(http_or_https + hrefBase + href);
//             }) 

//             for (var i = 0; i<spellData.length; i++) {
//                 if(spellData[i].indexOf("\n") == 0) //Remove pre-appended \n's that seem to be added for some reason.
//                 spellData[i] = spellData[i].replace("\n", "");
//                 spellData[i] = spellData[i].replaceAll("\n", ",");
//             }
            
//             console.log(spellData);
//             console.log(spellHref);
            

//         }
//     });
// }

scrapeUrl(uri);