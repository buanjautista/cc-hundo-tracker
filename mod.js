if(!cc) {
  throw "CCLoader is required for this mod.";
}

sc.OPTIONS_DEFINITION["show-full-tracker"] = {
	type: "CHECKBOX",
	init: false,
	cat: sc.OPTION_CATEGORY.INTERFACE,
	hasDivider: true,
	header: "cc-hundo-tracker",
};

let gui = require('nw.gui');

var trackerWindow = {
  // Spawner Window handler
  window: null
};
{
  let initialize = function() {

    let hundoTracker = activeMods.find(e => e.name == "Hundo Tracker")
    let indexDirectory = hundoTracker.baseDirectory + "index.html"

    let openInterface = function() {
      let windowHeight = 0
      sc.options.get("show-full-tracker") ? windowHeight = 420 : windowHeight = 210 // Expand window if full tracker is enabled

      if (trackerWindow.window) {
        trackerWindow.window.focus();
        // trackerWindow.window.getCompletion(getCompletionStats());
        return;
      }
      
      let setFixedGameInfo = function() { 
        let info = {
          areas: sc.map.areas, 
          version: ig.game.getVersion()
        }
        return info;
      }

      let getCompletionStats = function() {
        let stats = {
          keylocks: [
            ig.vars.get("item.154.amount"),
            ig.vars.get("item.155.amount"),
            ig.vars.get("item.156.amount")
          ],
          shades: [
            ig.vars.get("item.145.amount"),
            ig.vars.get("item.225.amount"),
            ig.vars.get("item.148.amount"),
            ig.vars.get("item.230.amount"),
            ig.vars.get("item.376.amount"),
            ig.vars.get("item.231.amount"),
            ig.vars.get("item.286.amount"),
            ig.vars.get("item.410.amount"),
            ig.vars.get("item.434.amount")],
          chests: {
            collected: sc.stats.values.chests,  
            total: sc.map.getTotalChestsFound(true)
          }, 
          quests: sc.quests.getTotalQuestsSolved(true),
          combat: sc.stats.values.combat
        }
        return stats;
      }

      gui.Window.open(
        indexDirectory,
        {
          position: 'center',
          width: 390,
          height: windowHeight,
          resizable: false
        },
        (window) => {
          trackerWindow.window = window;

          window.on('loaded', () => {
            window.window.trackerWindow = trackerWindow;
            
            window.window.simplify = simplify;
            if (window.window){ 
              window.window.setFullStatsCheck(sc.options.get("show-full-tracker")) // Toggle to set the tracker, to check extra stats for achievements and etc
              window.window.getGameInfo(setFixedGameInfo()); // sends area info to the tracker.js gameAreas variable

              // need a way to stop registerUpdate() so it doesnt crash on window close, is that fireupdate?
              window.window.simplify.registerUpdate(() => window.window.getCompletion(getCompletionStats())); // sends completion rate updates to the tracker window
            }
          });

          window.on('closed', () => {
            trackerWindow.window.simplify = null // hopefully stops register update
            trackerWindow.window = null;
          });
        }
      );    
    }

    // Opens the interface with P
    document.addEventListener('keydown', (evt) => {
      if (evt.code === "KeyP") openInterface();
    });
  };

  // Bind initialize
  document.body.addEventListener('modsLoaded', initialize);
}



// Fixes the Skip Beginning option not tracking stats until save reload. Thanks EL
sc.NewGamePlusModel.inject({
  applyStoreData(b) {
    this.parent(b);
    if(this.active && this.options["rhombus-start"]) sc.stats.statsEnabled = true;
  }
})




// In case need to add more variables for the tracker later on:
// totalEnemies = (b >= 32e3 ? 1 : b / 32e3) + sc.combat.getTotalEnemiesFound(true);
// totalItems = sc.inventory.getTotalItemsUnlocked(true);
// totalLore = sc.lore.getTotalLoreEntriesFound(true);
// totalLandmarks = sc.map.getTotalLandmarksFound(true);
// totalareas = sc.map.getTotalAreasFound(true);
// totalDrops = sc.menu.getTotalDropsFoundAndCompleted(true);
// totalReports = sc.combat.getTotalEnemyReportsFound(true);
// totalTrophies = sc.trophies.getTotalTrophiesUnlocked(true);
// totalTraders = sc.trade.getTotalTradersFound(true);


