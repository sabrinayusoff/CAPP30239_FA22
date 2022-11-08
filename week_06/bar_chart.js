/* This script creates a bar chart for number of people shot by race in 2015 */

d3.json("a3cleanedonly2015.json").then(data => {
    const totalCount = d3.count(data, d => d.FIELD1);
    let newData = [
        { race: "", count: 0, percent: 0 },
        { race: "Asian", count: 0, percent: 0 },
        { race: "Black", count: 0, percent: 0 },
        { race: "Hispanic", count: 0, percent: 0 },
        { race: "Native", count: 0, percent: 0 },
        { race: "Other", count: 0, percent: 0 },
        { race: "White", count: 0, percent: 0 },
    ];

    for(var d of data) {
         let nd = newData.find(nd => nd.race == d["Race"]);
         nd.count += 1;
    }
    for(var d of newData) {
        let nd = newData.find(nd => nd.race == d.race);
        nd.percent = (d.count/totalCount) * 100;
    }

    console.log(newData);

    const height = 400,
          width = 500,
          margin = ({ top: 25, right: 30, bottom: 35, left: 50 });

    // create svg to append bar chart to
    let svg = d3.select("#bar-chart")
        .append("svg")
        .attr("viewBox", [0, 0, width, height]); 

    let x = d3.scaleBand()
        .domain(newData.map(d => d.race))
        .range([margin.left, width - margin.right]) 
        .padding(0.1);
      
    let y = d3.scaleLinear()
        .domain([0, d3.max(newData, d => d.count)]).nice()
        .range([height - margin.bottom, margin.top]); 
      
    // append x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom + 5})`)
        .call(d3.axisBottom(x));

    // append y-axis
    svg.append("g")
        .attr("transform", `translate(${margin.left - 5},0)`)
        .call(d3.axisLeft(y).tickFormat(d => d));

    let bar = svg.selectAll(".bar")
        .append("g")
        .data(newData)
        .join("g")
        .attr("class", "bar");

    bar.append("rect") 
        .attr("fill", '#1c9099')
        .attr("x", d => x(d.race))
        .attr("width", x.bandwidth()) 
        .attr("y", d => y(d.count))
        .attr("height", d => y(0) - y(d.count));
    
    // count labels
    bar.append('text') 
        .text(d => d.count)
        .attr('x', d => x(d.race) + (x.bandwidth()/2))
        .attr('y', d => y(d.count) - 5)
        .attr('text-anchor', 'middle')
        .style('fill', 'black');

    // add a tooltip to show percentage
    const tooltip = d3.select("body")
        .append("div")
        .attr("class","d3-tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("padding", "15px")
        .style("background", "rgba(0,0,0,0.6)")
        .style("border-radius", "5px")
        .style("color", "#fff")
        .text("a simple tooltip");

    d3.selectAll("rect")
        .on("mouseover", function(d, i) {
            d3.select(this).attr("fill", "#105358");
            tooltip
            .html(`Data: ${d}`)
            .style("visibility", "visible"); 
        })
        .on("mousemove", function(event, d){
          tooltip
            .style("top", (event.pageY-5)+"px")
            .style("left",(event.pageX+5)+"px")
            .style("visibility", "visible")
            .html(`${+(d.percent.toFixed(2))}% of total people shot`);
        })
        .on("mouseout", function() {
          tooltip.html(``).style("visibility", "hidden");
          d3.select(this).attr("fill", "#1c9099");
        });

});