var version = "";

var gravity = 9.83;

var gameInfo = {
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
            },
            "hydrogenTank": {
                "storage": 2500000
            },
            "largeHydrogenThruster": {
                "consumption": 6426.7,
                "consumptionType": "hydrogen"
            },
            "smallHydrogenThruster": {
                "consumption": 514.1,
                "consumptionType": "hydrogen"
            }
        },
        "small": {
            "oxygenTank": {
                "storage": 50000
            },
            "airvent": {
                "output": 300,
                "input": 300
            },
            "hydrogenTank": {
                "storage": 80000
            },
            "largeHydrogenThruster": {
                "consumption": 1092.5,
                "consumptionType": "hydrogen"
            },
            "smallHydrogenThruster": {
                "consumption": 109.2,
                "consumptionType": "hydrogen"
            }
        },
        "player": {
            "oxygenConsumption": 0.063,
            "hydrogenConsumption": 0.063,
            "oxygenBottle": {
                "storage": 100
            },
            "hydrogenBottle": {
                "storage": 1000
            },
            "oxygenTank": {
                "storage": 60
            },
            "hydrogenTank": {
                "storage": 125
            }
        }
    }
};
