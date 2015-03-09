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
      renderMap(NumOfBirths, '#num-of-births-all .map', 'Number of births - All', function (geography, data) {
        return [
          '<div class="hoverinfo text-sm">',
            'Number of Births in ',
            geography.properties.name,
            ': ',
            data['Number of births - All'],
          '</div>'
        ].join('');
      });
    }
  };

  $scope.numOfBirths.maps['Planned'] = {
    id: 'num-of-births-planned',
    total: NumOfBirths['Total']['Number of births - Planned'],
    render: function () {
      renderMap(NumOfBirths, '#num-of-births-planned .map', 'Number of births - Planned', function (geography, data) {
        return [
          '<div class="hoverinfo text-sm">',
            'Number of Planned Births in ',
            geography.properties.name,
            ': ',
            data['Number of births - Planned'],
          '</div>'
        ].join('');
      });
    }
  };

  $scope.numOfBirths.maps['Unplanned'] = {
    id: 'num-of-births-unplanned',
    total: NumOfBirths['Total']['Number of births - Unplanned'],
    render: function () {
      renderMap(NumOfBirths, '#num-of-births-unplanned .map', 'Number of births - Unplanned', function (geography, data) {
        return [
          '<div class="hoverinfo text-sm">',
            'Number of Unplanned Births in ',
            geography.properties.name,
            ': ',
            data['Number of births - Unplanned'],
          '</div>'
        ].join('');
      });
    }
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

  var renderMap = function (data, selector, propName, popup) {
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
        var _fills = {};
        var maxColor = "#7f2b18"

        var maxVal = util.extractInteger(_.max(data, function(item) {
          return util.extractInteger(item[propName]);
        })[propName]);

        var minVal = util.extractInteger(_.min(data, function(item) {
          return util.extractInteger(item[propName]);
        })[propName]);

        _.each(data, function(val, key) {
          var numerator = util.extractInteger(val[propName]) - minVal;
          var denomenator = maxVal - minVal;
          var percent = 1 - numerator / denomenator;
          var lighten = Math.pow(percent, 10) * 60;
          _fills[key] = util.lightenColor(maxColor, lighten);
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