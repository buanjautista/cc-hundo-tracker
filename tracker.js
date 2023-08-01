let questCompletion;
let chestCompletion;
let bossCompletion;
let shadeStats;

let gameAreas;
let currentGameVersion;
let patchVersion;

const GAME_VERSION = {
    0: "0.2", 1: "0.3", 2: "1.0", 3: "3.0", 4:"4.0"
}

const questBox = document.getElementById('tracker-info-quest')
const chestBox = document.getElementById('tracker-info-chest')
const bossBox = document.getElementById('tracker-info-boss')
const shadeBoxList = document.getElementsByClassName('shade-box')
const keylockBox = document.getElementById('keylock-tracker')

// Exits the tracker window with Escape
document.addEventListener('keydown', (evt) => {
    if (evt.code === "Escape")
        window.close();
});

let fullStatTracking
function setFullStatsCheck(enable){
    enable ? fullStatTracking = true : fullStatTracking = false
}

let bossCompletionNames = [ 
    "boss-test",
    "turret-boss",
    "minibosses.blue-hedge",
    "meerkat-special-command-1",
    "autumn-fall.buffalo-fire-quest",
    "daft-frobbit",
    "minibosses.penguin-rapper",
    "jungle.special.snowman-jungle-boss",
    "mine-diggingbot-cold",
    "cold.mine-diggingbot-quest",
    "boss-driller",
    "minibosses.cursed-sandshark",
    "heat.sandworm-boss",
    "heat.antlion",
    "heat.megamoth",
    "heat.special.guard-hostile-mustache",
    "jungle.special.powerplant-quest-1",
    "minibosses.sloth-black",
    "minibosses.deep-fish",
    "jungle.shockboss",
    "jungle.waveboss",
    "jungle.ape-boss",
    "jungle.whale-boss",
    "forest.samurai-boss",
    "minibosses.henry",
    "arid.snail",
    "arid.element-turret-boss",
    "boss.designer-1",
    "boss.designer-2",
    "boss.elephant",
    "guest.glitch-boss",
    "minibosses.panda-boss",
    "minibosses.scorpion-boss",
    "fish-mega-gear",
    "snow-megatank",
    "hedgehag-king"
]
let stats
function getCompletion(gameStats){
    if (JSON.stringify(gameStats) != JSON.stringify(stats)) {
        stats = gameStats
        bossCompletion = getCombatCompletion(stats.combat)
        setShadeCompletion(stats.shades)
        
        setKeylockCompletion(stats.keylocks)
    
        setAreaChests(stats.chests)

        if (fullStatTracking) { // if extra stats option is toggled, track the stats in here
            setAchievementStats(stats.combat, stats.playerstats)
        }
    
        questCompletion = (stats.quests * 100).toFixed(2)
        chestCompletion = (stats.chests.total * 100).toFixed(2)
        bossBox.innerText = "Bosses: " + bossCompletion
        questBox.innerText = "Quests: " + questCompletion + "%"
        chestBox.innerText = "Chests: " + chestCompletion + "%"
    }
}

// Track the extra achievement stats for full 100% purposes
const statTracker = document.getElementById("stat-tracker")
function setAchievementStats(combatStats, playerStats){
    let gameStats = {
        steps: playerStats.steps,
        throws: playerStats.throws,
        dashes: playerStats.dash,
        jumps: playerStats.jumps,
        pdash: playerStats.perfectDash,
        onehitko: combatStats.oneHitKills,
        shield: combatStats.shieldedHits,
        pguard: combatStats.perfectShield,
        heals: combatStats.healed,
        combatarts: combatStats.specials,
        maxdamageonehit: combatStats.maxDamage,
        totaldamage: combatStats.damageGiven,
        crits: combatStats.critHits,
        environment: combatStats.enviroKills,
        survivelow: combatStats.lowHealthWins
    }
    statTracker.innerText = `Total Steps: ${gameStats.steps} / ${maxStat.steps} \n
    Total Dashes: ${gameStats.dashes} / ${maxStat.dashes} \n
    Total Jumps: ${gameStats.jumps} / ${maxStat.jumps} \n
    Total Perfect Dashes: ${gameStats.pdash} / ${maxStat.pdash} \n
    `
}
const maxStat = {
    steps:50000,
    dashes: 20000,
    jumps:1000,
    pdash:100,
    onehitko: 500,
    shield:4000,
    pguard:200,
    counter:200,
    throws:50000,
    melee:50000,
    heals:400000,
    combatarts:1000,
    maxdamageonehit:50000,
    damage:1000000,
    kills:8000,
    crits:20000,
    environment:100,
    survivelow:50
}

/* 
    Gets all the entries from sc.stats.values.combat
    Make sures they match with the boss name list (bossCompletionNames), otherwise it ignores them
    Tracks the total kills then send the completion with that
*/
function getCombatCompletion(gameStats){
    let totalBossAmount = getBossAmount(getGamePatch()) // sets total boss number depending on patch
    let completionStat = "0"

    for (let bossAmount = 0; bossAmount < totalBossAmount; bossAmount++)
    {
        let currentBoss 
        // Check so it doesnt crash. If receives the sc.stats.values.combat, then proceeds with the calcs
        if (gameStats) {
            if (gameStats["kill" + bossCompletionNames[bossAmount]]) {
                currentBoss = true
            }
        }
        else { currentBoss = false } // safety reset
        
        if (currentBoss) { completionStat++ }
    }
    completionStat = (completionStat + "/" + totalBossAmount)
    return completionStat
}

/* 
    Checks if received the shade item, stored in the array sent from mod.js
    In order, the shades: leaf, ice, sand, flame, seed, bolt, drop, star, meteor  
*/
function setShadeCompletion(gameStats){
        shadeStats = gameStats
        
        for (let i = 0; i < gameStats.length; i++) {

            // let currentShade = "icon-shade-" + (i) + "-0"
            let activatedShade = "icon-shade-" + (i) + "-1"
            shadeBoxList[i].children[0].classList.remove(activatedShade) // fix attempt to remove the activated shade on update, if you dont have it on file reload
    
            if (gameStats[i]) {
                // Activates the overlay in the page element, if player has the shade
                shadeBoxList[i].children[0].classList.add(activatedShade)
            }
        }
}

/* Gets if you have Thief/White/Radiant key and sends it to the tracker */ 

let currentKeylocks
function setKeylockCompletion(gameStats){
    // Send a data update only if the keylock array is different
        currentKeylocks = gameStats

        for (let i = 0; i < gameStats.length; i++) {
            let closedChest = "icon-chestlock-closed"
            let activatedChest = "icon-chestlock-open"
            keylockBox.children[i].classList.remove(activatedChest)
            keylockBox.children[i].classList.remove(closedChest)

            if (gameStats[i]) {
                keylockBox.children[i].classList.add(activatedChest)
            }
            else {
                keylockBox.children[i].classList.add(closedChest)
            }
        }
}

let areasWithChest = [
	{
		area: "rhombus-dng",
		name: "Rhombus: ",
	},
	{
		area: "rookie-harbor",
		name: "Harbor: ",
	},
	{
		area: "autumn-area",
		name: "Rise: ",
	},
	{
		area: "bergen-trails",
		name: "Trail: ",
	},
	{
		area: "bergen",
		name: "Bergen: ",
	},
	{
		area: "cold-dng",
		name: "Mine: ",
	},
	{
		area: "heat-area",
		name: "Valley: ",
	},
	{
		area: "heat-village",
		name: "Ba'kii: ",
	},
	{
		area: "heat-dng",
		name: "Faj'ro: ",
	},
	{
		area: "autumn-fall",
		name: "Fall: ",
	},
	{
		area: "arid",
		name: "Wasteland: ",
	},
	{
		area: "jungle",
		name: "Garden: ",
	},
	{
		area: "jungle-city",
		name: "Keep: ",
	},
	{
		area: "shock-dng",
		name: "Zir'vitar: ",
	},
	{
		area: "wave-dng",
		name: "So'najiz: ",
	},
	{
		area: "tree-dng",
		name: "Krys'kajo: ",
	},
	{
		area: "forest",
		name: "Ridge: ",
	},
	{
		area: "rhombus-sqr",
		name: "Square: ",
	},
];
let chestAreaValue = []
let chestCount // storing this var so game doesnt crash on main menu, since unload save info, hopefully



function getGameInfo(info) { 
    // grabs some fixed info from game (total areas for chest comparison, and current version for boss count)
    gameAreas = info.areas
    currentGameVersion = info.version
    patchVersion = currentGameVersion.slice(3, 6) // workaround to get patch version for boss count
}

function setAreaChests(gameStats) {
    if (gameStats) { // makes sure data is coming in
        for (i = 0; i < areasWithChest.length; i++ ){
            let areaName = areasWithChest[i]
            let currentPageElement

            // Gets the current count of chests on each area. 
            // If area not defined it just sets value to 0
            if (gameStats.collected) {
                gameStats.collected[areaName.area]

                gameStats.collected[areaName.area] 
                    ? chestAreaValue[i] = gameStats.collected[areaName.area] 
                    : chestAreaValue[i] = 0
            }
            else {
                chestAreaValue[i] = 0 
            }
            
            // Sends the data to the chest-info divs
            let currentAreaTotalChests = gameAreas[areaName.area].chests
            currentPageElement = document.getElementById(areaName.area)

            if (currentPageElement.innerText != chestAreaValue[i]){
                currentPageElement.innerText = areaName.name + chestAreaValue[i] + "/" + currentAreaTotalChests
            }
        }
    }
}


function getGamePatch() {
    let version
    if (Number(patchVersion) < 1.0) {
        switch (patchVersion) {
            case 0.3:
                version = GAME_VERSION[1]
                break
            default:
            case 0.2:
                    version = GAME_VERSION[0]
                    break
        }
    }
    else if (Number(patchVersion) < 3.0) {
        version = GAME_VERSION[2]
    }
    else if (Number(patchVersion) < 4.0) {
        version = GAME_VERSION[3]
    }
    else if (Number(patchVersion) >= 4.0) {
        version = GAME_VERSION[4]
    }

    return version
}

// tries to return how many bosses according to game patch
function getBossAmount(version) {
    let totalBosses = 0
    switch (version) {
        case GAME_VERSION[1]:
            totalBosses = 32
            break
        case GAME_VERSION[2]:
            totalBosses = 34
            break
        case GAME_VERSION[3]:
            totalBosses = 35
            break
        case GAME_VERSION[4]:
            totalBosses = 38
            break
        default:
        case GAME_VERSION[0]:
            totalBosses = 31
            break
    }
    return totalBosses
}


