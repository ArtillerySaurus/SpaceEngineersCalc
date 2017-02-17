var statList = [];
// var questionCount = 3; // Used to calculate progress. If not used, get all fields, loop and find values.


// On document ready.
$(document).ready(function(){

    // Set onClick event.
    $('#calculate-stats').click(function(){

        calculateStats();

    });

    // // Set multiple fields events.
    // $('.playerCount').change(function(){
    //
    //     if(document.getElementById('autofillDuplicateFields').checked){
    //
    //         var oldVal = $(this).val();
    //         $('.playerCount').val(oldVal);
    //
    //     }
    // })
    //
    // // Set multiple fields events.
    // $('.largeGridOxygenTank').change(function(){
    //
    //     if(document.getElementById('autofillDuplicateFields').checked){
    //
    //         var oldVal = $(this).val();
    //         $('.largeGridOxygenTank').val(oldVal);
    //
    //     }
    // })

});



function calculateStats(){
    // Call all functions in sequence.

    oxygenStats();
    oxygenFarms();
    deresurisingAirvents();


    buildStatList(); // Keep this as last.
    emptyStatList(); // Empty list.

}

function oxygenStats(){

    var largeGridOxygenTankStorage      = partInfo.grids.large.oxygenTank.storage;
    var smallGridOxygenTankStorage      = partInfo.grids.small.oxygenTank.storage;
    var playerItemOxygenBottleStorage   = partInfo.playerItems.oxygenBottle.storage;

    var playerCount                     = $('#playerCount').val();
    var largeGridOxygenTankAmount       = $('#largeGridOxygenTank').val();
    var smallGridOxygenTankAmount       = $('#smallGridOxygenTank').val();
    var playerItemOxygenBottleAmount    = $('#playerItemOxygenBottle').val();

    // Calculations.
    var totalConsumption    = playerOxygenConsumption * playerCount;
    var totalStorage        = (largeGridOxygenTankStorage * largeGridOxygenTankAmount);
    totalStorage            += (smallGridOxygenTankStorage * smallGridOxygenTankAmount);
    totalStorage            += (playerItemOxygenBottleStorage * playerItemOxygenBottleAmount);

    var consumptionTime = Math.round(totalStorage / totalConsumption);

    var formattedTime = formatSecondsToHumanReadable(consumptionTime);

    pushStat("Oxygen consumption time", formattedTime);

}

function oxygenFarms(){
    var oxygenfarmProductionRate    = partInfo.grids.large.oxygenFarm.production;
    var largeGridOxygenTankStorage  = partInfo.grids.large.oxygenTank.storage;

    var playerCount                 = $('#playerCount').val();
    var oxygenfarmAmount            = $('#oxygenFarmAmount').val();
    var largeGridOxygenTankAmount   = $('#largeGridOxygenTank').val();

    // Calculations.
    var totalConsumption    = playerOxygenConsumption * playerCount;
    var totalProduction     = oxygenfarmProductionRate * oxygenfarmAmount;

    // Enough farms for enough players? Check if there are players, else reverse it, how many players can live on this amount of farms?
    if(totalProduction >= totalConsumption){

        // pushStat("Oxygenfarm", "enough");

        // Can tanks be filled?
        var remainingOxygenGain = totalProduction - totalConsumption;

        if(remainingOxygenGain > 0){

            // How fast will tanks be filled?
            //@TODO Are oxygen bottles excluded from this?
            var totalStorage        = (largeGridOxygenTankStorage * largeGridOxygenTankAmount);
            var totalFillingRate    = totalProduction;

            // Is the player breathing this air aswell? If so correct for this.
            if(document.getElementById('playersConsumeSameAirAsTanks').checked){
                totalFillingRate = totalProduction - totalConsumption;
            }

            var fillingTime     = Math.round(totalStorage / totalFillingRate);
            var formattedTime   = formatSecondsToHumanReadable(fillingTime);

            // How many players can be sustained by these farms?
            var totalSustainedPlayers = Math.floor(totalProduction / playerOxygenConsumption);

            pushStat("Oxygenfarms can sustain player count", playerCount +"/"+ totalSustainedPlayers);

            pushStat("Farms tank fill time", formattedTime); // Semantically this is second in value.

        }else{
            pushStat("Farms tank fill time", "evened out, 0");
        }

    }else{

        // How many farms are needed to fulfill player count requirements? % thingy?
        var oxygenfarmsRequired = Math.ceil(totalConsumption / oxygenfarmProductionRate);

        pushStat("Oxygenfarms", "Need more! ("+ oxygenfarmAmount +"/"+ oxygenfarmsRequired +")");

    }
}

function deresurisingAirvents(){

    var airventInput = partInfo.grids.large.airvent.input; // Airvents currently have the same input and output per grid.

    var playerCount     = $('#playerCount').val();
    var airventAmount   = $('#airventsDepresurise').val();

    // Calculations.
    var totalConsumption    = playerOxygenConsumption * playerCount;
    var totalAirventInput   = airventInput * airventAmount;
    var totalGain           = totalAirventInput - totalConsumption;

    // Calculat if its enough.
    if(totalAirventInput > totalConsumption){

        // pushStat("Oxygen consumption time", formattedTime);
        var totalAirventsPlayerSustain = Math.floor(totalAirventInput / playerOxygenConsumption);

        pushStat("Depres airvents can support you", airventAmount +"/"+ totalAirventsPlayerSustain +" players supported");

    }else{

        // Not enough!
        var airventsNeeded = Math.ceil(totalConsumption / airventInput);

        pushStat("Airvents can't support you", airventAmount +"/"+ airventsNeeded);

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
