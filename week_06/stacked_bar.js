/* This script creates a stacked bar chart for number of people shot in each state
by who were armed versus unarmed. 
Reference: https://observablehq.com/@d3/stacked-horizontal-bar-chart?collection=@d3/charts */

const armedVals = ['Armed', 'Unarmed'];
const states = ['WA', 'TX', 'CO', 'CA', 'NY', 'LA', 'MN', 'PA', 'OH', 'AR', 'VA',
'IN', 'AZ', 'OK', 'MO', 'MD', 'TN', 'NC', 'FL', 'AL', 'MS', 'WI',
'GA', 'SC', 'MA', 'KY', 'IL', 'NJ', 'MI', 'NE', 'NV', 'HI', 'WV',
'UT', 'DE', 'DC', 'OR', 'KS', 'AK', 'NM', 'ID', 'IA', 'ND', 'SD',
'WY', 'MT', 'ME', 'CT', 'NH', 'VT'];

d3.json("a3cleanedonly2015.json").then(data => {
    let armedData = [];
    for(var d of states){
        armedData.push({
            "State": d,
            "Armed": 0,
            "Unarmed": 0,
            "Other": 0  
        });
    }

    for(var d of data){
        let nd = armedData.find(nd => nd.State == d["State"])
        if (d.Armed == "Unarmed"){
            nd.Unarmed += 1;
        } else if (d.Armed == ""){
            nd.Unarmed += 1;
        } else {
            nd.Armed += 1;
        }
        // nd.TotalCount += 1;
    }
    console.log(armedData);

    finalData = armedVals.flatMap(armed => armedData.map(d => ({state: d.State, armed, total: d[armed]})));

    // console.log(finalData);

    chart = StackedBarChart(finalData, {
        x: d => d.total,
        y: d => d.state,
        z: d => d.armed,
        xLabel: "Total Count →",
        yDomain: d3.groupSort(finalData, D => d3.sum(D, d => d.total), d => d.state), // sort y by x
        zDomain: armedVals,
        colors: d3.schemeCategory10 // original: d3.schemeSpectral[typesOfDeath.length]

    })
    document.getElementById("stacked-bar").appendChild(chart);

})


// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/stacked-horizontal-bar-chart
function StackedBarChart(data, {
    x = d => d, // given d in data, returns the (quantitative) x-value
    y = (d, i) => i, // given d in data, returns the (ordinal) y-value
    z = () => 1, // given d in data, returns the (categorical) z-value
    title, // given d in data, returns the title text
    marginTop = 60, // top margin, in pixels -- DETERMINES WHERE THE LEGEND GOES
    marginRight = 0, // right margin, in pixels
    marginBottom = 0, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    width = 640, // outer width, in pixels
    height, // outer height, in pixels
    xType = d3.scaleLinear, // type of x-scale
    xDomain, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    yDomain, // array of y-values
    yRange, // [bottom, top]
    yPadding = 0.1, // amount of y-range to reserve to separate bars
    zDomain, // array of z-values
    offset = d3.stackOffsetDiverging, // stack offset method
    order = d3.stackOrderNone, // stack order method
    xFormat, // a format specifier string for the x-axis
    xLabel, // a label for the x-axis
    colors = d3.schemeTableau10, // array of colors
  } = {}) {
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    const Z = d3.map(data, z);
  
    // Compute default y- and z-domains, and unique them.
    if (yDomain === undefined) yDomain = Y;
    if (zDomain === undefined) zDomain = Z;
    yDomain = new d3.InternSet(yDomain);
    zDomain = new d3.InternSet(zDomain);
  
    // Omit any data not present in the y- and z-domains.
    const I = d3.range(X.length).filter(i => yDomain.has(Y[i]) && zDomain.has(Z[i]));
  
    // If the height is not specified, derive it from the y-domain.
    if (height === undefined) height = yDomain.size * 25 + marginTop + marginBottom;
    if (yRange === undefined) yRange = [height - marginBottom, marginTop];
  
    // Compute a nested array of series where each series is [[x1, x2], [x1, x2],
    // [x1, x2], …] representing the x-extent of each stacked rect. In addition,
    // each tuple has an i (index) property so that we can refer back to the
    // original data point (data[i]). This code assumes that there is only one
    // data point for a given unique y- and z-value.
    const series = d3.stack()
        .keys(zDomain)
        .value(([, I], z) => X[I.get(z)])
        .order(order)
        .offset(offset)
      (d3.rollup(I, ([i]) => i, i => Y[i], i => Z[i]))
      .map(s => s.map(d => Object.assign(d, {i: d.data[1].get(s.key)})));
  
    // Compute the default x-domain. Note: diverging stacks can be negative.
    if (xDomain === undefined) xDomain = d3.extent(series.flat(2));
  
    // Construct scales, axes, and formats.
    const xScale = xType(xDomain, xRange);
    const yScale = d3.scaleBand(yDomain, yRange).paddingInner(yPadding);
    const color = d3.scaleOrdinal(zDomain, colors);
    const xAxis = d3.axisTop(xScale).ticks(width / 80, xFormat);
    const yAxis = d3.axisLeft(yScale).tickSizeOuter(0);
  
    // Compute titles.
    if (title === undefined) {
      const formatValue = xScale.tickFormat(100, xFormat);
      title = i => `${Y[i]}\n${Z[i]}\n${formatValue(X[i])}`;
    } else {
      const O = d3.map(data, d => d);
      const T = title;
      title = i => T(O[i], i, data);
    }
  
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
  
    svg.append("g")
        .attr("transform", `translate(0,${marginTop})`)
        .call(xAxis)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("y2", height - marginTop - marginBottom)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", width - marginRight)
            .attr("y", -22)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text(xLabel));
  
    const bar = svg.append("g")
      .selectAll("g")
      .data(series)
      .join("g")
        .attr("fill", ([{i}]) => color(Z[i]))
      .selectAll("rect")
      .data(d => d)
      .join("rect")
        .attr("x", ([x1, x2]) => Math.min(xScale(x1), xScale(x2)))
        .attr("y", ({i}) => yScale(Y[i]))
        .attr("width", ([x1, x2]) => Math.abs(xScale(x1) - xScale(x2)))
        .attr("height", yScale.bandwidth());
  
    if (title) bar.append("title")
        .text(({i}) => title(i));
  
    svg.append("g")
        .attr("transform", `translate(${xScale(0)},0)`)
        .call(yAxis);
    
    // MODIFIED CODE: ADDED LEGEND (https://d3-graph-gallery.com/graph/custom_legend.html)
    // Add one dot in the legend for each name.
    var size = 10
    svg.selectAll("mydots")
    .data(armedVals)
    .enter()
    .append("rect")
        .attr("x", 50) // where the first square appears
        .attr("y", function(d,i){ return i*(size+5)}) // 5 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})

    // Add labels
    svg.selectAll("mylabels")
    .data(armedVals)
    .enter()
    .append("text")
        .attr("x", 50 + size*1.5)
        .attr("y", function(d,i){ return i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        // .style("fill", function(d){ return color(d)})
        .style("fill", "black")
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

    return Object.assign(svg.node(), {scales: {color}});
}



