/* D3 Line Chart */

/* The variables below are pulled out from d3.csv because they are not
dependent on the data -- performance boost because these can be
run while the data is loading */
const height = 500,
    width = 800,
    margin = ({ top: 15, right: 30, bottom: 35, left: 40 });
    
const svg = d3.select("#chart")
    .append("svg")
    .attr("viewBox", [0, 0, width, height]);

d3.csv('long-term-interest-canada.csv').then(data => {
    let timeParse = d3.timeParse("%Y-%m"); // give timeParse how our data looks like (not how we want it to look)

    for (let d of data) {
        data.Num = +data.Num;
        d.Month = timeParse(d.Month);
    }
    
    let x = d3.scaleTime()
        .domain(d3.extent(data, d => d.Month)) // domain: data; extent takes the min and max of the data
        .range([margin.left + 10, width - margin.right]);

    let y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Num)]).nice()
        .range([height - margin.bottom, margin.top]); // height is from top to bottom
    
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .attr("class", "y-axis")
        .call(d3.axisLeft(y).tickSizeOuter(0).tickFormat(d => d + "%").tickSize(-width)); // add % to the labels

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`) // put it in the right place (without it, x-axis ends up on top)
        .attr("class", "x-axis")
        .call(d3.axisBottom(x)
        .tickFormat(d3.timeFormat("%B")) // Without this, January shows up as 2020 on x-axis
        .tickSizeOuter(0)); // tickSizeOuter gets rid of the hanging line at end of axis

    svg.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "end")
        .attr("x", width - margin.right)
        .attr("y", height)
        .attr("dx", "0.5em")
        .attr("dy", "-0.5em") 
        .text("Year");
    
    svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "end")
        .attr("x", -margin.top/2)
        .attr("dx", "-0.5em")
        .attr("y", 10)
        .attr("transform", "rotate(-90)")
        .text("Interest rate");

    let line = d3.line()
        .x(d => x(d.Month))
        .y(d => y(d.Num))
        .curve(d3.curveBasis);
    
    svg.append("path")
        .datum(data)
        .attr("d", line) // indicates the consecutive points through which the path should go through
        .attr("fill", "none")
        .attr("stroke", "#984ea3"); // don't really need to do it in js; can do in CSS (and use class to label this part)

  });