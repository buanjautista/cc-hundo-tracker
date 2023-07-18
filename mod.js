if(!cc) {
  throw "CCLoader is required for this mod.";
}

let gui = require('nw.gui');

var trackerWindow = {
  // Spawner Window handler
  window: null
};

{
  let initialize = function() {

    let openInterface = function() {
      if (trackerWindow.window) {
        trackerWindow.window.focus();
        trackerWindow.window.getCompletion(getCompletionStats());
        return;
      }
    
      let getCompletionStats = function () {
        let stats = {
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
            areas: sc.map.areas, 
            total: sc.map.getTotalChestsFound(true)
          }, 
          quests: sc.quests.getTotalQuestsSolved(true),
          combat: sc.stats.values.combat
        }
        return stats;
      }

      gui.Window.open(
        'assets/mods/hundo-tracker/index.html',
        {
          position: 'center',
          width: 390,
          height: 210,
          resizable: false
        },
        (window) => {
          trackerWindow.window = window;

          window.on('loaded', () => {
            window.window.trackerWindow = trackerWindow;
            
            window.window.simplify = simplify;
            if (window){ 
              // need a way to stop registerUpdate() so it doesnt crash on window close, is that fireupdate?
              window.window.simplify.registerUpdate(() => window.window.getCompletion(getCompletionStats())); // sends completion rate updates to the tracker window
            }
          });

          window.on('closed', () => {
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



// In case need to add more variables for the tracker later on:
// totalStory = ig.vars.get("plot.line") || 0;
// totalEnemies = (b >= 32e3 ? 1 : b / 32e3) + sc.combat.getTotalEnemiesFound(true);
// totalItems = sc.inventory.getTotalItemsUnlocked(true);
// totalLore = sc.lore.getTotalLoreEntriesFound(true);
// totalLandmarks = sc.map.getTotalLandmarksFound(true);
// totalareas = sc.map.getTotalAreasFound(true);
// totalDrops = sc.menu.getTotalDropsFoundAndCompleted(true);
// totalReports = sc.combat.getTotalEnemyReportsFound(true);
// totalTrophies = sc.trophies.getTotalTrophiesUnlocked(true);
// totalTraders = sc.trade.getTotalTradersFound(true);

