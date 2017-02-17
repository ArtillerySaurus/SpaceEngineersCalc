var version = "";

var gravity = 9.83;
var playerOxygenConsumption = 0.063;

var partInfo = {
    "grids": {
        "large": {
            "oxygenTank": {
                "storage": 100000
            },
            "oxygenFarm": {
                "production": 0.03
            },
            "airvent": {
                "output": 300,
                "input": 300
            }
        },
        "small": {
            "oxygenTank": {
                "storage": 50000
            },
            "airvent": {
                "output": 300,
                "input": 300
            }
        }
    },
    "playerItems": {
        "oxygenBottle": {
            "storage": 100
        }
    }
};
