var statList = [];

// On document ready.
$(document).ready(function(){

    // Set onClick event.
    $('#calculate-stats').click(function(){

        // setBaseStats();
        // calculateStats();

        handleCalculations();

    });

    // Set onClick event.
    $('input[name="gridRadios"]').click(function(){

        var gridSize = $(this).val();

        handleGridSwitch(gridSize);

    });

});

function handleGridSwitch(gridSize){
    // Grid types: large, small, player.
    // Grid classes: largeGrid, smallGrid, playerGrid

    if(gridSize == "large"){
        // Disable smallOnly and playerOnly
        $('.smallGridOnly').prop("disabled", true);
        $('.playerGridOnly').prop("disabled", true);

        // Enable largeGrids.
        $('.largeGrid').prop("disabled", false);

    }else if(gridSize == "small"){
        // Disable large and player grids.
        $('.playerGrid').prop("disabled", true);
        $('.largeGrid').prop("disabled", true);

        // Enable small grids.
        $('.smallGrid').prop("disabled", false);

    }else{
        // Disable largeGridOnly and smallGridOnly
        $('.smallGrid').prop("disabled", true);
        $('.largeGrid').prop("disabled", true);

        // Enable player grids
        $('.playerGrid').prop("disabled", false);

    }

}

function handleCalculations(){

    // Important vars!
    var statList                = [];
    var gridSize                = $('input[name="gridRadios"]:checked').val();
    var playerCount             = $('#playerCount').val();
    var shipWeight              = $('#shipWeight').val();
    var planet                  = $('input[name="planetRadios"]:checked').val();

    // Oxygen vars
    var playersConsumeSameAir   = playersConsumeSameAir = document.getElementById('playersConsumeSameAir').checked;
    var playerOxygenConsumption = gameInfo.grids.player.oxygenConsumption;

    var totalOxygenStorage      = calcTotalOxygenStorage(gridSize, playerCount);
    var totalOxygenConsumption  = calcTotalOxygenConsumption(playerCount, playerOxygenConsumption);
    var totalOxygenProduction   = calcTotalOxygenProduction(gridSize);

    // Specific oxygen calculations.
    calcTotalOxygenStorageDrain(playersConsumeSameAir, totalOxygenConsumption, totalOxygenStorage);
    calcOxygenFarmPlayerSustain(playerCount, playerOxygenConsumption, totalOxygenProduction);

    pushStat("&nbsp; ", false);

    // Atmospheric vars
    var totalAtmosphericThrust = calcThrusterTypeTotalThrust(gridSize, "Atmospheric");

    // Specific atmospheric calculations.
    var atmosphericThrustersMaxLift = calcThrusterTypeMaxLift(gridSize, "Atmospheric", totalAtmosphericThrust);
    calcThrusterTypeMaxAcceleration(gridSize, totalAtmosphericThrust, shipWeight, "Atmospheric");
    canThrustersLiftShip(shipWeight, atmosphericThrustersMaxLift, "Atmospheric");

    pushStat("&nbsp; ", false);

    var totalHydrogenStorage        = calcTotalHydrogenStorage(gridSize, playerCount);
    var totalHydrogenConsumption    = calcTotalHydrogenConsumption(gridSize);
    var totalHydrogenThrust         = calcThrusterTypeTotalThrust(gridSize, "Hydrogen");

    // Specific hydrogen calculations.
    calcHydrogenStorageDrain(totalHydrogenStorage, totalHydrogenConsumption);
    var hydrogenThrustersMaxLift = calcThrusterTypeMaxLift(gridSize, "Hydrogen", totalHydrogenThrust);
    calcThrusterTypeMaxAcceleration(gridSize, totalHydrogenThrust, shipWeight, "Hydrogen");
    canThrustersLiftShip(shipWeight, hydrogenThrustersMaxLift, "Hydrogen");

    pushStat("&nbsp; ", false);

    // Calculate total combined thrust.
    var totalShipLift = calcAllThrustersMaxLift(atmosphericThrustersMaxLift, hydrogenThrustersMaxLift);
    canThrustersLiftShip(shipWeight, totalShipLift, "Total");

    pushStat("&nbsp; ", false);

    // Ion vars
    var totalIonThrust = calcThrusterTypeTotalThrust(gridSize, "Ion");

    // Specific Ion calculations.
    calcThrusterTypeMaxAcceleration(gridSize, totalIonThrust, shipWeight, "Ion");

    pushStat("&nbsp; ", false);

    calcGroundToSpaceTravelTime(planet);

    buildStatList();

}

function calcTotalOxygenStorage(gridSize, playerCount){

    playerItemOxygenBottleAmount    = $('#playerItemOxygenBottle').val();
    playerItemOxygenBottleStorage   = gameInfo.grids.player.oxygenBottle.storage;

    var totalOxygenStorage = (playerItemOxygenBottleStorage * playerItemOxygenBottleAmount); // Oxygen bottles are for all grids.

    if(gridSize == "player"){

        var internalSuitStorage = gameInfo.grids.player.oxygenTank.storage;

        totalOxygenStorage += internalSuitStorage * playerCount;

    }

    if(gridSize == "small" || gridSize == "large"){

        oxygenTankAmount    = $('#oxygenTankAmount').val();
        oxygenTankStorage   = gameInfo.grids[gridSize].oxygenTank.storage;
        totalOxygenStorage  += oxygenTankStorage * oxygenTankAmount;

    }

    if(totalOxygenStorage <= 0){

        totalOxygenStorage = 0;

        pushStat("Oxygen storage", "No storage to drain.", "orange");

        return totalOxygenStorage;

    }

    pushStat("Oxygen storage", totalOxygenStorage +" o2");

    return totalOxygenStorage;

}

function calcTotalOxygenConsumption(playerCount, playerOxygenConsumption){

    var totalOxygenConsumption = playerOxygenConsumption * playerCount;

    pushStat("Oxygen consumption", totalOxygenConsumption +" o2/s");

    return totalOxygenConsumption;
}

function calcTotalOxygenProduction(gridSize){

    var totalOxygenProduction = 0;

    // Oxyfarms are enabled in large grids.
    if(gridSize == "large"){

        var oxygenfarmAmount            = $('#oxygenFarmAmount').val();
        var oxygenfarmProductionRate    = gameInfo.grids.large.oxygenFarm.production;
        totalOxygenProduction           += oxygenfarmProductionRate * oxygenfarmAmount;

    }

    pushStat("Oxygen production", totalOxygenProduction +" o2/s");

    return totalOxygenProduction;

}

function calcTotalOxygenStorageDrain(playersConsumeSameAir, totalOxygenConsumption, totalOxygenStorage){

    if(!playersConsumeSameAir || totalOxygenConsumption <= 0){

        pushStat("Oxygen consumption time", "No consumption no drain!", "orange");

        return false;

    }

    var consumptionTime = Math.round(totalOxygenStorage / totalOxygenConsumption);

    var formattedTime = formatSecondsToHumanReadable(consumptionTime);

    pushStat("Oxygen consumption time", formattedTime);

}

function calcOxygenFarmPlayerSustain(playerCount, playerOxygenConsumption){

    // Can the production sustain the consumption?
    var totalOxygenConsumption      = playerOxygenConsumption * playerCount;
    var oxygenfarmProductionRate    = gameInfo.grids.large.oxygenFarm.production;
    var oxygenfarmAmount            = $('#oxygenFarmAmount').val();
    var totalOxygenFarmProduction   = oxygenfarmProductionRate * oxygenfarmAmount;

    if(totalOxygenFarmProduction >= totalOxygenConsumption){

        // How many players can be sustained by current farm amount?
        var totalPlayersSustainOxygenFarms = Math.floor(totalOxygenFarmProduction / playerOxygenConsumption);

        pushStat("Oxygen farm players", playerCount +"/"+ totalPlayersSustainOxygenFarms, "green");

    }else{

        // So theres not enough oxygen farms to sustain the players. How many do we need then?
        var oxygenfarmsRequired = Math.ceil(totalOxygenConsumption / oxygenfarmProductionRate);

        pushStat("Oxygen farms needed", oxygenfarmAmount +"/"+ oxygenfarmsRequired, "red");

    }

}

function calcTotalHydrogenStorage(gridSize, playerCount){

    playerItemHydrogenBottleAmount    = $('#playerItemHydrogenBottle').val();
    playerItemHydrogenBottleStorage   = gameInfo.grids.player.hydrogenBottle.storage;

    var totalHydrogenStorage = (playerItemHydrogenBottleStorage * playerItemHydrogenBottleAmount); // Hydrogen bottles are for all grids.

    if(gridSize == "player"){

        var internalSuitStorage = gameInfo.grids.player.hydrogenTank.storage;

        totalHydrogenStorage += internalSuitStorage * playerCount;

    }

    if(gridSize == "small" || gridSize == "large"){

        HydrogenTankAmount    = $('#HydrogenTankAmount').val();
        HydrogenTankStorage   = gameInfo.grids[gridSize].hydrogenTank.storage;
        totalHydrogenStorage  += HydrogenTankStorage * HydrogenTankAmount;

    }

    pushStat("Hydrogen storage", totalHydrogenStorage +" H");

    return totalHydrogenStorage;

}

function calcTotalHydrogenConsumption(gridSize){

    var totalHydrogenConsumption = 0;

    if(gridSize == "player"){

        // totalHydrogenConsumption = gameInfo.grids.player.hydrogenConsumption; // Cant find the suit consumption.

    }

    if(gridSize == "small" || gridSize == "large"){

        // totalHydrogenConsumption = gameInfo.grids.player.hydrogenConsumption; // Cant find the suit consumption.
        largeHydrogenThrusterAmount         = $('#largeHydrogenThrusterAmount').val();
        largeHydrogenThrusterConsumption    = gameInfo.grids[gridSize].largeHydrogenThruster.consumption;

        smallHydrogenThrusterAmount         = $('#smallHydrogenThrusterAmount').val();
        smallHydrogenThrusterConsumption    = gameInfo.grids[gridSize].smallHydrogenThruster.consumption;

        totalHydrogenConsumption = largeHydrogenThrusterConsumption * largeHydrogenThrusterAmount;
        totalHydrogenConsumption += smallHydrogenThrusterConsumption * smallHydrogenThrusterAmount;

    }

    pushStat("Hydrogen consumption", totalHydrogenConsumption +" H/s");

    return totalHydrogenConsumption;

}

function calcHydrogenStorageDrain(totalHydrogenStorage, totalHydrogenConsumption){

    if(totalHydrogenConsumption <= 0){

        pushStat("Oxygen consumption time", "No consumption no drain!", "orange");

        return false;

    }

    var consumptionTime = Math.round(totalHydrogenStorage / totalHydrogenConsumption);

    var formattedTime = formatSecondsToHumanReadable(consumptionTime);

    pushStat("Hydrogen consumption time", formattedTime);

}



function calcThrusterTypeTotalThrust(gridSize, thrusterType){

        var totalThrust = 0;

        if(gridSize == "player"){

            // Cant find the suit thrust.

        }

        if(gridSize == "small" || gridSize == "large"){

            var largeThrusterType = 'large'+ thrusterType +'Thruster';
            var smallThrusterType = 'small'+ thrusterType +'Thruster';

            var largeThrusterThrust = gameInfo.grids[gridSize][largeThrusterType].maximumThrust;
            var largeThrusterAmount = $('#'+ largeThrusterType +'Amount').val();

            var smallThrusterThrust = gameInfo.grids[gridSize][smallThrusterType].maximumThrust;
            var smallThrusterAmount = $('#'+ smallThrusterType +'Amount').val();

            totalThrust = largeThrusterThrust * largeThrusterAmount;
            totalThrust += smallThrusterThrust * smallThrusterAmount;

        }

        pushStat(thrusterType +" thrust", totalThrust +" kN");

        return totalThrust;

}

function calcThrusterTypeMaxLift(gridSize, thrusterType, totalThrust){

    var thrustersMaxLift = 0;

    if(gridSize == "player"){

        return false;

    }

    // thrustersMaxLift = engine force [N] * effectivity [unitless] / acceleration due to gravity [m/s²];
    thrustersMaxLift = ((totalThrust * 1000) * 0.9) / 9.81;

    thrustersMaxLift = Math.floor(thrustersMaxLift);

    pushStat( thrusterType +" thrusters max lift", thrustersMaxLift +" kg");

    return thrustersMaxLift;

    // Source and info:
    //http://www.spaceengineerswiki.com/Thruster#Effectiveness_In_Natural_Gravity

}

function calcThrusterTypeMaxAcceleration(gridSize, totalThrust, shipWeight, thrusterType){

    var thrustersMaxAcceleration = 0;

    if(gridSize == "player"){

        return false;

    }

    thrustersMaxAcceleration = ((totalThrust * 1000) * 0.9) / shipWeight;
    thrustersMaxAcceleration = formatAccelerationToHumanReadable(thrustersMaxAcceleration);

    pushStat(thrusterType +" thrusters acceleration", thrustersMaxAcceleration +" m/s");

}

function calcAllThrustersMaxLift(atmosphericThrustersMaxLift, hydrogenThrustersMaxLift){

    var allThrustersMaxLift = 0;

    allThrustersMaxLift = atmosphericThrustersMaxLift + hydrogenThrustersMaxLift;

    pushStat("All thrusters combined lift", allThrustersMaxLift +" kg");

    return allThrustersMaxLift;

}

function canThrustersLiftShip(shipWeight, thrustersMaxLift, thrusterType){

    if(shipWeight < thrustersMaxLift){

        pushStat(thrusterType +" thruster lift", "Can lift your ship!", "green");

    }else{

        pushStat(thrusterType +" thruster lift", "Not enough lift.", "red");

    }

}

function calcGroundToSpaceTravelTime(planet){

    console.log("Planet "+ planet);

    var maxGravitationalPullAltitude = gameInfo.planets[planet].maxGravitationalPullAltitude;
    maxGravitationalPullAltitude += 2000; // To be sure!

    var maxTravelSpeed = 100;

    var timeToReachMaxGrav = maxGravitationalPullAltitude / maxTravelSpeed;

    formattedTimed = formatSecondsToHumanReadable(timeToReachMaxGrav);

    pushStat("Time to reach space (at full speed)", formattedTimed);

}

/*--------------------------------------------Utility ---------------------------------------------------
* Functions designed to be used multiple times and assist in certain ways.
*/

function pushStat(text, value = false, color = "black"){

    if(value){

        var returnObject = {
            "text": text + ":",
            "value": value,
            "color": color
        };

    }else{

        var returnObject = {
            "text": text,
            "value": "",
            "color": color
        };

    }

    statList.push(returnObject);
}

function buildStatList(){

    $('#stat-list').empty(); // Empty displayed list.

    $.each(statList, function(key, obj) {

        var html = '<tr class="'+ obj.color +'"><td>'+ obj.text +'</td><td>'+ obj.value +'</td></tr>';

        $('#stat-list').append(html);

    });


    emptyStatList(); // Empty list.

}

function emptyStatList(){

    statList = [];

}

function formatAccelerationToHumanReadable(acceleration){

    var formatted = acceleration.toFixed(2);

    return formatted;

}

/**
 * Translates seconds into human readable format of seconds, minutes, hours, days, and years
 *
 * @param  {number} seconds The number of seconds to be processed
 * @return {string}         The phrase describing the the amount of time
 *Source: http://stackoverflow.com/a/34270811
 */
function formatSecondsToHumanReadable ( seconds ) {
    var levels = [
        [Math.floor(seconds / 31536000), 'years'],
        [Math.floor((seconds % 31536000) / 86400), 'days'],
        [Math.floor(((seconds % 31536000) % 86400) / 3600), 'hours'],
        [Math.floor((((seconds % 31536000) % 86400) % 3600) / 60), 'minutes'],
        [(((seconds % 31536000) % 86400) % 3600) % 60, 'seconds'],
    ];
    var returntext = '';

    for (var i = 0, max = levels.length; i < max; i++) {
        if ( levels[i][0] === 0 ) continue;
        returntext += ' ' + levels[i][0] + ' ' + (levels[i][0] === 1 ? levels[i][1].substr(0, levels[i][1].length-1): levels[i][1]);
    };
    return returntext.trim();
}

/*-------------------------------------------- Input checks ---------------------------------------------------
* One of many functions of this type.
* These check if all the required fields are filled in for the calculation to be made.
* If not abort this opperation.
*/

//@TODO Fix a decent check that allows for open ended stuff. So only check required?
function oxygenStatsReady(){
    if(
        !$('#playerCountOxygenConsumption').val() ||
        !$('#largeGridOxygenTank').val() ||
        !$('#smallGridOxygenTank').val() ||
        !$('#playerItemOxygenBottle').val()
    ){

        return false;
    }

    return true;

}
