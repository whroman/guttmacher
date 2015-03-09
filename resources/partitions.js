$(function() {
    var states = {
        "AL": "Alabama",
        "AK": "Alaska",
        "AS": "American Samoa",
        "AZ": "Arizona",
        "AR": "Arkansas",
        "CA": "California",
        "CO": "Colorado",
        "CT": "Connecticut",
        "DE": "Delaware",
        "DC": "District Of Columbia",
        "FM": "Federated States Of Micronesia",
        "FL": "Florida",
        "GA": "Georgia",
        "GU": "Guam",
        "HI": "Hawaii",
        "ID": "Idaho",
        "IL": "Illinois",
        "IN": "Indiana",
        "IA": "Iowa",
        "KS": "Kansas",
        "KY": "Kentucky",
        "LA": "Louisiana",
        "ME": "Maine",
        "MH": "Marshall Islands",
        "MD": "Maryland",
        "MA": "Massachusetts",
        "MI": "Michigan",
        "MN": "Minnesota",
        "MS": "Mississippi",
        "MO": "Missouri",
        "MT": "Montana",
        "NE": "Nebraska",
        "NV": "Nevada",
        "NH": "New Hampshire",
        "NJ": "New Jersey",
        "NM": "New Mexico",
        "NY": "New York",
        "NC": "North Carolina",
        "ND": "North Dakota",
        "MP": "Northern Mariana Islands",
        "OH": "Ohio",
        "OK": "Oklahoma",
        "OR": "Oregon",
        "PW": "Palau",
        "PA": "Pennsylvania",
        "PR": "Puerto Rico",
        "RI": "Rhode Island",
        "SC": "South Carolina",
        "SD": "South Dakota",
        "TN": "Tennessee",
        "TX": "Texas",
        "UT": "Utah",
        "VT": "Vermont",
        "VI": "Virgin Islands",
        "VA": "Virginia",
        "WA": "Washington",
        "WV": "West Virginia",
        "WI": "Wisconsin",
        "WY": "Wyoming"
    }

    var events = {
        onPathMouseover: function(d, graph) {
            graph.paths
                // Fade all fill colors
                .classed("faded", true)
                // Highlight only those that are an ancestor of the current segment
                .filter(function(node) {
                    var ancestors = D3Partitions.getNodeAncestors(d, node);
                    return ancestors;
                })
                .classed("faded", false);

            graph.info.update(d);
        }
    };

    function InfoPanel ($wrapper) {
        var $panel = $wrapper.find("[info]"),
            $primary = $wrapper.find("[primary]"),
            $primaryTitle = $primary.find("[title]"),
            $primaryValue = $primary.find("[value]"),
            $secondary = $wrapper.find("[secondary]"),
            $secondaryTitle = $secondary.find("[title]"),
            $secondaryValue = $secondary.find("[value]"),
            classHidden = "hidden";

        function updatePrimary(node) {
            $primaryTitle.html(states[node.title]);
            $primaryValue.text((node.value).toLocaleString());
        }

        function updateSecondary(node) {
            $secondary.removeClass(classHidden);
            $secondaryTitle.text(node.title);
            $secondaryValue.text((node.value).toLocaleString());
        }

        function update(d) {
            if (d.depth === 1) {
                $secondary.addClass(classHidden);
                updatePrimary(d);
            } else if (d.depth === 2) {
                updatePrimary(d.parent);
                updateSecondary(d);
            }
        }

        function hide() {
            $panel.addClass(classHidden);
        }

        return {
            update: update
        };
    }

    var D3Partitions = function() {
        var graphs = {},
            width = 650,
            height = 650,
            radius = Math.min(width, height) / 2,
            svgCenter = "translate(" + width / 2 + "," + height / 2 + ")";

        var partition = d3.layout.partition()
            .size([2 * Math.PI, radius * radius]);

        var arc = d3.svg.arc()
            .startAngle(function(d) { return d.x; })
            .endAngle(function(d) { return d.x + d.dx; })
            .innerRadius(function(d) { return Math.sqrt(d.y); })
            .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

        function renderGraph(graph) {
            // Render <path> els
            graph.paths = graph.svg.datum(graph.json).selectAll("path")
                .data(D3Partitions.partition.nodes)
                .enter()
                .append("path");

            // Style <path> els
            graph
                .paths
                .attr("display", function(d) {
                    return d.depth === 0 ? "none" : null; // hide inner ring
                })
                .attr("class", function(d) {
                    var _class = ["depth-" + d.depth];
                    if (d.depth > 0) {
                        _class.push(d.title);
                    }

                    return _class.join(' ');
                })
                .attr("for", function(d) {
                    console.log(d.title, d.depth)
                    if (d.depth == 1) {
                        return d.title;
                    } else if (d.depth == 2) {
                        return d.parent.title;
                    }
                })
                .attr("d", D3Partitions.arc);

            // Load graph with one highlighted <path>
            var path = graph.wrapper.select("path.depth-2");
            if (path[0][0]) {
                events.onPathMouseover(path[0][0].__data__, graph);
            }
        }

        function attachGraphEvents(graph) {
            graph.paths.on("mouseover", function(data) {
                events.onPathMouseover(data, graph);
            });  

            return this;
        }

        function render(sel) {
            var elements = $(sel),
                i = 0,
                elementsLen = elements.length;

            for ( i; i < elementsLen; i++ ) {
                var el = elements[i];
                var graph = createGraphObject(el);

                D3Partitions.graphs[graph.jsonPath] = graph;

                $.getJSON(graph.jsonPath)
                .success(jsonRequestCB);
            }
            return this;
        }

        function createGraphObject(el) {
            var $el = $(el);
            var wrapper = d3.select(el);
            var jsonPath = wrapper.attr("data-source");
            var $sources = $("[data-source='" + jsonPath + "']");
            var svg = wrapper.select("[graph]")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", svgCenter);

            var graph = {
                wrapper: wrapper,
                json: null, // To be filled by AJAX request
                jsonPath: jsonPath,
                svg: svg,
                $sources: $sources,
                info: new InfoPanel($el)
            };

            return graph;
        }

        function jsonRequestCB(json) {
            var key = this.url;
            var graph = D3Partitions.graphs[key];
            graph.json = json;
            renderGraph(graph);
            attachGraphEvents(graph);
        }

        function getNodeAncestors(node, currentNode) {
            var ancestors = [];
            var whileNode = node;
            while (whileNode.parent) {
                ancestors.unshift(whileNode);
                whileNode = whileNode.parent;
            }
            return (ancestors.indexOf(currentNode) >= 0);
        }

        return {
            graphs: graphs,
            arc: arc,
            partition: partition,
            render: render,
            jsonRequestCB: jsonRequestCB,
            getNodeAncestors: getNodeAncestors
        };
    }();

    D3Partitions.render("[d3-partition-graph]");
});