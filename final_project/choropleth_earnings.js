/* This file creates a choropleth map of zipcodes in Chicago
and the median earnings for each zipcode.
*/

Promise.all([
    d3.csv("data/median_earnings_by_zip.csv"),
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

    const svg = d3.select("#choropleth-earnings")
        .append("svg")
        .attr("viewBox", [0, 0, width, height]);

    //making a lookup table from the data by zipcode
    const dataByZip = {};

    for (let d of data) {
        d.median_earnings = +d.median_earnings; //force a number
        dataByZip[d.zip] = d;
    }

    const color = d3.scaleQuantize() //
        .domain([0, 100000]).nice()
        // .range(["#cbc9e2","#9e9ac8","#54278f"]);
        .range(d3.schemePurples[5]);

    // create legend
    d3.select("#earnings-legend") // refer to div in html with legend id
    .node()
    .appendChild(
    Legend(
        d3.scaleOrdinal(
        ["<= 20k", "20-40k", "40-60k", "60-80k", "80k+"],
        // ["#cbc9e2","#9e9ac8","#54278f"]
        d3.schemePurples[5]
        ),
        { title: "Median Earnings by Zipcode ($)" }
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
            ? color(dataByZip[d.properties.zip].median_earnings)
            : "#ccc";
        })
        .attr('d', geoGenerator)
        .attr('stroke', 'white')
        // tooltip
        .on("mousemove", function (event, d) {
            let info = dataByZip[d.properties.zip];
            tooltip
            .style("visibility", "visible")
            .html(`Zip: ${info.zip}<br> Median earnings: ${d3.format("$,")(info.median_earnings)}`)
            .style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
            d3.select(this).attr("fill", "goldenrod");
        })
        .on("mouseout", function (event, d) {
            tooltip.style("visibility", "hidden");
            d3.select(this).attr("fill", (d) => { 
                console.log(d);
                return d.properties.zip in dataByZip
                  ? color(dataByZip[d.properties.zip].median_earnings)
                  : "#ccc";
              })
        });

})

