angular.module('guttmacher', [])
.controller('guttmacher', function(
  $scope,
  $timeout
) {

  $scope.numOfBirths = {};
  $scope.numOfBirths.data = NumOfBirths;
  $scope.numOfBirths.show = 'Total';

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
        title: '25 - 75,000 Births',
        range: [25000, 75000],
        fill: '#E16B42',

      },
      {
        title: '75 - 200,000 Births',
        range: [75000, 200000],
        fill: '#C65127'
      },
      {
        title: 'More than 200,000 Births',
        range: [200000, Infinity],
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
        title: 'Less than 20,000 Births',
        range: [0, 20000],
        fill: '#F7AC8F'
      },
      {
        title: '20 - 80,000 Births',
        range: [20000, 80000],
        fill: '#E16B42',

      },
      {
        title: '80 - 160,000 Births',
        range: [80000, 160000],
        fill: '#C65127'
      },
      {
        title: 'More than 160,000 Births',
        range: [160000, Infinity],
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
        title: 'Less than 15,000 Births',
        range: [0, 15000],
        fill: '#F7AC8F'
      },
      {
        title: '15 - 50,000 Births',
        range: [15000, 50000],
        fill: '#E16B42',

      },
      {
        title: '50 - 100,000 Births',
        range: [50000, 100000],
        fill: '#C65127'
      },
      {
        title: 'More than 100,000 Births',
        range: [100000, Infinity],
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

  var renderMap = function (data, selector, propName, fillRanges, popup) {
    console.log(this, this.ranges)
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

      var fills = (function() {
        var fill = "";

        var _fills = {};

        _.each(data, function(item, key) {
          var fill = '';
          var value = util.extractInteger(item[propName]);
          _.each(ranges, function(fillRange) {
            console.log(fillRange)
            if (_.inRange(value, fillRange.range[0], fillRange.range[1])) fill = fillRange.fill;
          });

          _fills[key] = fill;
        })

        return _fills;
      })();

      map.updateChoropleth(fills);

      $timeout(function() {
        map.labels();
      }, 100)
    }, 10);
  }

});