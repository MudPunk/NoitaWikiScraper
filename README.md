# NoitaWikiScraper

Little node project to give me an excuse to play with javascript since it's about as frustrating and magical as [Noita](https://noitagame.com/), ["A totally finnished and bug free game."](https://noitagame.com/release_notes/).

This is currently built to scrape the [Noita Wiki Spell Information Table](https://noita.wiki.gg/wiki/Spell_Information_Table) and the sub pages the spells are linked to under `/wiki/<spell>`, such as [Energy Orb](https://noita.wiki.gg/wiki/Energy_Orb)

It can also scrape the Bosses from the [Enemies](https://noita.wiki.gg/wiki/Enemies) page and parse their sub pages for damage modifier info.

## Dependencies

```
npm install cheerio, request-promise
```

## Execution

Call `index.js`, include `Enemies` or `Spells`, and include `1` if you want the debug output or not.

```
node .\index.js Enemies 1
```
