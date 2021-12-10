const requestPromise= require("request-promise");
const cheerio= require("cheerio");

module.exports = {
    
    scrapeUrl: function (urlToScrape) {
        requestPromise(urlToScrape, (error, response, html) => {
            if(!error && response.statusCode==200) {
                const $= cheerio.load(html);
                var spellData = [];
                var spellHREF = [];
                var http_or_https = (urlToScrape.indexOf("https") == 0 ? "https:" : "http:" );
                const datarow= $(".cargoTable");
                const output = datarow.find("th").text();
                $("tr").each((i, data) => {
                    spellData.push($(data).text());
                    
                    var hrefBase = $("a").attr("href");
                    var href = ($(data).find("td > a").attr("href") === undefined ? "" : $(data).find("td > a").attr("href"));
                    spellHREF.push(http_or_https + hrefBase + href);
                    console.log(http_or_https + hrefBase + href);
                }) 

                for (var i = 0; i<spellData.length; i++) {
                    if(spellData[i].indexOf("\n") == 0) //Remove pre-appended \n's that seem to be added for some reason.
                    spellData[i] = spellData[i].replace("\n", "");
                    spellData[i] = spellData[i].replaceAll("\n", ",");
                    console.log(spellData[i]);
                }
    
                for (var i = 0; i<spellHref.length; i++) {
                    scrapeSubUrl(spellHref[i]);
                }
            }
        });
    }, // end scrapeUrl

    scrapeSubUrl: function (urlToScrape) {
        requestPromise(urlToScrape, (error, response, html) => {
            if(!error && response.statusCode==200) {
                const $= cheerio.load(html);
                var spellDamageLabelArr = [];
                var spellDamageValueArr = [];
                var http_or_https = (urlToScrape.indexOf("https") == 0 ? "https" : "http" );
                const datarow= $("div.wds-tab__content.wds-is-current");
               
                var regExPattern = /^(damage).*(.*[^0-9]$)/; //find strings that end with 0-9, and ignore them. ^ asserts position at start of a line. $ asserts position at the end of a line.

                var spellDivArr = [];
                spellDivArr = $('div.pi-item.pi-data').get().map(x => $(x).attr('data-source')).filter(e => regExPattern.test(e));
                console.log(spellDivArr);
                
                
                //console.log($('div.pi-item.pi-data').get().map(x => $(x).attr('data-source')));
                $("div.pi-item.pi-data").each((i, data) => {
                    //.clone().children().remove().end().text() is needed to pull just text and ignore the IMG tag inside the DIV.
                    
                    
                    //console.log($(data).find("div").attr("data-source"));
                    
                    var spellDamageLabel = "";
                    
                    spellDamageLabel = ($(data).find(".pi-data-label").clone().children().remove().end().text());
                    
                    var spellDamageValue = "";

                    spellDamageValue = ($(data).find(".pi-data-value").clone().children().remove().end().text());
                    
                    
                    //console.log($(data).get().map(x => $(x).attr('data-source')));
                    console.log(spellDamageLabel + " " + spellDamageValue);

                    if(spellDamageLabel.indexOf("Damage")>-1) {
                        spellDamageLabelArr.push(spellDamageLabel);
                    }
                    if(spellDamageLabel.indexOf("Damage")>-1) {
                        spellDamageValueArr.push(spellDamageValue);
                    }                   
                })   
                
                for (var i = 0; i<spellDamageLabelArr.length; i++) {
                    console.log(spellDamageLabelArr[i]);
                }

            }
        });
    }    // end scrapeSubUrl

}
    