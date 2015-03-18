angular.module('guttmacher', [])
.controller('guttmacher', function(
  $scope,
  $timeout
) {

  $scope.numOfBirths = {};
  $scope.numOfBirths.data = NumOfBirths;
  $scope.numOfBirths.show = 'All';

  $scope.numOfBirths.maps = {};
  $scope.numOfBirths.maps['All'] = {
    id: 'num-of-births-all',
    total: NumOfBirths['Total']['Number of births - All'],
    render: function () {
      renderMap(NumOfBirths, '#num-of-births-all .map', 'Number of births - All', this.ranges, function (geography, data) {
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
        title: '$25 - 100 million',
        range: [0, 25000],
        fill: '#F7AC8F'
      },
      {
        title: '$100 - 400 million',
        range: [25000, 75000],
        fill: '#E16B42',

      },
      {
        title: '$400 - 800 million',
        range: [75000, 200000],
        fill: '#C65127'
      },
      {
        title: '$800 million - 3 billion',
        range: [200000, 550000],
        fill: '#7F2B18'
      }
    ]
  };

  // $scope.numOfBirths.maps['Planned'] = {
  //   id: 'num-of-births-planned',
  //   total: NumOfBirths['Total']['Number of births - Planned'],
  //   render: function () {
  //     renderMap(NumOfBirths, '#num-of-births-planned .map', 'Number of births - Planned', function (geography, data) {
  //       return [
  //         '<div class="hoverinfo text-sm">',
  //           'Number of Planned Births in ',
  //           geography.properties.name,
  //           ': ',
  //           data['Number of births - Planned'],
  //         '</div>'
  //       ].join('');
  //     });
  //   }
  // };

  // $scope.numOfBirths.maps['Unplanned'] = {
  //   id: 'num-of-births-unplanned',
  //   total: NumOfBirths['Total']['Number of births - Unplanned'],
  //   render: function () {
  //     renderMap(NumOfBirths, '#num-of-births-unplanned .map', 'Number of births - Unplanned', function (geography, data) {
  //       return [
  //         '<div class="hoverinfo text-sm">',
  //           'Number of Unplanned Births in ',
  //           geography.properties.name,
  //           ': ',
  //           data['Number of births - Unplanned'],
  //         '</div>'
  //       ].join('');
  //     });
  //   }
  // };

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
          console.log(key, value)
          _.each(fillRanges, function(fillRange) {
            console.log(fillRange.range[0], fillRange.range[1])
            if (_.inRange(value, fillRange.range[0], fillRange.range[1])) fill = fillRange.fill;
          });
          console.log(fill)

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