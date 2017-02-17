var statList = [];

// Field values/user input.
var playerCount;
var gridSize;
var oxygenTankAmount;
var playerItemOxygenBottleAmount;
var oxygenfarmAmount;
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

        setBaseStats();
        calculateStats();

    });

    // Set onClick event.
    $('input[name="gridRadios"]').click(function(){

        gridSize = $(this).val();

        if(gridSize == "large"){

            $('oxygenfarmAmount').prop("disabled",true);

        }else{

            //@TODO Enabling doesnt work...
            $('oxygenfarmAmount').prop("disabled",false);
            $('oxygenfarmAmount').removeAttr("disabled");

        }

    });

});

function setBaseStats(){

    // Field values/user input.
    playerCount                     = $('#playerCount').val();
    gridSize                        = $('input[name="gridRadios"]:checked').val();
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

    totalOxygenProduction =0;

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

    oxygenStats();

    if(gridSize == "large"){
        oxygenFarms();
    }

    depresurisingAirvents();

    buildStatList(); // Keep this as last.
    emptyStatList(); // Empty list.

}

function oxygenStats(){

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

        console.log(remainingOxygenGain);

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
        var airventsNeeded = Math.ceil(totalConsumption / airventInput);

        pushStat("Depres airvents", "need more! "+ depresAirventAmount +"/"+ airventsNeeded);

    }

}

function oxygenGeneratorProduction(){

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

    $('#stat-list').empty();

    //@TODO build stat list..!
    $.each(statList, function(key, obj) {

        // var html = "<tr><td>"+ key +"</td><td>"+ value +"</td></tr>";
        var html = "<tr><td>"+ obj.text +"</td><td>"+ obj.value +"</td></tr>";

        $('#stat-list').append(html);

    });
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
