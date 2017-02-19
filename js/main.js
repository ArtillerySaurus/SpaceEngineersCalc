var statList = [];

// Field values/user input.
// var playerCount;
// var gridSize;
// var oxygenTankAmount;
// var playerItemOxygenBottleAmount;
// var oxygenfarmAmount;
var depresAirventAmount;
var playersConsumeSameAir;

// Game info taken via gameInfo.js.
var oxygenTankStorage;
var playerItemOxygenBottleStorage;
var oxygenfarmProductionRate;
var airventInput;

// Totals.
var totalOxygenStorage;
var totalOxygenConsumption;
var totalOxygenProduction;
var totalAirventInput;

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

    // Oxygen vars
    var playersConsumeSameAir   = playersConsumeSameAir = document.getElementById('playersConsumeSameAir').checked;
    var playerOxygenConsumption = gameInfo.grids.player.oxygenConsumption;

    var totalOxygenStorage      = calcTotalOxygenStorage(gridSize, playerCount);
    var totalOxygenConsumption  = calcTotalOxygenConsumption(playerCount, playerOxygenConsumption);
    var totalOxygenProduction   = calcTotalOxygenProduction(gridSize);

    // Specific oxygen calculations.
    calcTotalOxygenStorageDrain(playersConsumeSameAir, totalOxygenConsumption, totalOxygenStorage);
    calcOxygenFarmPlayerSustain(playerCount, playerOxygenConsumption, totalOxygenProduction);

    pushStat("&nbsp; ", "", false);

    // Atmospheric vars
    var totalAtmosphericThrust = calcAtmosphericTotalThrust(gridSize);

    // Specific atmospheric calculations.
    var atmosphericThrustersMaxLift = calcAtmosphericThrustersMaxLift(gridSize, totalAtmosphericThrust);
    calcAtmosphericThrustersMaxAcceleration(gridSize, totalAtmosphericThrust, shipWeight);

    pushStat("&nbsp; ", "", false);

    var totalHydrogenStorage        = calcTotalHydrogenStorage(gridSize, playerCount);
    var totalHydrogenConsumption    = calcTotalHydrogenConsumption(gridSize);
    var totalHydrogenThrust         = calcHydrogenTotalThrust(gridSize);

    // Specific hydrogen calculations.
    calcHydrogenStorageDrain(totalHydrogenStorage, totalHydrogenConsumption);
    var hydrogenThrustersMaxLift = calcHydrogenThrustersMaxLift(gridSize, totalHydrogenThrust);
    calcHydrogenThrustersMaxAcceleration(gridSize, totalHydrogenThrust, shipWeight);

    pushStat("&nbsp; ", "", false);

    // Ion vars
    var totalIonThrust = calcIonTotalThrust(gridSize);

    // Specific Ion calculations.
    calcIonThrustersMaxAcceleration(gridSize, totalIonThrust, shipWeight);

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

        pushStat("Oxygen storage", "No storage to drain.");

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

        pushStat("Oxygen consumption time", "No consumption no drain!");

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

        pushStat("Oxygen farm players", playerCount +"/"+ totalPlayersSustainOxygenFarms);

    }else{

        // So theres not enough oxygen farms to sustain the players. How many do we need then?
        var oxygenfarmsRequired = Math.ceil(totalOxygenConsumption / oxygenfarmProductionRate);

        pushStat("Oxygen farms needed", oxygenfarmAmount +"/"+ oxygenfarmsRequired);

    }

}

function calcAtmosphericTotalThrust(gridSize){

    var totalAtmosphericThurst = 0;

    if(gridSize == "player"){

        // totalAtmosphericThurst = gameInfo.grids.player.???; // Cant find the suit thrust.

    }

    if(gridSize == "small" || gridSize == "large"){

        var largeAtmosphericThrusterThrust = gameInfo.grids[gridSize].largeAtmosphericThruster.maximumThrust;
        var largeAtmosphericThrusterAmount = $('#largeAtmosphericThrusterAmount').val();

        var smallAtmosphericThrusterThrust = gameInfo.grids[gridSize].smallAtmosphericThruster.maximumThrust;
        var smallAtmosphericThrusterAmount = $('#smallAtmosphericThrusterAmount').val();

        totalAtmosphericThurst = largeAtmosphericThrusterThrust * largeAtmosphericThrusterAmount;
        totalAtmosphericThurst += smallAtmosphericThrusterThrust * smallAtmosphericThrusterAmount;

    }

    pushStat("Atmospheric Thrust", totalAtmosphericThurst +" kN");

    return totalAtmosphericThurst;

}

function calcAtmosphericThrustersMaxLift(gridSize, totalAtmosphericThrust){

    var AtmosphericThrustersMaxLift = 0;

    if(gridSize == "player"){

        return false;

    }

    // AtmosphericThrustersMaxLift = engine force [N] * effectivity [unitless] / acceleration due to gravity [m/s²];
    AtmosphericThrustersMaxLift = ((totalAtmosphericThrust * 1000) * 0.9) / 9.81;
    // AtmosphericThrustersMaxLift = (408000 * 0.9) / 9.81;
    AtmosphericThrustersMaxLift = Math.floor(AtmosphericThrustersMaxLift / 1000);

    pushStat("Atmospheric thrusters max lift", AtmosphericThrustersMaxLift +" kg");

    return AtmosphericThrustersMaxLift;

    // Source and info:
    //http://www.spaceengineerswiki.com/Thruster#Effectiveness_In_Natural_Gravity

}

function calcAtmosphericThrustersMaxAcceleration(gridSize, totalAtmosphericThrust, shipWeight){

    var AtmosphericThrustersMaxAcceleration = 0;

    if(gridSize == "player"){

        return false;

    }

    AtmosphericThrustersMaxAcceleration = ((totalAtmosphericThrust * 1000) * 0.9) / shipWeight;
    AtmosphericThrustersMaxAcceleration = formatAccelerationToHumanReadable(AtmosphericThrustersMaxAcceleration);

    pushStat("Atmospheric thrusters acceleration", AtmosphericThrustersMaxAcceleration +" m/s");

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

function calcHydrogenTotalThrust(gridSize){

    var totalHydrogenThurst = 0;

    if(gridSize == "player"){

        // totalHydrogenThurst = gameInfo.grids.player.???; // Cant find the suit thrust.

    }

    if(gridSize == "small" || gridSize == "large"){

        var largeHydrogenThrusterThrust = gameInfo.grids[gridSize].largeHydrogenThruster.maximumThrust;
        var largeHydrogenThrusterAmount = $('#largeHydrogenThrusterAmount').val();

        var smallHydrogenThrusterThrust = gameInfo.grids[gridSize].smallHydrogenThruster.maximumThrust;
        var smallHydrogenThrusterAmount = $('#smallHydrogenThrusterAmount').val();

        totalHydrogenThurst = largeHydrogenThrusterThrust * largeHydrogenThrusterAmount;
        totalHydrogenThurst += smallHydrogenThrusterThrust * smallHydrogenThrusterAmount;

    }

    pushStat("Hydrogen Thrust", totalHydrogenThurst +" kN");

    return totalHydrogenThurst;

}

function calcHydrogenStorageDrain(totalHydrogenStorage, totalHydrogenConsumption){

    if(totalHydrogenConsumption <= 0){

        pushStat("Oxygen consumption time", "No consumption no drain!");

        return false;

    }

    var consumptionTime = Math.round(totalHydrogenStorage / totalHydrogenConsumption);

    var formattedTime = formatSecondsToHumanReadable(consumptionTime);

    pushStat("Hydrogen consumption time", formattedTime);

}

function calcHydrogenThrustersMaxLift(gridSize, totalHydrogenThrust){

    var hydrogenThrustersMaxLift = 0;

    if(gridSize == "player"){

        return false;

    }

    // hydrogenThrustersMaxLift = engine force [N] * effectivity [unitless] / acceleration due to gravity [m/s²];
    hydrogenThrustersMaxLift = ((totalHydrogenThrust * 1000) * 1.0) / 9.81;

    hydrogenThrustersMaxLift = Math.floor(hydrogenThrustersMaxLift / 1000);

    pushStat("Hydrogen thrusters max lift", hydrogenThrustersMaxLift +" kg");

    return hydrogenThrustersMaxLift;

    // Source and info:
    //http://www.spaceengineerswiki.com/Thruster#Effectiveness_In_Natural_Gravity

}

function calcHydrogenThrustersMaxAcceleration(gridSize, totalHydrogenThrust, shipWeight){

    var HydrogenThrustersMaxAcceleration = 0;

    if(gridSize == "player"){

        return false;

    }

    HydrogenThrustersMaxAcceleration = ((totalHydrogenThrust * 1000) * 1.0) / shipWeight;
    HydrogenThrustersMaxAcceleration = formatAccelerationToHumanReadable(HydrogenThrustersMaxAcceleration);

    pushStat("Hydrogen thrusters acceleration", HydrogenThrustersMaxAcceleration +" m/s");

}

function calcIonTotalThrust(gridSize){

    var totalIonThurst = 0;

    if(gridSize == "player"){

        // totalIonThurst = gameInfo.grids.player.???; // Cant find the suit thrust.

    }

    if(gridSize == "small" || gridSize == "large"){

        var largeIonThrusterThrust = gameInfo.grids[gridSize].largeIonThruster.maximumThrust;
        var largeIonThrusterAmount = $('#largeIonThrusterAmount').val();

        var smallIonThrusterThrust = gameInfo.grids[gridSize].smallIonThruster.maximumThrust;
        var smallIonThrusterAmount = $('#smallIonThrusterAmount').val();

        totalIonThurst = largeIonThrusterThrust * largeIonThrusterAmount;
        totalIonThurst += smallIonThrusterThrust * smallIonThrusterAmount;

    }

    pushStat("Ion Thrust", totalIonThurst +" kN");

    return totalIonThurst;

}

function calcIonThrustersMaxAcceleration(gridSize, totalIonThrust, shipWeight){

    var IonThrustersMaxAcceleration = 0;

    if(gridSize == "player"){

        return false;

    }

    IonThrustersMaxAcceleration = ((totalIonThrust * 1000) * 1.0) / shipWeight;
    IonThrustersMaxAcceleration = formatAccelerationToHumanReadable(IonThrustersMaxAcceleration);

    pushStat("Ion thrusters acceleration", IonThrustersMaxAcceleration +" m/s");

}

/*--------------------------------------------Utility ---------------------------------------------------
* Functions designed to be used multiple times and assist in certain ways.
*/

function pushStat(text, value, column = false){

    if(column){

        var returnObject = {
            "text": text + ":",
            "value": value
        };

    }else{

        var returnObject = {
            "text": text,
            "value": value
        };

    }

    statList.push(returnObject);
}

function buildStatList(){

    $('#stat-list').empty(); // Empty displayed list.

    $.each(statList, function(key, obj) {

        // var html = "<tr><td>"+ key +"</td><td>"+ value +"</td></tr>";
        var html = "<tr><td>"+ obj.text +"</td><td>"+ obj.value +"</td></tr>";

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
