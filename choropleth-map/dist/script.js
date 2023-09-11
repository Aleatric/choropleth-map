import * as d3 from "https://cdn.skypack.dev/d3@7.8.4";
import * as topojson from "https://cdn.skypack.dev/topojson@3";

const width = 960;
const height = 600;
let path = d3.geoPath();

let svg = d3.select("#choropleth").
append("svg").
attr("width", width).
attr("height", height);

let tooltip = d3.select("body").
append("div").
attr("id", "tooltip").
style("opacity", 0);

let color = d3.scaleThreshold().
domain([3, 12, 21, 30, 39, 48, 57, 66]).
range(d3.schemeBlues[9]);

let legend = svg.append("g").
attr("id", "legend").
attr("transform", "translate(600,40)");

Promise.all([
d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'),
d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json')]).
then(ready);

function ready([us, education]) {
  let educationById = {};

  education.forEach(function (d) {
    educationById[d.fips] = +d.bachelorsOrHigher;
  });

  svg.append("g").
  attr("class", "counties").
  selectAll("path").
  data(topojson.feature(us, us.objects.counties).features).
  enter().append("path").
  attr("class", "county").
  attr("data-fips", function (d) {
    return d.id;
  }).
  attr("data-education", function (d) {
    return educationById[d.id];
  }).
  attr("fill", function (d) {
    return color(educationById[d.id]);
  }).
  attr("d", path).
  on("mouseover", function (event, d) {
    tooltip.transition().
    duration(200).
    style("opacity", .9);
    tooltip.html("Education: " + educationById[d.id] + "%").
    style("left", event.pageX + 10 + "px").
    style("top", event.pageY - 28 + "px").
    attr("data-education", educationById[d.id]);
  }).
  on("mouseout", function (d) {
    tooltip.transition().
    duration(500).
    style("opacity", 0);
  });


  svg.append("path").
  datum(topojson.mesh(us, us.objects.states, function (a, b) {return a !== b;})).
  attr("class", "states").
  attr("d", path);

  const x = d3.scaleLinear().
  domain([3, 66]).
  rangeRound([600, 860]);

  legend.selectAll("rect").
  data(color.range().map(function (d) {
    d = color.invertExtent(d);
    if (d[0] == null) d[0] = x.domain()[0];
    if (d[1] == null) d[1] = x.domain()[1];
    return d;
  })).
  enter().append("rect").
  attr("height", 8).
  attr("x", function (d) {return x(d[0]);}).
  attr("width", function (d) {return x(d[1]) - x(d[0]);}).
  attr("fill", function (d) {return color(d[0]);});

  legend.call(d3.axisBottom(x).
  tickSize(13).
  tickValues(color.domain())).
  select(".domain").
  remove();
}