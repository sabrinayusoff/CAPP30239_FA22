/* This file creates a choropleth map of zipcodes in Chicago
and the average commute times for each zipcode.
*/
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "svg-tooltip")
  .style("position", "absolute")
  .style("visibility", "hidden");

const height = 610,
    width = 975;

const svg = d3.select("#commute-times")
    .append("svg")
    .attr("viewBox", [0, 0, width, height]);


Promise.all([
    d3.csv("data/mean_travel_time.csv"),
    d3.json("libs/chicago_boundaries_zipcodes.geojson")
  ]).then(([data, chicago]) => {

    //making a lookup table from the data by zipcode
    const dataById = {};

    for (let d of data) {
        d.mean_travel_time = +d.mean_travel_time; //force a number
        dataById[d.zip] = d;
    }
    // console.log("databyid", dataById);

    const color = d3.scaleQuantize() // takes domain and creates 7 number of buckets of blue
        .domain([0, 70]).nice()
        .range(d3.schemeBlues[7]);

    // create legend
    d3.select("#choropleth-legend") // refer to div in html with legend id
    .node()
    .appendChild(
      Legend(
        d3.scaleOrdinal( // created a new scale to format it ourselves
          ["1", "2", "3", "4", "5", "6", "7"],
          d3.schemeBlues[7]
        ),
        { title: "Travel Time to Work (public transportation)" }
      ));

    // Chicago specific projection
    let projection = d3
        .geoAlbers()
        .center([0, 41.83])
        .rotate([87.65, 0])
        .parallels([35, 50])
        .scale(90000)
        .translate([width / 2, height / 2]);

    let geoGenerator = d3.geoPath()
        .projection(projection);

    svg.append("g")
        .selectAll('path')
        .data(chicago.features)
        .join('path')
        .attr('fill', d => (d.zip in dataById) ? color(dataById[d.zip].mean_travel_time) : '#ccc')
        .attr('d', geoGenerator)
        .attr('stroke', 'black')
        // tooltip
        .on("mousemove", function (event, d) {
            let info = dataById[d.id];
            tooltip
            .style("visibility", "visible")
            .html(`${info.zip}<br>${info.mean_travel_time}%`)
            .style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
            d3.select(this).attr("fill", "goldenrod");
        })
        .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
            d3.select(this).attr("fill", d => (d.id in dataById) ? color(dataById[d.id].mean_travel_time) : '#ccc');
        });

})