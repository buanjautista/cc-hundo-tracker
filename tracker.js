let questCompletion;
let chestCompletion;
let bossCompletion;
let shadeStats;

const GAME_VERSION = {
    0: "1.0.2+", 1: "1.0.3+", 2: "1.1.0+", 3:"1.4.0+"
}

// at some point try to implement something that grabs game version and detects the extra bosses. cheap as hell but kinda works
function getBossAmount(version) {
    let totalBosses = 0
    switch (version) {
        case GAME_VERSION[0]:
            totalBosses = 31
            break
        case GAME_VERSION[1]:
            totalBosses = 32
            break
        case GAME_VERSION[2]:
            totalBosses = 34
            break
        case GAME_VERSION[3]:
            totalBosses = 38
            break
        default: 
            totalBosses = 31
            break 
    }
    return totalBosses
}

const questBox = document.getElementById('tracker-info-quest')
const chestBox = document.getElementById('tracker-info-chest')
const bossBox = document.getElementById('tracker-info-boss')
const shadeBoxList = document.getElementsByClassName('shade-box')

// Exits the tracker window with Escape
document.addEventListener('keydown', (evt) => {
    if (evt.code === "Escape")
        window.close();
});

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

function getCompletion(stats){

    bossCompletion = getCombatCompletion(stats.combat)
    setShadeCompletion(stats.shades)
    
    setAreaChests(stats.chests)

    questCompletion = Math.floor((stats.quests * 10000)) *0.01
    chestCompletion = Math.floor((stats.chests.total * 10000)) *0.01

    bossBox.innerText = "Bosses: " + bossCompletion
    questBox.innerText = "Quests: " + questCompletion + "%"
    chestBox.innerText = "Chests: " + chestCompletion + "%"
}

/* 
    Gets all the entries from sc.stats.values.combat
    Make sures they match with the boss name list (bossCompletionNames), otherwise it ignores them
    Tracks the total kills then send the completion with that
*/
function getCombatCompletion(gameStats){
    let currentVersion = GAME_VERSION[0]
    let totalBossAmount = getBossAmount(currentVersion)
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
    if (shadeStats != gameStats)
    {
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
            let currentAreaTotalChests = gameStats.areas[areaName.area].chests
            currentPageElement = document.getElementById(areaName.area)

            if (currentPageElement.innerText != chestAreaValue[i]){
                currentPageElement.innerText = areaName.name + chestAreaValue[i] + "/" + currentAreaTotalChests
            }
        }
    }
}
