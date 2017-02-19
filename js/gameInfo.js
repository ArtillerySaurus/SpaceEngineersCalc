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
                "consumptionType": "hydrogen",
                "maximumThrust": 6000
            },
            "smallHydrogenThruster": {
                "consumption": 514.1,
                "consumptionType": "hydrogen",
                "maximumThrust": 900
            },
            "largeAtmosphericThruster": {
                "consumption": 0,
                "consumptionType": "power",
                "maximumThrust": 5400
            },
            "smallAtmosphericThruster": {
                "consumption": 0,
                "consumptionType": "power",
                "maximumThrust": 420
            },
            "largeIonThruster": {
                "consumption": 0,
                "consumptionType": "power",
                "maximumThrust": 3600
            },
            "smallIonThruster": {
                "consumption": 0,
                "consumptionType": "power",
                "maximumThrust": 288
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
                "consumptionType": "hydrogen",
                "maximumThrust": 400
            },
            "smallHydrogenThruster": {
                "consumption": 109.2,
                "consumptionType": "hydrogen",
                "maximumThrust": 82
            },
            "largeAtmosphericThruster": {
                "consumption": 0,
                "consumptionType": "power",
                "maximumThrust": 408
            },
            "smallAtmosphericThruster": {
                "consumption": 0,
                "consumptionType": "power",
                "maximumThrust": 80
            },
            "largeIonThruster": {
                "consumption": 0,
                "consumptionType": "power",
                "maximumThrust": 144
            },
            "smallIonThruster": {
                "consumption": 0,
                "consumptionType": "power",
                "maximumThrust": 12
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
    },
    "planets":{
        "earth": {
            "maxGravitationalPull": 0,
            "maxGravitationalPullAltitude": 35000,
            "maxAtmosphereAltitude": 7000
        }
    }
};
