//force layout

var w = 500,
    h = 500;
	
var circleWidth = 5;

var palette = {
  'lightgray'    : '#819090',
  'gray'         : '#708284',
  'mediumgray'     : '#536870',
  'darkgray'       : '#475B62',
  'darkblue'       : '#0A2933',
  'darkerblue'     : '#042029',
  'paleryellow'    : '#FCF4DC',
  'paleyellow'     : '#EAE3CB',
  'yellow'        : '#A57706',
  'orange'         : '#BD3613',
  'red'            : '#D11C24',
  'pink'           : '#C61C6F',
  'purple'         : '#595AB7',
  'blue'           : '#2176C7',
  'cyan'           : '#259286',
  'green'          : '#738A05'
};

var nodes = [{name: "Energy"},
			 {name: "Nuclear", target: [0]},
		     {name: "Hydroelectricity ", target: [0]},
			 {name: "Fossil Fuel", target: [0]},
			 {name: "Coal", target: [3]},
			 {name: "Natural gas", target: [3]},
			 {name: "Oil", target: [3]}];
			 
var links = [];

for (var i=0; i<nodes.length; i++) {
	if (nodes[i].target !== undefined){
		for (var x=0; x<nodes[i].target.length; x++) {
			links.push({
				source: nodes[i],
				target: nodes[nodes[i].target[x]]
			});
		}
	}
}

var myChart = d3.select("#chart")
	.append("svg")
	.attr("width", w)
	.attr("height", h);
	
var force = d3.layout.force()
	.nodes(nodes)
	.links([]) //place holder for now
	.gravity(0.1)
	.charge(-1000)
	.size([w,h]);
	
var link = myChart.selectAll('line')
	.data(links).enter().append('line').attr("stroke", palette.gray);
	
var node = myChart.selectAll("circle")
	.data(nodes).enter().append('g').call(force.drag);
	
node.append("circle")
	.attr("cx", function(d) { return d.x })
	.attr("cy", function(d) { return d.y })
	.attr("r", circleWidth)
	.attr("fill", palette.pink);
	
node.append('text')
	.text(function(d){ return d.name; })
	.attr("font-family", "Roboto Slab")
	.attr("fill", function(d,i){
		if (i>0) { return palette.pink; }
		else { return palette.blue; }
	})
	.attr("text-anchor", function(d,i){
		if (i > 0) { return "start"; }
		else { return "end"; }
	})
	.attr("x", function(d,i){
		if (i>0) { return circleWidth + 4; }
		else { return circleWidth - 15; }
	})
	.attr("y", function(d,i){
		if (i>0) { return circleWidth; }
		else { return 8; }
	})
	.attr("font-size", function(d,i){
		if (i>0) {return '1em'; }
	else { return '1.8em'; }
	})
	
	
	
	
force.on('tick', function(e){
	node.attr('transform', function(d,i){
		return 'translate('+ d.x + ', ' + d.y + ')'
	})
	
	link
		.attr('x1', function(d) { return d.source.x })
		.attr('y1', function(d) { return d.source.y })
		.attr('x2', function(d) { return d.target.x })
		.attr('y2', function(d) { return d.target.y });
	
})	

force.start()

	
	