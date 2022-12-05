/* This file creates a choropleth map of zipcodes in Chicago
and the % of residents living 100% below the poverty line for each zipcode.
*/

Promise.all([
    d3.csv("data/poverty_status_by_zip.csv"),
    d3.json("libs/chicago_boundaries_zipcodes.geojson")
]).then(([data, chicago]) => {

    const tooltip = d3.select("body")
    .append("div")
    .attr("class", "svg-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("font-size", "10px")
    .style("background-color", "white");
  
    const height = 800,
        width = 800;

    const svg = d3.select("#choropleth-poverty")
        .append("svg")
        .attr("viewBox", [0, 0, width, height]);

    //making a lookup table from the data by zipcode
    const dataByZip = {};

    for (let d of data) {
        d.percent_below_100_percent_of_the_poverty_level = +d.percent_below_100_percent_of_the_poverty_level; //force a number
        dataByZip[d.zip] = d;
    }
    console.log("dataByZip", dataByZip);

    const color = d3.scaleQuantize()
        .domain([0, 25])
        .range(["#a1d99b","#74c476","#41ab5d","#238b45","#005a32"]);

    d3.select("#poverty-legend") // refer to div in html with legend id
    .node()
    .appendChild(
    Legend(
        d3.scaleOrdinal(
        ["0-5", "5-10", "10-15", "15-20", "20+"],
        ["#a1d99b","#74c476","#41ab5d","#238b45","#005a32"]
        
        ),
        { title: "Residents Living Below 100% of the Poverty Line (%)" }
    ));

    // Chicago specific projection
    let projection = d3
        .geoAlbers()
        .center([0, 41.83])
        .rotate([87.65, 0])
        .parallels([35, 50])
        .scale(120000)
        .translate([width / 2, height / 2]);

    let geoGenerator = d3.geoPath()
        .projection(projection);

    svg.append("g")
        .selectAll('path')
        .data(chicago.features)
        .join('path')
        .attr("fill", (d) => { 
            return d.properties.zip in dataByZip
            ? color(dataByZip[d.properties.zip].percent_below_100_percent_of_the_poverty_level)
            : "#ccc";
        })
        .attr('d', geoGenerator)
        .attr('stroke', 'white')
        // tooltip
        .on("mousemove", function (event, d) {
            let info = dataByZip[d.properties.zip];
            tooltip
            .style("visibility", "visible")
            .html(`Zip: ${info.zip}<br> % below 100% of the poverty line: ${info.percent_below_100_percent_of_the_poverty_level}%`)
            .style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
            d3.select(this).attr("fill", "goldenrod");
        })
        .on("mouseout", function (event, d) {
            tooltip.style("visibility", "hidden");
            d3.select(this).attr("fill", (d) => { 
                console.log(d);
                return d.properties.zip in dataByZip
                  ? color(dataByZip[d.properties.zip].percent_below_100_percent_of_the_poverty_level)
                  : "#ccc";
              })
        });

})

