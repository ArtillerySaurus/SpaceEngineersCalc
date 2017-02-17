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
    var playersConsumeSameAir   = playersConsumeSameAir = document.getElementById('playersConsumeSameAir').checked;
    var playerOxygenConsumption = gameInfo.grids.player.oxygenConsumption;

    var totalOxygenStorage      = calcTotalOxygenStorage(gridSize);
    var totalOxygenConsumption  = calcTotalOxygenConsumption(playerCount, playerOxygenConsumption);
    var totalOxygenProduction   = calcTotalOxygenProduction(gridSize);

    // Specific calculations.
    calcTotalOxygenStorageDrain(playersConsumeSameAir, totalOxygenConsumption, totalOxygenStorage);
    calcOxygenFarmPlayerSustain(playerCount, playerOxygenConsumption, totalOxygenProduction);


    buildStatList();

}

function calcTotalOxygenStorage(gridSize){

    playerItemOxygenBottleAmount    = $('#playerItemOxygenBottle').val();
    playerItemOxygenBottleStorage   = gameInfo.grids.player.oxygenBottle.storage;

    var totalOxygenStorage = (playerItemOxygenBottleStorage * playerItemOxygenBottleAmount); // Oxygen bottles are for all grids.

    if(gridSize != "player"){

        oxygenTankAmount    = $('#oxygenTankAmount').val();
        oxygenTankStorage   = gameInfo.grids[gridSize].oxygenTank.storage;
        totalOxygenStorage  += oxygenTankStorage * oxygenTankAmount;

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

    if(!playersConsumeSameAir){

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

        console.log(totalPlayersSustainOxygenFarms);

        pushStat("Oxygen farm players", playerCount +"/"+ totalPlayersSustainOxygenFarms);

    }else{

        // So theres not enough oxygen farms to sustain the players. How many do we need then?
        var oxygenfarmsRequired = Math.ceil(totalOxygenConsumption / oxygenfarmProductionRate);

        console.log(totalOxygenFarmProduction);

        pushStat("Oxygen farms needed", oxygenfarmAmount +"/"+ oxygenfarmsRequired);

    }

}

function setBaseStats(){

    // Field values/user input.
    gridSize                        = $('input[name="gridRadios"]:checked').val();
    playerCount                     = $('#playerCount').val();
    oxygenTankAmount                = $('#oxygenTankAmount').val();
    playerItemOxygenBottleAmount    = $('#playerItemOxygenBottle').val();
    oxygenfarmAmount                = $('#oxygenFarmAmount').val();
    depresAirventAmount             = $('#airventsDepresurise').val();
    playersConsumeSameAir           = document.getElementById('playersConsumeSameAirAsTanks').checked;

    // Game info taken via gameInfo.js.
    oxygenTankStorage               = partInfo.grids[gridSize].oxygenTank.storage;
    playerItemOxygenBottleStorage   = partInfo.playerItems.oxygenBottle.storage;
    oxygenfarmProductionRate        = partInfo.grids.large.oxygenFarm.production;
    airventInput                    = partInfo.grids[gridSize].airvent.input;

    // Total calculations.
    totalOxygenStorage = (oxygenTankStorage * oxygenTankAmount);
    totalOxygenStorage += (playerItemOxygenBottleStorage * playerItemOxygenBottleAmount);

    totalOxygenConsumption = 0;

    // If players breathe from the same system, correct calculations!
    if(playersConsumeSameAir){
        totalOxygenConsumption = playerOxygenConsumption * playerCount;
    }

    //@TODO Are oxygen bottles excluded from this? In the case of depres airvents?
    //@TODO Take oxygen generation from the oxy-gen into consideration! Make this checkbox thingy tho.

    totalOxygenProduction = 0;

    // Oxyfarms are enabled in large grids.
    if(gridSize == "large"){
        totalOxygenProduction = oxygenfarmProductionRate * oxygenfarmAmount;
    }

    totalAirventInput = airventInput * depresAirventAmount;

    pushStat("Oxy storage", totalOxygenStorage +" o2");
    pushStat("Oxy consumption", totalOxygenConsumption +" o2/s");
    pushStat("Oxy production", totalOxygenProduction +" o2/s");
    pushStat("Depres airvent input", totalAirventInput +" o2/s");

}

function calculateStats(){
    // Call all functions in sequence.

    oxygenTank();

    if(gridSize == "large"){
        oxygenFarms();
    }

    depresurisingAirvents();

    buildStatList(); // Keep this as last.
    emptyStatList(); // Empty list.

}

function oxygenTank(){

    if(!playersConsumeSameAir){

        pushStat("Oxygen consumption time", "No consumption no drain!");

        return false;

    }

    var consumptionTime = Math.round(totalOxygenStorage / totalOxygenConsumption);

    var formattedTime = formatSecondsToHumanReadable(consumptionTime);

    pushStat("Oxygen consumption time", formattedTime);

}

function oxygenFarms(){

    // Enough farms for enough players? Check if there are players, else reverse it, how many players can live on this amount of farms?
    if(totalOxygenProduction >= totalOxygenConsumption){

        // Can tanks be filled?
        var remainingOxygenGain = totalOxygenProduction - totalOxygenConsumption;

        if(remainingOxygenGain > 0){

            // How fast will tanks be filled?
            var totalFillingRate = totalOxygenProduction;

            // Is the player breathing this air aswell? If so correct for this.
            if(playersConsumeSameAir){
                totalFillingRate = totalOxygenProduction - totalOxygenConsumption;
            }

            var fillingTime     = Math.round(totalOxygenStorage / totalFillingRate);
            var formattedTime   = formatSecondsToHumanReadable(fillingTime);

            // How many players can be sustained by these farms?
            var totalSustainedPlayers = Math.floor(totalFillingRate / playerOxygenConsumption);

            pushStat("Oxygenfarms can sustain player count", playerCount +"/"+ totalSustainedPlayers);

            pushStat("Farms tank fill time", formattedTime); // Semantically this is second in value.

        }else{
            pushStat("Farms tank fill time", "evened out, 0");
        }

    }else if(playersConsumeSameAir){

        // How many farms are needed to fulfill player count requirements? % thingy?
        var oxygenfarmsRequired = Math.ceil(totalOxygenConsumption / totalOxygenProduction);

        pushStat("Oxygenfarms", "need more! ("+ oxygenfarmAmount +"/"+ oxygenfarmsRequired +")");

    }
}

function depresurisingAirvents(){

    // Calculat if its enough.
    if(totalAirventInput > totalOxygenConsumption){

        // pushStat("Oxygen consumption time", formattedTime);
        var totalAirventsPlayerSustain = Math.floor(totalAirventInput / playerOxygenConsumption);

        pushStat("Depres airvents", "enough "+ depresAirventAmount +"/"+ totalAirventsPlayerSustain +" players supported");

    }else{

        // Not enough!
        var airventsNeeded = Math.ceil(totalOxygenConsumption / airventInput);

        pushStat("Depres airvents", "need more! "+ depresAirventAmount +"/"+ airventsNeeded);

    }

}


/*--------------------------------------------Utility ---------------------------------------------------
* Functions designed to be used multiple times and assist in certain ways.
*/

function pushStat(text, value){

    var returnObject = {
        "text": text + ":",
        "value": value
    };

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
