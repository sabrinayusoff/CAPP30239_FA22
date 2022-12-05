/* This file creates a line chart showing CTA ridership between 2001 and 2022.
The total ridership (black) is also split into bus (blue) and rail (red) ridership. */

d3.csv("data/CTA_ridership_weekdays_annual_average.csv").then(data => {
    let timeParse = d3.timeParse("%Y"); // parse time to JS format so code can read it
    
    for (let d of data) {
        d.annual_average_ridership = +d.annual_average_ridership;
        d.year = timeParse(d.year);
    }

    chart = LineChart(data, {
        x: d => d.year,
        y: d => d.annual_average_ridership,
        z: d => d.category,
        yLabel: "Annual average ridership",
        width: 1000,
        height: 500,
        marginLeft: 100,
        color: d3.scaleOrdinal(["#4e79a7", "#e15759", "black"]),
      })
    document.getElementById("ridership-multiple").appendChild(chart);

    let categories = ["rail", "bus", "total"];
    let swatchHTML = Swatches(d3.scaleOrdinal(categories, ["#4e79a7", "#e15759", "black"]));

    d3.select("#ridership-multiple-legend")
      .append("div")
      .node().innerHTML = swatchHTML;

})


// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/multi-line-chart
function LineChart(data, {
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    z = () => 1, // given d in data, returns the (categorical) z-value
    title, // given d in data, returns the title text
    defined, // for gaps in data
    curve = d3.curveLinear, // method of interpolation between points
    marginTop = 20, // top margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    xType = d3.scaleUtc, // type of x-scale
    xDomain, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    zDomain, // array of z-values
    color = "currentColor", // stroke color of line, as a constant or a function of *z*
    strokeLinecap, // stroke line cap of line
    strokeLinejoin, // stroke line join of line
    strokeWidth = 1.5, // stroke width of line
    strokeOpacity, // stroke opacity of line
    mixBlendMode = "multiply", // blend mode of lines
    voronoi // show a Voronoi overlay? (for debugging)
  } = {}) {
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    const Z = d3.map(data, z);
    const O = d3.map(data, d => d);
    if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
    const D = d3.map(data, defined);
  
    // Compute default domains, and unique the z-domain.
    if (xDomain === undefined) xDomain = d3.extent(X);
    if (yDomain === undefined) yDomain = [0, d3.max(Y, d => typeof d === "string" ? +d : d)];
    if (zDomain === undefined) zDomain = Z;
    zDomain = new d3.InternSet(zDomain);
  
    // Omit any data not present in the z-domain.
    const I = d3.range(X.length).filter(i => zDomain.has(Z[i]));
  
    // Construct scales and axes.
    const xScale = xType(xDomain, xRange);
    const yScale = yType(yDomain, yRange);
    const xAxis = d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(height / 60, yFormat);
  
    // Compute titles.
    // const T = title === undefined ? Z : title === null ? null : d3.map(data, title);
    if (title === undefined) {
        const formatDate = xScale.tickFormat(null, "%Y");
        const formatValue = yScale.tickFormat(100, yFormat);
        title = i => `${formatDate(X[i])}\n${formatValue(Y[i])}`;
      } else {
        const O = d3.map(data, d => d);
        const T = title;
        title = i => T(O[i], i, data);
      }
  
    // Construct a line generator.
    const line = d3.line()
        .defined(i => D[i])
        .curve(curve)
        .x(i => xScale(X[i]))
        .y(i => yScale(Y[i]));
  
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .style("-webkit-tap-highlight-color", "transparent")
        .on("pointerenter pointermove", pointermoved)
        .on("pointerleave", pointerleft)
        .on("touchstart", event => event.preventDefault());
  
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis);
  
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .call(voronoi ? () => {} : g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 20)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(yLabel));
  
    const path = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", typeof color === "string" ? color : null)
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
      .selectAll("path")
      .data(d3.group(I, i => Z[i]))
      .join("path")
        .style("mix-blend-mode", mixBlendMode)
        .attr("stroke", typeof color === "function" ? ([z]) => color(z) : null)
        .attr("d", ([, I]) => line(I));
  
    const dot = svg.append("g")
        .attr("display", "none");
  
    dot.append("circle")
        .attr("r", 2.5);
  
    dot.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("y", -8);

    const tooltip = svg.append("g")
      .style("pointer-events", "none");

    function pointermoved(event) {
      const i = d3.bisectCenter(X, xScale.invert(d3.pointer(event)[0]));
      tooltip.style("display", null);
      tooltip.attr("transform", `translate(${xScale(X[i])},${yScale(Y[i])})`);

    const path = tooltip.selectAll("path")
      .data([,])
      .join("path")
        .attr("fill", "white")
        .attr("stroke", "black");

    const text = tooltip.selectAll("text")
      .data([,])
      .join("text")
      .call(text => text
        .selectAll("tspan")
        .data(`${title(i)}`.split(/\n/))
        .join("tspan")
          .attr("x", 0)
          .attr("y", (_, i) => `${i * 1.1}em`)
          .attr("font-weight", (_, i) => i ? null : "bold")
          .text(d => d));

    const {x, y, width: w, height: h} = text.node().getBBox();
    text.attr("transform", `translate(${-w / 2},${15 - y})`);
    path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
    svg.property("value", O[i]).dispatch("input", {bubbles: true});
  }

  function pointerleft() {
    tooltip.style("display", "none");
    svg.node().value = null;
    svg.dispatch("input", {bubbles: true});
  }
  
    return Object.assign(svg.node(), {value: null});
  }