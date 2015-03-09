$(function() {
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

  function renderMap (data, selector, propName, popup) {
    var map = new Datamap({
      scope: 'usa',
      element: $(selector)[0],
      geographyConfig: {
        borderColor: '#FFFFFF',
        highlightBorderColor: '#FFFFFF',
        highlightFillColor: '#236467',
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
        _fills[key] = util.lightenColor(maxColor, percent * percent * percent * 30);
      })

      return _fills;
    })();

    map.updateChoropleth(fills);
  }

  renderMap(NumOfBirths, '#num-of-births', 'Number of births - All', function (geography, data) {
    return [
      '<div class="hoverinfo text-sm">',
        'Number of Births in ',
        geography.properties.name,
        ': ',
        data['Number of births - All'],
      '</div>'
    ].join('');
  });

  renderMap(NumOfBirths, '#num-of-planned-births', 'Number of births - Planned', function (geography, data) {
    return [
      '<div class="hoverinfo text-sm">',
        'Number of Planned Births in ',
        geography.properties.name,
        ': ',
        data['Number of births - Planned'],
      '</div>'
    ].join('');
  });

  renderMap(NumOfBirths, '#num-of-unplanned-births', 'Number of births - Unplanned', function (geography, data) {
    return [
      '<div class="hoverinfo text-sm">',
        'Number of Unplanned Births in ',
        geography.properties.name,
        ': ',
        data['Number of births - Unplanned'],
      '</div>'
    ].join('');
  });

  renderMap(CostPerBirth, '#cost-per-birth-total', 'Total', function (geography, data) {
    return [
      '<div class="hoverinfo text-sm">',
        'Total cost in ',
        geography.properties.name,
        ': $',
        data['Total'],
      '</div>'
    ].join('');
  });
});