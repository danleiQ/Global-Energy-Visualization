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
		
var time = 0; //represents 1965
var interval;
var formattedData;

//tooltip
var tip = d3.tip().attr("class", "d3-tip")
	.html(function(d){
		var text = "<strong>Country:</strong> <span style='color:red;'>"
			       + d.country + "</span><br />";
			text += "<strong>Continent:</strong> <span style='color:red; text-transform: capitalize;'>"
			       + d.continent + "</span><br />";
			text += "<strong>Fossil Fuel Consumption Per Person(Million):</strong> <span style='color:red;'>"
			       + /*d3.format(".0f")*/(d.fuel) + "</span><br />";
			text += "<strong>CO2 Emission Per Person:</strong> <span style='color:red;'>"
			       + /*d3.format("$,.0f")*/(d.CO2) + "</span><br />";
			text += "<strong>GDP Per Person:</strong> <span style='color:red;'>"
			       + /*d3.format(",.0f")*/(d.gdp) + "</span><br />";
		return text;
	});
	
canvas.call(tip);


//scales
var x = d3.scaleLinear()	
	.domain([0, 100])
	.range([0, width]);

var y = d3.scaleLinear()
	//.base(10)
	.domain([0, 11000])
	.range([height, 0]);
	
var area = d3.scaleLinear()
	.domain([0, 115000])
	.range([25*Math.PI, 600*Math.PI]);
	
var continentColor = d3.scaleOrdinal(d3.schemeSet2);

//labels
var xLabel = canvas.append("text")
	.attr("y", height+50)
	.attr("x", width/2)
	.attr("font-size", 16)
	.attr("text-anchor", "middle")
	.text("CO2 Emission Per Person");

var yLabel = canvas.append("text")
	.attr("y", -60)
	.attr("x", -170)
	.attr("font-size", 16)
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("Fossil Fuel Consumption Per Person(Million)");
	
var timeLabel = canvas.append("text")
	.attr("y", height-10)
	.attr("x", width-40)
	.attr("font-size", "40px")
	.attr("opacity", "0.4")
	.attr("text-anchor", "middle")
	.text("1965");
	
	
//x axis
var xAxisCall = d3.axisBottom(x)
	//.tickValues([400,4000,40000])
	.tickFormat(function(d){ return +d });

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
var continents = ["Africa", "Asia", "Europe", "North America", "Oceania", "South America"];

var legend = canvas.append("g")
	.attr("transform", "translate(" +(width-10)+ ", " +(height-180)+ ")");
	
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
d3.json("data/bubble2.json").then(function(data){
	//console.log(data);
	
	//clean the data
	formattedData = data.map(function(year){
		return year['countries'].filter(function(country){
			var dataExists = (+country.CO2 && country.fuel);
			return dataExists;
		}).map(function(country){
			country.CO2 = +country.CO2;
			country.fuel = +country.fuel;
			return country;
		})
	})
	console.log(formattedData[0]);
	
	//first run of the update function
	update(formattedData[0]);
	
}) //d3.json

$("#play-button")
	.on("click", function(){
		var button = $(this);
		if (button.text() == "Play") {
			button.text("Pause");
			interval = setInterval(step, 300);
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
	max: 2016,
	min: 1965,
	step: 1,
	slide: function(event,ui){
		time = ui.value - 1965;
		console.log(time)
		update(formattedData[time]);
	}
})


function step() {
	//run the code every 100ms
	time = (time < 51) ? time+1 : 0;
	update(formattedData[time]);
} //step()


//writing our D3 update function

function update(data) {
	console.log(data[0].continent)
	//standard transition time for the visualization
	var t = d3.transition().duration(100);
	
	var continent = $("#continent-select").val();
	
	var data = data.filter(function(d){
			//console.log(continent)
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
			.style("opacity", 0.8)
			.on("mouseover", tip.show)
			.on("mouseout", tip.hide)
			.merge(circles)
			.transition(t)
				.attr("cy", function(d){ return y(d.fuel) })
				.attr("cx", function(d){ return x(d.CO2) })
	.attr("r", function(d){ return Math.sqrt(area(d.gdp)/Math.PI) })
				
	//update the time label
	timeLabel.text(+(time+1965));
	
	//update the slider
	$("#year")[0].innerHTML = +(time+1965);
	$("#date-slider").slider("value", +(time+1965));
	
} //update


