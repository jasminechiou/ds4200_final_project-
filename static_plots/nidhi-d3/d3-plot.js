// Define dimensions
const width = 1000, height = 600;
const margin = { top: 80, bottom: 80, left: 80, right: 280 };

// Create SVG container
d3.csv("../../parks_combined.csv").then(function (data) {
  // Process and format data as before
  const groupedData = Array.from(
    d3.rollup(
      data,
      v => new Set(v.map(d => d["Scientific Name"])).size, // Count unique species
      d => d["Category"], // Group by Category
      d => d["Park Name"] // Then group by Park Name
    ),
    ([category, parks]) => Array.from(
      parks,
      ([park, count]) => ({ category, park, count })
    )
  ).flat();

  // Create SVG container
  const svg = d3.select('#plot')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', '#f9f9f9');

  // Define scales
  const x0 = d3.scaleBand()
  .domain(groupedData.map(d => d.category))
  .range([margin.left, width - margin.right])
  .padding(0.4);

const x1 = d3.scaleBand()
  .domain(groupedData.map(d => d.park))
  .range([0, x0.bandwidth()])
  .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(groupedData, d => d.count)]).nice()
    .range([height - margin.bottom, margin.top]);

  const color = d3.scaleOrdinal()
    .domain(groupedData.map(d => d.park))
    .range(['#9ecae1', '#4292c6', '#08519c']);

  // Add axes
  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x0))
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');

  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // Add title
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .text('Species Count Across Parks by Category');

  // Add x-axis label
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height - 10)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .text('Category');

  // Add y-axis label
  svg.append('text')
    .attr('x', 0 - (height / 2))
    .attr('y', 20)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .text('Number of Unique Species');

  // Add bars
  svg.append('g')
    .selectAll('g')
    .data(d3.group(groupedData, d => d.category)) // Group by category
    .join('g')
    .attr('transform', d => `translate(${x0(d[0])},0)`)
    .selectAll('rect')
    .data(d => d[1]) // Bars for each park
    .join('rect')
    .attr('x', d => x1(d.park))
    .attr('y', d => y(d.count))
    .attr('width', x1.bandwidth())
    .attr('height', d => height - margin.bottom - y(d.count))
    .attr('fill', d => color(d.park));

  // Add legend to the right side
  const legend = svg.append('g')
    .attr('transform', `translate(${width - margin.right + 20},${margin.top})`);

  legend.selectAll('rect')
    .data(color.domain())
    .join('rect')
    .attr('x', 0)
    .attr('y', (d, i) => i * 20)
    .attr('width', 15)
    .attr('height', 15)
    .attr('fill', d => color(d));

  legend.selectAll('text')
    .data(color.domain())
    .join('text')
    .attr('x', 20)
    .attr('y', (d, i) => i * 20 + 12)
    .text(d => d)
    .style('font-size', '12px');
});

