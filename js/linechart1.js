var width = 300;
var height = 200;

var margin = {
    top: 40,
    left: 40,
    right: 40,
    bottom: 50
};
var svgWidth = width + margin.left + margin.right;
var svgHeight = height + margin.top + margin.bottom;

var svg = d3.select("#chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    ;
var color = d3.scaleOrdinal(["#3677FF","#FFD26F"]);

// popup
var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0.5);

var currmonth = 1;

// scale
var x = d3.scaleBand()
    .range([0, width])
    ;

var y = d3.scaleLinear()
    .range([height, 0]);

var xAxis = d3.axisBottom()
    .scale(x)
    .tickFormat(function (d, i) {
        var date = new Date(d);
        if (date.getMonth() + 1 === currmonth) {
            currmonth++;
            return (date.getMonth() + 1) + "-" + date.getDate();
        }
        if (date.getDate() === 15) {
            return (date.getMonth() + 1) + "-" + date.getDate();
        }
        return "";
    })
    ;

var yAxis = d3.axisLeft()
    .scale(y)
    ;

//  title---Y
svg.append("g")
    .attr("class", "y-label")
    .attr("transform", "translate(-20,-20)")
    .append("text")
    .text("Price")
    ;

// title---X
svg.append("g")
    .attr("class", "x-label")
    .attr("transform", "translate(" + (width - 60) + "," + (height + 40) + ")")
    .append("text")
    .text("Year(2019)")
    ;

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height) + ")")
    .call(xAxis)
    .append("text")
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    ;
svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    ;

var linema10 = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.ma10));
var linema20 = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.ma20))

d3.csv("https://raw.githubusercontent.com/vishalkumarlondon/data-viz-coursework-group-2/master/data/price.csv").then(function (data) {
    var list = [];
    data.columns.forEach(function (key) {
        if (key !== "ma" && key !== "Index") {
            list.push({
                ma10: data[0][key]*1, ma20: data[1][key]*1, date: key
            });
        }
    });
    console.log(list);

    // gain the max value
    var max10 = d3.max(list, function (d) { return d.ma10; });
    var max20 = d3.max(list, function (d) { return d.ma10; })
    var max = Math.max(max10, max20);
    // Set the Y-axis domain
    y.domain([0,max]);
    // renew Y-axis
    svg.select(".y.axis").call(yAxis);

    // Get the X-axis domain
    var xdomain = list.map(function (d) { return d.date; });
    // Set the X-axis domain
    x.domain(xdomain);
    // renew X-axis
    svg.select(".x.axis").call(xAxis);

    svg.append("g")
        .selectAll("rect")
        .data(list)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.date))
        .attr("width", x.bandwidth())
        .style("fill", "none")
        .style("opacity", "0.7")
        .style("stroke", "#fdfbfb")
        .style("stroke-width", "0.5")
        .attr("height", height)
        .on("mouseover", function (d) {
            // popup
            var str = "";
            str += "<div style='margin:5px 5px'>Ma10 Price:" + d.ma10 + "</div>";
            str += "<div style='margin:5px 5px'>Ma20 Price:" + d.ma20 + "</div>";
            str += "<div style='margin:5px 5px'>Date:" + d.date + "</div>";

            // popup by mouse move
            tooltip.html(str)
                .style("width", 300 + "px")
                .style("height", "auto")
                .style("left", (d3.event.pageX - 60) + "px")
                .style("top", (d3.event.pageY + 20) + "px")
                .style("opacity", 0.8)
                ;
            d3.select(this)
                .style("fill", "#81FBB8")
                .style("opacity", "0.5");
        })
        .on("mouseout", function (d) {
            tooltip.style("width", 0)
                .style("height", 0)
                .style("opacity", 0.0);
            d3.select(this)
                .style("fill", "none")
                .style("opacity", "0.1");
        })  
        ;

    svg.append("path")
        .datum(list)
        .attr("fill", "none")
        .attr("stroke", color("ma10"))
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", linema10);

    svg.append("path")
        .datum(list)
        .attr("fill", "none")
        .attr("stroke", color("ma20"))
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", linema20);

    var glegend = svg.selectAll(".legend")
        .data(["ma10", "ma20"])
        .join("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${(width - 160*2)/2 + i * 160},${-40})`);

    glegend.append("rect")
        .attr("width", 60)
        .attr("height", 20)
        .style("fill", d => color(d))
        ;
    glegend.append("text")
        .attr("x", 70)
        .attr("y", 15)
        .text(d => d);
});