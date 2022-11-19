/* This script creates a donut chart showing the breakdown of people using different
modes of transportation. */

d3.csv("data/mode_of_transport_donut.csv").then(data => {

    console.log(data);

    const height = 500, 
        width = 700,
        innerRadius = 100,
        outerRadius = 200,
        labelRadius = 250;
  
    const arcs = d3.pie().value(d => d.count)(data);
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius); // generator that we use later
    const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);
  
    const svg = d3.select("#donut-chart-modes")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
  
    svg.append("g")
      .attr("stroke", "white")
      .attr("stroke-width", 2) // making the white space between the segments
      .attr("stroke-linejoin", "round")
      .selectAll("path")
      .data(arcs) // data after it was passed through the pie() function
      .join("path")
      .attr("fill", d3.scaleOrdinal().domain(data).range(d3.schemeSet3))
      .attr("d", arc);
  
    // text labels
    svg.append("g")
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(arcs)
      .join("text")
      .attr("transform", d => `translate(${arcLabel.centroid(d)})`) // centroid: center the text on each segment
      .selectAll("tspan")
      .data(d => {
        return [d.data.mode, d3.format(",")(d.data.count), `(${d.data.percent}%)`];
      })
      .join("tspan") // for the second line below category
      .attr("x", 0)
      .attr("y", (d, i) => `${i * 1.1}em`)
      .attr("font-weight", (d, i) => i ? null : "bold")
      .text(d => d);

})