var canvas2 = d3.select("#chart-area2")
	.append("svg")
		.attr("width", width+margin.left+margin.right)
		.attr("height", height+margin.top+margin.bottom)
	.append("g")
		.attr("transform", "translate(" +margin.left+ ", " +margin.top+ ")");
		
var time2 = 0; //represents 1965
var interval2;
var formattedData2;

//tooltip
var tip2 = d3.tip().attr("class", "d3-tip")
	.html(function(d){
		var text = "<strong>Country:</strong> <span style='color:red;'>"
			       + d.country + "</span><br />";
			text += "<strong>Continent:</strong> <span style='color:red; text-transform: capitalize;'>"
			       + d.continent + "</span><br />";
			text += "<strong>Fossil Fuel Consumption Total(Million):</strong> <span style='color:red;'>"
			       + /*d3.format(".0f")*/(d.fuel) + "</span><br />";
			text += "<strong>CO2 Emission Total(Million):</strong> <span style='color:red;'>"
			       + /*d3.format("$,.0f")*/(d.CO2) + "</span><br />";
			text += "<strong>GDP Total(Million):</strong> <span style='color:red;'>"
			       + /*d3.format(",.0f")*/(d.gdp) + "</span><br />";
		return text;
	});
	
canvas2.call(tip2);


//scales
var x2 = d3.scaleLinear()	
	.domain([0, 10500])
	.range([0, width]);

var y2 = d3.scaleLinear()
	//.base(10)
	.domain([0, 3000])
	.range([height, 0]);
	
var area2 = d3.scaleLinear()
	.domain([0, 16200000])
	.range([25*Math.PI, 600*Math.PI]);

//labels
var xLabel2 = canvas2.append("text")
	.attr("y", height+50)
	.attr("x", width/2)
	.attr("font-size", 16)
	.attr("text-anchor", "middle")
	.text("CO2 Emission Total(Million)");

var yLabel2 = canvas2.append("text")
	.attr("y", -60)
	.attr("x", -170)
	.attr("font-size", 16)
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("Fossil Fuel Consumption Total(Million)");
	
var timeLabel2 = canvas2.append("text")
	.attr("y", height-10)
	.attr("x", width-40)
	.attr("font-size", "40px")
	.attr("opacity", "0.4")
	.attr("text-anchor", "middle")
	.text("1965");
	
	
//x axis
var xAxisCall2 = d3.axisBottom(x2)
	//.tickValues([400,4000,40000])
	.tickFormat(function(d){ return +d });

canvas2.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0, " +height+ ")")
	.call(xAxisCall2);

//y axis
var yAxisCall2 = d3.axisLeft(y2)
	.tickFormat(function(d){ return +d });

canvas2.append("g")
	.attr("class", "y axis")
	.call(yAxisCall2);

var legend2 = canvas2.append("g")
	.attr("transform", "translate(" +(width-10)+ ", " +(height-180)+ ")");
	
continents.forEach(function(continent, i){
	var legendRow = legend2.append("g")
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
d3.json("data/bubble1.json").then(function(data){
	//console.log(data);
	
	//clean the data
	formattedData2 = data.map(function(year){
		return year['countries'].filter(function(country){
			var dataExists = (+country.CO2 && country.fuel);
			return dataExists;
		}).map(function(country){
			country.CO2 = +country.CO2;
			country.fuel = +country.fuel;
			return country;
		})
	})
	console.log(formattedData2[0]);
	
	//first run of the update2 function
	update2(formattedData2[0]);
	
}) //d3.json

$("#play-button2")
	.on("click", function(){
		var button = $(this);
		if (button.text() == "Play") {
			button.text("Pause");
			interval2 = setInterval(step2, 300);
		}
		else {
			button.text("Play");
			clearInterval(interval2);
		}
	});
	
$("#reset-button2")
	.on("click", function(){
		time2=0;
		update2(formattedData2[0]);
	});
	
$("#continent-select2")
	.on("change", function(){
		update2(formattedData2[time2]);
	});

$("#date-slider2").slider({
	max: 2014,
	min: 1965,
	step: 1,
	slide: function(event,ui){
		time2 = ui.value - 1965;
		console.log(time2)
		update2(formattedData2[time2]);
	}
})


function step2() {
	//run the code every 100ms
	time2 = (time2 < 49) ? time2+1 : 0;
	update2(formattedData2[time2]);
} //step()


//writing our D3 update2 function

function update2(data) {
	console.log(data[0].continent)
	//standard transition time2 for the visualization
	var t = d3.transition().duration(100);
	
	var continent = $("#continent-select2").val();
	
	var data = data.filter(function(d){
			//console.log(continent)
			if (continent == "all") { return true; }
			else {
				
				return d.continent == continent;
			}
	})
	
	//JOIN new data with old elements
	var circles = canvas2.selectAll("circle")
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
			.on("mouseover", tip2.show)
			.on("mouseout", tip2.hide)
			.merge(circles)
			.transition(t)
				.attr("cy", function(d){ return y2(d.fuel) })
				.attr("cx", function(d){ return x2(d.CO2) })
	.attr("r", function(d){ return Math.sqrt(area2(d.gdp)/Math.PI) })
				
	//update2 the time2 label
	timeLabel2.text(+(time2+1965));
	
	//update2 the slider
	$("#year2")[0].innerHTML = +(time2+1965);
	$("#date-slider2").slider("value", +(time2+1965));
	
} //update2


