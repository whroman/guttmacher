var fs = require('fs');

function extractInteger (str) {
  return parseFloat(str.replace( /\D+/g, ''));
};

function parseNumOfBirths (file) {
    var data = fs.readFileSync(file);
    var parsedJSON = {};
    data = data.toString().split('\n');

    data.forEach(function(item) {
      var item = item.split(' ');
      var state = item[0];

      if (item.length === 11) {
        state = item[0] + ' ' + item[1];
        item.shift();
      } else if (item.length === 12) {
        state = item[0] + ' ' + item[1] + ' ' + item[2];
        item.shift();
        item.shift();
      }

      var abbreviatedStateName = statesMap[state] || state;
      parsedJSON[abbreviatedStateName] = {
          "Number of births - All": item[1],
          "Number of births - Unplanned": item[2],
          "Number of births - Planned": item[3],
          "Percent that were publicly funded - All": item[4],
          "Percent that were publicly funded - Unplanned": item[5],
          "Percent that were publicly funded - Planned": item[6],
          "Number that were publicly funded - All": item[7],
          "Number that were publicly funded - Unplanned": item[8],
          "Number that were publicly funded - Planned": item[9],
          abbreviatedName: abbreviatedStateName,
          fullName: state
      }
    });

    return parsedJSON;
}

function parseCostPerBirth (file) {
    var data = fs.readFileSync(file);
    var parsedJSON = {};
    data = data.toString().split('\n');

    data.forEach(function(item) {
      var item = item.split(' ');
      var state = item[0];

      if (item.length === 6) {
        state = item[0] + ' ' + item[1];
        item.shift();
      } else if (item.length === 7) {
        state = item[0] + ' ' + item[1] + ' ' + item[2];
        item.shift();
      }

      state = statesMap[state] || state;
      parsedJSON[state] = {
          "Maternity and Months 1-12": item[1],
          "Months 13-60": item[2],
          "Total": item[3],
          "Miscarriage": item[4],
      }
    });

    return parsedJSON;
}

var statesMap = {
  "Alabama": "AL",
  "Alaska": "AK",
  "American Samoa": "AS",
  "Arizona": "AZ",
  "Arkansas": "AR",
  "California": "CA",
  "Colorado": "CO",
  "Connecticut": "CT",
  "Delaware": "DE",
  "District of Columbia": "DC",
  "Federated States Of Micronesia": "FM",
  "Florida": "FL",
  "Georgia": "GA",
  "Guam": "GU",
  "Hawaii": "HI",
  "Idaho": "ID",
  "Illinois": "IL",
  "Indiana": "IN",
  "Iowa": "IA",
  "Kansas": "KS",
  "Kentucky": "KY",
  "Louisiana": "LA",
  "Maine": "ME",
  "Marshall Islands": "MH",
  "Maryland": "MD",
  "Massachusetts": "MA",
  "Michigan": "MI",
  "Minnesota": "MN",
  "Mississippi": "MS",
  "Missouri": "MO",
  "Montana": "MT",
  "Nebraska": "NE",
  "Nevada": "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  "Northern Mariana Islands": "MP",
  "Ohio": "OH",
  "Oklahoma": "OK",
  "Oregon": "OR",
  "Palau": "PW",
  "Pennsylvania": "PA",
  "Puerto Rico": "PR",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  "Tennessee": "TN",
  "Texas": "TX",
  "Utah": "UT",
  "Vermont": "VT",
  "Virgin Islands": "VI",
  "Virginia": "VA",
  "Washington": "WA",
  "West Virginia": "WV",
  "Wisconsin": "WI",
  "Wyoming": "WY"
};

var numOfBirths = parseNumOfBirths('./raw/num-of-births.txt');
var costPerBirth = parseCostPerBirth('./raw/cost-per-birth.txt');

fs.writeFileSync('./JSON/numOfBirths.json', JSON.stringify(numOfBirths));
fs.writeFileSync('./JSON/costPerBirth.json', JSON.stringify(costPerBirth));
