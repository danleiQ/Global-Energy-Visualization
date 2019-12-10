/*
*    main.js
*    Project 2 - Gapminder Clone
*/

var margin = {left:80, right:20, top:50, bottom:100};

//chart dimensions
var height = 500 - margin.top - margin.bottom,
	width = 800 - margin.left - margin.right;
	
var canvas = d3.select("#chart-area")
	.append("svg")
		.attr("width", width+margin.left+margin.right)
		.attr("height", height+margin.top+margin.bottom)
	.append("g")
		.attr("transform", "translate(" +margin.left+ ", " +margin.top+ ")");
		
var time = 0; //represents 1800
var interval;
var formattedData;

//tooltip
var tip = d3.tip().attr("class", "d3-tip")
	.html(function(d){
		var text = "<strong>Country:</strong> <span style='color:red;'>"
			       + d.country + "</span><br />";
			text += "<strong>Continent:</strong> <span style='color:red; text-transform: capitalize;'>"
			       + d.continent + "</span><br />";
			text += "<strong>Life Expenctency:</strong> <span style='color:red;'>"
			       + d3.format(".0f")(d.life_exp) + "</span><br />";
			text += "<strong>GDP Per Capita:</strong> <span style='color:red;'>"
			       + d3.format("$,.0f")(d.income) + "</span><br />";
			text += "<strong>Population:</strong> <span style='color:red;'>"
			       + d3.format(",.0f")(d.population) + "</span><br />";
		return text;
	});
	
canvas.call(tip);


//scales
var x = d3.scaleLog()
	.base(10)
	.domain([142, 150000])
	.range([0, width]);

var y = d3.scaleLinear()
	.domain([0, 90])
	.range([height, 0]);
	
var area = d3.scaleLinear()
	.domain([2000, 1400000000])
	.range([25*Math.PI, 1500*Math.PI]);
	
var continentColor = d3.scaleOrdinal(d3.schemePastel1);

//labels
var xLabel = canvas.append("text")
	.attr("y", height+50)
	.attr("x", width/2)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("GDP Per Capita ($)");

var yLabel = canvas.append("text")
	.attr("y", -40)
	.attr("x", -170)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("Life Expectency (Years)");
	
var timeLabel = canvas.append("text")
	.attr("y", height-10)
	.attr("x", width-40)
	.attr("font-size", "40px")
	.attr("opacity", "0.4")
	.attr("text-anchor", "middle")
	.text("1800");
	
	
//x axis
var xAxisCall = d3.axisBottom(x)
	.tickValues([400,4000,40000])
	.tickFormat(d3.format("$"));

canvas.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0, " +height+ ")")
	.call(xAxisCall);

//y axis
var yAxisCall = d3.axisLeft(y)
	.tickFormat(function(d){ return +d });

canvas.append("g")
	.attr("class", "y axis")
	.call(yAxisCall);

//adding a legend
var continents = ["europe", "asia", "americas", "africa"];

var legend = canvas.append("g")
	.attr("transform", "translate(" +(width-10)+ ", " +(height-125)+ ")");
	
continents.forEach(function(continent, i){
	var legendRow = legend.append("g")
		.attr("transform", "translate(0, " +(i*20) + ")");
	
	legendRow.append("text")
		.attr("x", -10)
		.attr("y", 10)
		.attr("text-anchor", "end")
		.style("text-transform", "capitalize")
		.text(continent);
	
	legendRow.append("rect")
		.attr("width", 10)
		.attr("height", 10)
		.attr("fill", continentColor(continent));
});



//read in the data and clean and process it
d3.json("data/data.json").then(function(data){
	//console.log(data);
	
	//clean the data
	formattedData = data.map(function(year){
		return year['countries'].filter(function(country){
			var dataExists = (country.income && country.life_exp);
			return dataExists;
		}).map(function(country){
			country.income = +country.income;
			country.life_exp = +country.life_exp;
			return country;
		})
	})
	//console.log(formattedData);
	
	//first run of the update function
	update(formattedData[0]);
	
}) //d3.json

$("#play-button")
	.on("click", function(){
		var button = $(this);
		if (button.text() == "Play") {
			button.text("Pause");
			interval = setInterval(step, 100);
		}
		else {
			button.text("Play");
			clearInterval(interval);
		}
	});
	
$("#reset-button")
	.on("click", function(){
		time=0;
		update(formattedData[0]);
	});
	
$("#continent-select")
	.on("change", function(){
		update(formattedData[time]);
	});

$("#date-slider").slider({
	max: 2014,
	min: 1800,
	step: 1,
	slide: function(event,ui){
		time = ui.value - 1800;
		update(formattedData[time]);
	}
})


function step() {
	//run the code every 100ms
	time = (time < 214) ? time+1 : 0;
	update(formattedData[time]);
} //step()


//writing our D3 update function

function update(data) {
	//standard transition time for the visualization
	var t = d3.transition().duration(100);
	
	var continent = $("#continent-select").val();
	
	var data = data.filter(function(d){
			if (continent == "all") { return true; }
			else {
				return d.continent == continent;
			}
	})
	
	//JOIN new data with old elements
	var circles = canvas.selectAll("circle")
		.data(data, function(d){ return d.country});
		
	//EXIT old elements not present in our new data
	circles.exit()
		.attr("class", "exit") //not really needed; just for looks
		.remove();
	
	//ENTER new elements present in new data
	circles.enter()
		.append("circle")
			.attr("class", "enter") //not really needed; just for looks
			.attr("fill", function(d){
				return continentColor(d.continent);
			})
			.on("mouseover", tip.show)
			.on("mouseout", tip.hide)
			.merge(circles)
			.transition(t)
				.attr("cy", function(d){ return y(d.life_exp) })
				.attr("cx", function(d){ return x(d.income) })
	.attr("r", function(d){ return Math.sqrt(area(d.population)/Math.PI) })
				
	//update the time label
	timeLabel.text(+(time+1800));
	
	//update the slider
	$("#year")[0].innerHTML = +(time+1800);
	$("#date-slider").slider("value", +(time+1800));
	
} //update


