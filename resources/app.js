angular.module('guttmacher', [])
.controller('guttmacher', function(
  $scope,
  $timeout,
  $window
) {

  $scope.numOfBirths = {};
  $scope.numOfBirths.data = NumOfBirths;
  $scope.numOfBirths.show = 'Unplanned';

  $scope.numOfBirths.maps = {};
  $scope.numOfBirths.maps['Total'] = {
    id: 'num-of-births-all',
    total: NumOfBirths['Total']['Number of births - All'],
    render: function () {
      renderMap.bind(this)(NumOfBirths, '#num-of-births-all .map', 'Number of births - All', this.ranges, function (geography, data) {
        return [
          '<div class="hoverinfo text-sm">',
            'Number of Births in ',
            geography.properties.name,
            ': ',
            data['Number of births - All'],
          '</div>'
        ].join('');
      });
    },
    ranges: [
      {
        title: 'Less than 25,000 Births',
        range: [0, 25000],
        fill: '#F7AC8F'
      },
      {
        title: '25 - 60,000 Births',
        range: [25000, 60000],
        fill: '#E16B42',

      },
      {
        title: '60 - 110,000 Births',
        range: [60000, 110000],
        fill: '#C65127'
      },
      {
        title: 'More than 110,000 Births',
        range: [110000, Infinity],
        fill: '#7F2B18'
      }
    ]
  };

  $scope.numOfBirths.maps['Planned'] = {
    id: 'num-of-births-planned',
    total: NumOfBirths['Total']['Number of births - Planned'],
    render: function () {
      renderMap.bind(this)(NumOfBirths, '#num-of-births-planned .map', 'Number of births - Planned', this.ranges, function (geography, data) {
        return [
          '<div class="hoverinfo text-sm">',
            'Number of Planned Births in ',
            geography.properties.name,
            ': ',
            data['Number of births - Planned'],
          '</div>'
        ].join('');
      });
    },
    ranges: [
      {
        title: 'Less than 15,000 Births',
        range: [0, 15000],
        fill: '#F7AC8F'
      },
      {
        title: '15 - 40,000 Births',
        range: [15000, 40000],
        fill: '#E16B42',

      },
      {
        title: '40 - 80,000 Births',
        range: [40000, 80000],
        fill: '#C65127'
      },
      {
        title: 'More than 80,000 Births',
        range: [80000, Infinity],
        fill: '#7F2B18'
      }
    ]
  };

  $scope.numOfBirths.maps['Unplanned'] = {
    id: 'num-of-births-unplanned',
    total: NumOfBirths['Total']['Number of births - Unplanned'],
    render: function () {
      renderMap.bind(this)(NumOfBirths, '#num-of-births-unplanned .map', 'Number of births - Unplanned', this.ranges, function (geography, data) {
        return [
          '<div class="hoverinfo text-sm">',
            'Number of Unplanned Births in ',
            geography.properties.name,
            ': ',
            data['Number of births - Unplanned'],
          '</div>'
        ].join('');
      });
    },
    ranges: [
      {
        title: 'Less than 12,500 Births',
        range: [0, 12500],
        fill: '#F7AC8F'
      },
      {
        title: '12.5 - 25,000 Births',
        range: [12500, 25000],
        fill: '#E16B42',

      },
      {
        title: '25 - 50,000 Births',
        range: [25000, 50000],
        fill: '#C65127'
      },
      {
        title: 'More than 50,000 Births',
        range: [50000, Infinity],
        fill: '#7F2B18'
      }
    ]
  };

  var util = {};
  util.extractInteger = function (str) {
    return parseFloat(str.replace( /\D+/g, ''));
  };
  util.lightenColor = function (color, percent) {
    color = (color[0] === '#') ? color.slice(1) : color;
    var num = parseInt(color,16);
    var amt = Math.round(2.55 * percent);
    var R = (num >> 16) + amt;
    var G = (num >> 8 & 0x00FF) + amt;
    var B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
  };

  util.invertObject = function (obj) {
    var newObject = {};
    var prop;

    for (prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (newObject[obj[prop]] === undefined) {
          newObject[obj[prop]] = [];
        } else {
          newObject[obj[prop]].push(prop)
        }
      }
    }

    return newObject;
  };

  util.generateFillHash = function (data, ranges, propName) {
      var fill = "";

      var _fillHash = {};

      _.each(data, function(item, key) {
        var fill = '';
        var value = util.extractInteger(item[propName]);
        _.each(ranges, function(fillRange) {
          if (_.inRange(value, fillRange.range[0], fillRange.range[1])) fill = fillRange.fill;
        });

        _fillHash[key] = fill;
      })

      return _fillHash;
  }

  var renderMap = function (data, selector, propName, fillRanges, popup) {
    var ranges = this.ranges;
    $timeout(function() {
      var map = new Datamap({
        scope: 'usa',
        element: $(selector)[0],
        geographyConfig: {
          borderColor: '#FFFFFF',
          highlightBorderColor: '#FFFFFF',
          highlightFillColor: '#527E80',
          popupTemplate: popup,
          highlightBorderWidth: 1
        },
        data: data,
        fills: {
          defaultFill: '#FFFFFF'
        }
      });

      var chloroplethHash = util.generateFillHash(data, ranges, propName);

      var keysByRange = util.invertObject(chloroplethHash);

      var groupedByRange = {};

      _.each(keysByRange, function(items, key) {
        groupedByRange[key] = [];
        _.each(items, function (stateKey) {
          var state = {
            name: data[stateKey].fullName,
            value: data[stateKey][propName]
          };
          groupedByRange[key].push(state)
        });
      });


      this.groupedByRange = groupedByRange;

      console.log(chloroplethHash, keysByRange, groupedByRange)

      map.updateChoropleth(chloroplethHash);

      // $timeout(function() {
        // map.labels();
      // }, 100)
    }.bind(this), 10);
  }

  // Dev
  $window.logScope = function () {
      $window.$scope = $scope;
      console.log($scope);
  };
});