/* This file creates a choropleth map of zipcodes in Chicago
and the average commute times for each zipcode.
*/


Promise.all([
    d3.csv("data/public_transport_zip.csv"),
    d3.json("libs/chicago_boundaries_zipcodes.geojson")
]).then(([data, chicago]) => {

    const tooltip = d3.select("body")
    .append("div")
    .attr("class", "svg-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("font-size", "10px")
    .style("background-color", "white");
  
    const height = 610,
        width = 700;

    const svg = d3.select("#number-public-transport")
        .append("svg")
        .attr("viewBox", [0, 0, width, height]);

    //making a lookup table from the data by zipcode
    const dataByZip = {};

    for (let d of data) {
        d.public_transport_count = +d.public_transport_count; //force a number
        dataByZip[d.zip] = d;
    }
    console.log("dataByZip public transport", dataByZip);

    const color = d3.scaleQuantize() // takes domain and creates 7 number of buckets of blue
        // .domain([0, 40]).nice()
        .domain([0, 15000])
        .range(d3.schemePurples[5]);

    // create legend
    d3.select("#number-public-transport-legend") // refer to div in html with legend id
    .node()
    .appendChild(
    Legend(
        d3.scaleOrdinal(
        ["3000", "6000", "9000", "12000", "15000+"],
        d3.schemePurples[5]
        ),
        { title: "No. of residents taking public transportation" }
    ));

    console.log(data);

    // Chicago specific projection
    let projection = d3
        .geoAlbers()
        .center([0, 41.83])
        .rotate([87.65, 0])
        .parallels([35, 50])
        .scale(80000)
        .translate([width / 2, height / 2]);

    let geoGenerator = d3.geoPath()
        .projection(projection);

    svg.append("g")
        .selectAll('path')
        .data(chicago.features)
        .join('path')
        .attr("fill", (d) => {
            return d.properties.zip in dataByZip
            ? color(dataByZip[d.properties.zip].public_transport_count)
            : "#ccc";
        })
        .attr('d', geoGenerator)
        .attr('stroke', 'white')

        //tooltip
        .on("mousemove", function (event, d) {
            let info = dataByZip[d.properties.zip];
            console.log("info", info);
            tooltip
            .style("visibility", "visible")
            .html(`Zip: ${info.zip}<br> ${d3.format(",")(info.public_transport_count)}`)
            .style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
            d3.select(this).attr("fill", "goldenrod");
        })
        .on("mouseout", function (event, d) {
            tooltip.style("visibility", "hidden");
            d3.select(this).attr("fill", (d) => { 
                return d.properties.zip in dataByZip
                  ? color(dataByZip[d.properties.zip].public_transport_count)
                  : "#ccc";
              })
        });

})