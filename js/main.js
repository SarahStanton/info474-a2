$(function() {
    // Read in your data. On success, run the rest of your code
    d3.csv('data/worldhappiness.csv', function(error, allData) {
        var year = '2015';
        var region = 'Western Europe';
        var variable = 'Happiness Score';

        // Setting defaults
        var margin = {
                top: 40,
                right: 10,
                bottom: 10,
                left: 10
            },
            width = 960,
            height = 800,
            diameter = 800,
            drawWidth = width - margin.left - margin.right,
            drawHeight = height - margin.top - margin.bottom
            measure = 'Happiness Score'; // variable to visualize

        // Append a wrapper div for the chart
        var svg = d3.select('#vis')
            .append("svg")
            .attr('height', height)
            .attr('width', width)
            .style("left", margin.left + "px")
            .style("top", margin.top + "px");

        var g = svg.append('g');

        var nestedData = d3.nest()
            .key(function(d) {
                return d.Region;
            })
            .entries(allData);

        // Define a hierarchy for your data
        var root = d3.hierarchy({
            values: nestedData
        }, function(d) {
            return d.values;
        })
        .sort(function(a,b){
            return b.value - a.value;
        });

        var pack = d3.pack() // function that returns a function!
            .size([diameter, diameter]);

        var regions = nestedData.map(function(d) {
            //console.log(d)
            return d.values;
        });

        var colorScale = d3.scaleOrdinal().domain(regions).range(d3.schemeCategory20);

        var filterData = function() {
            var currentData = allData.filter(function(d) {
                return (d.year == year && d.Region == region && d.variable == variable);
            });

            nestedData = d3.nest()
                .key(function(d) {
                    return d.Region;
                })
                .entries(currentData);

            // Define a new hierarchy for data
            root = d3.hierarchy({
                values: nestedData
            }, function(d) {
                return d.values;
            })
            .sort(function(a,b){
                return b.value - a.value;
            });

            pack = d3.pack()
                .size([diameter, diameter]);

            return root;
        };

        // Add tip
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .html(function(d) {
                console.log(d);
                return d.data.Country;
            });

        g.call(tip);

        var draw = function(root) {

            // Redefine which value you want to visualize in your data by using the `.sum()` method
            root.sum(function(d) {
                return +d["value"];
            });

            // (Re)build your treemap data structure by passing your `root` to your `treemap` function
            pack(root);

            console.log(root.leaves());

            // Bind your data to a selection of elements with class node
            // The data that you want to join is array of elements returned by `root.leaves()`

            var node = g.selectAll("circle").data(root.leaves());

            // Enter and append elements, then position them using the appropriate *styles*
            node.enter()
                .append("circle")
                .merge(node)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .attr('class', 'node')
                .transition().duration(1500)
                .attr('transform', function(d){
                    return "translate(" + d.x + "," + d.y + ")";
                })
                .attr('r', function(d){
                    return d.r;
                })
                .style("fill", function(d, i) {
                    return colorScale(d.data.Country);
                })
            node.exit().remove();

        };

        // Call draw function

        // Listen to change events on the input elements
        $("select").on('change', function() {
            // Set your measure variable to the value (which is used in the draw funciton)
            console.log($(this))
            // Get value, determine if it is the year or type controller
            var val = $(this).val();
            var isYear = $(this).hasClass('year');
            var isRegion = $(this).hasClass('region');
            if (isYear) {
                year = val;
            } else if (isRegion) {
                region = val;
            } else {
                variable = val;
            }

            // Filter data, update chart
            root = filterData();
            draw(root);
        });

        // Filter data to the current settings then draw
        root = filterData();
        draw(root);

    });
});