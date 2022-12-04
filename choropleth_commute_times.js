/* This file creates a choropleth map of zipcodes in Chicago
and the average commute times for each zipcode.
*/


Promise.all([
    d3.csv("data/mean_travel_time.csv"),
    d3.json("libs/chicago_boundaries_zipcodes.geojson")
]).then(([data, chicago]) => {

    const tooltip = d3.select("body")
    .append("div")
    .attr("class", "svg-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("font-size", "10px")
    .style("background-color", "white");
  
    const height = 550,
        width = 700;

    const svg = d3.select("#commute-times")
        .append("svg")
        .attr("viewBox", [0, 0, width, height]);

    //making a lookup table from the data by zipcode
    const dataByZip = {};

    for (let d of data) {
        d.mean_travel_time = +d.mean_travel_time; //force a number
        dataByZip[d.zip] = d;
    }
    console.log("dataByZip", dataByZip);

    const color = d3.scaleQuantize() // takes domain and creates 7 number of buckets of blue
        .domain([0, 60]).nice()
        .range(d3.schemeBlues[6]);

    // create legend
    d3.select("#commute-times-legend") // refer to div in html with legend id
    .node()
    .appendChild(
    Legend(
        d3.scaleOrdinal(
        ["10min or less", "up to 20min", "up to 30min", "up to 40min", "up to 50min", "50+min"],
        d3.schemeBlues[6]
        ),
        { 
            title: "Travel Time to Work (public transportation)",
            width: 800
         }
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
            ? color(dataByZip[d.properties.zip].mean_travel_time)
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
            .html(`Zip: ${info.zip}<br> Mean travel time to work: ${info.mean_travel_time} min`)
            .style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
            d3.select(this).attr("fill", "goldenrod");
        })
        .on("mouseout", function (event, d) {
            tooltip.style("visibility", "hidden");
            d3.select(this).attr("fill", (d) => { 
                return d.properties.zip in dataByZip
                  ? color(dataByZip[d.properties.zip].mean_travel_time)
                  : "#ccc";
              })
        });

})