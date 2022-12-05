/* This file creates a choropleth map of zipcodes in Chicago
and the % of Black residents for each zipcode.
*/

Promise.all([
    d3.csv("data/race_by_zipcode.csv"),
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

    const svg = d3.select("#choropleth-race")
        .append("svg")
        .attr("viewBox", [0, 0, width, height]);

    //making a lookup table from the data by zipcode
    const dataByZip = {};

    for (let d of data) {
        d.black_percent = +d.black_percent; //force a number
        dataByZip[d.zip] = d;
    }
    console.log("dataByZip", dataByZip);

    const color = d3.scaleQuantize() //
        .domain([0, 1])
        .range(["#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"]);

    // create legend
    d3.select("#race-legend") // refer to div in html with legend id
    .node()
    .appendChild(
    Legend(
        d3.scaleQuantize(
        ["#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"]
        ),
        { title: "% Black Residents" }
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
            ? color(dataByZip[d.properties.zip].black_percent)
            : "#ccc";
        })
        .attr('d', geoGenerator)
        .attr('stroke', 'white')
        // tooltip
        .on("mousemove", function (event, d) {
            let info = dataByZip[d.properties.zip];
            tooltip
            .style("visibility", "visible")
            .html(`Zip: ${info.zip}<br> % black residents: ${info.black_percent}`)
            .style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
            d3.select(this).attr("fill", "goldenrod");
        })
        .on("mouseout", function (event, d) {
            tooltip.style("visibility", "hidden");
            d3.select(this).attr("fill", (d) => { 
                console.log(d);
                return d.properties.zip in dataByZip
                  ? color(dataByZip[d.properties.zip].black_percent)
                  : "#ccc";
              })
        });

})

