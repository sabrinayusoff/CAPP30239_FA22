/* This script creates a donut chart showing the breakdown of people who were
shot by the police in 2015, broken down by gender. */

d3.json('a3cleanedonly2015.json').then(data => {
    const totalCount = d3.count(data, d => d.FIELD1);
    let mentalIllness = [
        { "Mental_illness": true, "Totals": 0, "Percent": 0 },
        { "Mental_illness": false, "Totals": 0, "Percent": 0},
    ]

    for (let d of data) {
        let nd = mentalIllness.find(nd => nd.Mental_illness == d["Mental_illness"]);
        nd.Totals += 1;
    };
    for(var d of mentalIllness) {
        let nd = mentalIllness.find(nd => nd.Mental_illness == d.Mental_illness);
        nd.Percent = +((d.Totals/totalCount).toFixed(2)) * 100;
        if (nd.Mental_illness == true){
            nd.Mental_illness = "Had mental illness";
        } else{
            nd.Mental_illness = "No mental illness";
        }
    }

    // console.log(mentalIllness);

    const height = 300, 
        width = 500,
        innerRadius = 80,
        outerRadius = 120,
        labelRadius = 160;
  
    const arcs = d3.pie().value(d => d.Totals)(mentalIllness);
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius); // generator that we use later
    const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);
  
    const svg = d3.select("#donut-chart")
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
      .attr("fill", d3.scaleOrdinal().range(["#9ebcda", "#8856a7"]))
      .attr("d", arc);
  
    svg.append("g")
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(arcs)
      .join("text")
      .attr("transform", d => `translate(${arcLabel.centroid(d)})`) // centroid: center the text on each segment
      .selectAll("tspan")
      .data(d => {
        return [d.data.Mental_illness, d.data.Totals, `(${d.data.Percent}%)`];
      })
      .join("tspan") // for the second line below category
      .attr("x", 0)
      .attr("y", (d, i) => `${i * 1.1}em`)
      .attr("font-weight", (d, i) => i ? null : "bold")
      .text(d => d);
  });