/* This script creates a bar chart for library visits in Jan 22 */

d3.csv("library_visits_jan22.csv").then(data => {

    for (let d of data) {
        d.num = +d.num; //force a number
    };

    // sort alphabetically
    data.sort((a, b) => d3.ascending(a.branch, b.branch));

    const height = 600,
          width = 800,
          margin = ({ top: 25, right: 30, bottom: 35, left: 50 });

    let svg = d3.select("#chart")
        .append("svg")
        .attr("viewBox", [0, 0, width, height]); // for resizing element in browser
    
    let x = d3.scaleBand()
        .domain(data.map(d => d.branch)) // data, returns array
        .range([margin.left, width - margin.right]) // pixels on page
        .padding(0.1);
    
    let y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.num)]).nice() // nice rounds the top num
        .range([height - margin.bottom, margin.top]); //svgs are built from top down, so this is reversed
    
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom + 5})`) // move location of axis
        .call(d3.axisBottom(x));
    
    svg.append("g")
        .attr("transform", `translate(${margin.left - 5},0)`)
        .call(d3.axisLeft(y));

    let bar = svg.selectAll(".bar") // create bar groups
        .append("g")
        .data(data)
        .join("g")
        .attr("class", "bar");

    bar.append("rect") // add rect to bar group
        .attr("fill", "coral")
        .attr("x", d => x(d.branch)) // x position attribute
        .attr("width", x.bandwidth()) // width attr on the element
        .attr("y", d => y(d.num)) // y position attribute
        .attr("height", d => y(0) - y(d.num)); // height attr on element
    
    bar.append('text') // add labels
        .text(d => d.num)
        .attr('x', d => x(d.branch) + (x.bandwidth()/2))
        .attr('y', d => y(d.num) - 5)
        .attr('text-anchor', 'middle')
        .style('fill', 'black');

});