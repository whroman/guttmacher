angular.module('guttmacher', [])
.controller('guttmacher', function(
  $scope,
  $timeout,
  $window
) {
  var util = {};
  util.toArray = function (object) {
    return _.toArray(object);
  };

  util.extractInteger = function (str) {
    return parseFloat(str.replace( /\D+/g, ''));
  };

  util.invertObject = function (obj) {
    var newObject = {};
    var prop;

    for (prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (newObject[obj[prop].color] === undefined) {
          newObject[obj[prop].color] = [];
        } else {
          newObject[obj[prop].color].push(prop)
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


        _fillHash[key] = data[key];
        _fillHash[key].color = fill;
        _fillHash[key].prop = propName;
      })

      return _fillHash;
  };



  $scope.util = util;

  $scope.numOfBirths = {};
  $scope.numOfBirths.data = NumOfBirths;
  $scope.numOfBirths.show = 'Total';
  $scope.numOfBirths.legend = '';

  $scope.numOfBirths.mouseover = function (selector) {
    $('.datamaps-hoverover').addClass('hidden');
    $('#num-of-births path.' + selector).d3Trigger('mouseover');
  };

  $scope.numOfBirths.mouseout = function (selector) {
    $('.datamaps-hoverover').removeClass('hidden');
    $('#num-of-births path.' + selector).d3Trigger('mouseout');
  };

  $scope.numOfBirths.selectMap = function (name) {
    var map = this.maps[name];
    this.show = name;
    var legend = map.ranges[3].title;
    this.legend = legend;
    map.update();
  };

  $scope.numOfBirths.render = function () {
    renderMap.bind(this)(NumOfBirths, '#num-of-births.map', function (geography, data) {
      return [
        '<div class="hoverinfo text-sm">',
          'Number of Births in ',
          geography.properties.name,
          ': ',
          data[data.prop],
        '</div>'
      ].join('');
    });
  }

  $scope.numOfBirths.maps = {};
  $scope.numOfBirths.maps['Total'] = {
    name: 'Total',
    id: 'num-of-births-all',
    prop: 'Number of births - All',
    total: util.extractInteger(NumOfBirths['Total']['Number of births - All']),
    displayTotal: NumOfBirths['Total']['Number of births - All'],
    update: function () {
      updateMap.bind($scope.numOfBirths)('Total');
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
    name: 'Planned',
    id: 'num-of-births-planned',
    prop: 'Number of births - Planned',
    total: util.extractInteger(NumOfBirths['Total']['Number of births - Planned']),
    displayTotal: NumOfBirths['Total']['Number of births - Planned'],
    update: function () {
      updateMap.bind($scope.numOfBirths)('Planned');
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
    name: 'Unplanned',
    id: 'num-of-births-unplanned',
    prop: 'Number of births - Unplanned',
    total: util.extractInteger(NumOfBirths['Total']['Number of births - Unplanned']),
    displayTotal: NumOfBirths['Total']['Number of births - Unplanned'],
    update: function () {
      updateMap.bind($scope.numOfBirths)('Unplanned');
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

  var updateMap = function (name) {
      var data = this.data
      var ranges = this.maps[name].ranges;
      var propName = this.maps[name].prop
      var map = this.map;
      var chloroplethHash = util.generateFillHash(data, ranges, propName);

      var keysByRange = util.invertObject(chloroplethHash);

      var groupedByRange = {};

      _.each(keysByRange, function(items, key) {
        groupedByRange[key] = [];
        _.each(items, function (stateKey) {
          var state = {
            fullName: data[stateKey].fullName,
            abbreviatedName: data[stateKey].abbreviatedName,
            displayValue: data[stateKey][propName],
            value: util.extractInteger(data[stateKey][propName])
          };
          groupedByRange[key].push(state)
        });
      });

      this.maps[name].groupedByRange = groupedByRange;

      map.updateChoropleth(chloroplethHash);
  };

  var renderMap = function (data, selector, popup) {
    this.map = new Datamap({
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

  }

  $timeout(function() {
    $scope.numOfBirths.render();
    $scope.numOfBirths.selectMap('Total');
  }.bind(this), 100);

  // Dev
  $window.logScope = function () {
      $window.$scope = $scope;
  };
});

jQuery.fn.d3Trigger = function (eventName) {
  this.each(function (i, e) {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent(eventName, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    e.dispatchEvent(evt);
  });
};