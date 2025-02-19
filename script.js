import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Set initial width and height
let width = window.innerWidth * 0.9;
let height = window.innerHeight * 0.9;

// Function to update scales dynamically
function updateScales() {
    width = window.innerWidth * 0.9;
    height = window.innerHeight * 0.9;

    xScale.range([50, width - 50]);
    yScale.range([height - 50, 50]); // Flipped for correct positioning

    // Update SVG container size
    let container = d3.select("#svg-container")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", width)
        .attr("height", height);

    console.log(`Updated scales: Width=${width}, Height=${height}`);
}

// Load data
let west_data = await d3.csv("western_subset.csv", d3.autoType);
let east_data = await d3.csv("eastern_subset.csv", d3.autoType);

// Get min/max year
let min_year = 1940;
let max_year = 2035;

// Count occurrences per year
let west_counts = d3.rollup(west_data, v => v.length, d => d.date_year);
let east_counts = d3.rollup(east_data, v => v.length, d => d.date_year);
let west_json = Object.fromEntries(west_counts);
let east_json = Object.fromEntries(east_counts);

console.log(west_json, east_json)

// Get min/max count
let minCount = d3.min([...west_counts.values(), ...east_counts.values()]);
let maxCount = d3.max([...west_counts.values(), ...east_counts.values()]);

console.log(`Min Year: ${min_year}, Max Year: ${max_year}`);
console.log(`Min Count: ${minCount}, Max Count: ${maxCount}`);

// Define scales
let xScale = d3.scaleTime()
    .domain([min_year, max_year])
    .range([50, width - 50]);

let yScale = d3.scaleLinear()
    .domain([0, maxCount])
    .range([height - 50, 50]); // Flip Y-axis

let sizeScale = d3.scaleLinear()
    .domain([minCount, maxCount])
    .range([10, 50]); // Scale lionfish size in pixels

// Ensure SVG container exists and update its attributes
let container = d3.select("#svg-container")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height);

// Function to insert all SVGs dynamically
function insertAllSVGs(datasetType, countObject, imagePath) {
    let dataArray = Object.keys(countObject).map(year => ({
        year: +year,
        count: countObject[year]
    }));

    container.selectAll(`.lionfish-${datasetType}`)
        .data(dataArray)
        .enter()
        .append("image")
        .attr("x", d => xScale(d.year))
        .attr("y", d => yScale(d.count))
        .attr("width", d => sizeScale(d.count))
        .attr("height", d => sizeScale(d.count))
        .attr("xlink:href", imagePath) // Load the correct image file
        .attr("class", `lionfish-${datasetType}`);
}

// Use different images for west and east
insertAllSVGs("west", west_json, "lionfish-red.svg");
insertAllSVGs("east", east_json, "lionfish-blue.svg");


// Resize SVG elements dynamically on window resize
window.addEventListener("resize", () => {
    updateScales();

    d3.selectAll(".lionfish-west, .lionfish-east")
        .attr("x", d => xScale(d.year))
        .attr("y", d => yScale(d.count))
        .attr("width", d => sizeScale(d.count))
        .attr("height", d => sizeScale(d.count));
});
