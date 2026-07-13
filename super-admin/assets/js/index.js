$(function () {
	"use strict";


	// chart 1
	var options = {
		series: [{
			name: 'Sales Overview',
			data: [10, 25, 42, 12, 55, 30, 63, 27, 20]
		}],
		chart: {
			foreColor: '#9ba7b2',
			height: 330,
			type: 'bar',
			zoom: {
				enabled: false
			},
			toolbar: {
				show: false
			},
		},
		stroke: {
			width: 0,
			curve: 'smooth'
		},
		plotOptions: {
			bar: {
				horizontal: !1,
				columnWidth: "30%",
				endingShape: "rounded"
			}
		},
		grid: {
			borderColor: 'rgba(177, 139, 94, 0.09)',
			strokeDashArray: 4,
			yaxis: {
				lines: {
					show: true
				}
			}
		},
		fill: {
			type: 'gradient',
			gradient: {
			  shade: 'light',
			  type: 'vertical',
			  shadeIntensity: 0.5,
			  gradientToColors: ['#99754C'],
			  inverseColors: true,
			  opacityFrom: 1,
			  opacityTo: 1,
			}
		  },
		colors: ['#B18B5E'],
		dataLabels: {
			enabled: false,
			enabledOnSeries: [1]
		},
		xaxis: {
			categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
		},
	};
	if (document.querySelector("#chart1")) {
		var chart = new ApexCharts(document.querySelector("#chart1"), options);
		chart.render();
	}
	



// chart 2

var options = {
	series: [10, 25, 10],
	chart: {
		height: 255,
		type: 'donut',
	},
	legend: {
		position: 'bottom',
		show: false,
	},
	plotOptions: {
		pie: {
			// customScale: 0.8,
			donut: {
				size: '80%'
			}
		}
	},
	colors: [ "#B18B5E", "#1A1A1A", "#E5D5C5"],
	dataLabels: {
		enabled: false
	},
	labels: ['Mobile', 'Desktop', 'Tablet'],
	responsive: [{
		breakpoint: 480,
		options: {
			chart: {
				height: 200
			},
			legend: {
				position: 'bottom'
			}
		}
	}]
};
if (document.querySelector("#chart2")) {
	var chart = new ApexCharts(document.querySelector("#chart2"), options);
	chart.render();
}



  // chart 3

	var options = {
		series: [{
			name: 'Monthly Views',
			data: [10, 25, 42, 12, 55, 30, 63, 27, 20]
		}],
		chart: {
			foreColor: '#9ba7b2',
			height: 250,
			type: 'line',
			zoom: {
				enabled: false
			},
			toolbar: {
				show: false
			},
		},
		stroke: {
			width: 4,
			curve: 'smooth'
		},
		plotOptions: {
			bar: {
				horizontal: !1,
				columnWidth: "30%",
				endingShape: "rounded"
			}
		},
		grid: {
			borderColor: 'rgba(177, 139, 94, 0.09)',
			strokeDashArray: 4,
			yaxis: {
				lines: {
					show: true
				}
			}
		},
		fill: {
			type: 'gradient',
			gradient: {
			  shade: 'light',
			  type: 'vertical',
			  shadeIntensity: 0.5,
			  gradientToColors: ['#99754C'],
			  inverseColors: true,
			  opacityFrom: 1,
			  opacityTo: 1,
			}
		  },
		colors: ['#0d6efd'],
		dataLabels: {
			enabled: false,
			enabledOnSeries: [1]
		},
		xaxis: {
			categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
		},
	};
	if (document.querySelector("#chart3")) {
		var chart = new ApexCharts(document.querySelector("#chart3"), options);
		chart.render();
	}
	





  // chart 4

  var options = {
	series: [{
		name: 'Monthly Users',
		data: [2, 45, 30, 80, 55, 30, 63, 27, 5]
	}],
	chart: {
		foreColor: '#9ba7b2',
		height: 250,
		type: 'area',
		zoom: {
			enabled: false
		},
		toolbar: {
			show: false
		},
	},
	stroke: {
		width: 3,
		curve: 'smooth'
	},
	plotOptions: {
		bar: {
			horizontal: !1,
			columnWidth: "30%",
			endingShape: "rounded"
		}
	},
	grid: {
		borderColor: 'rgba(177, 139, 94, 0.09)',
		strokeDashArray: 4,
		yaxis: {
			lines: {
				show: true
			}
		}
	},
	fill: {
		type: 'gradient',
		gradient: {
		  shade: 'light',
		  type: 'vertical',
		  shadeIntensity: 0.5,
		  gradientToColors: ['#99754C'],
		  inverseColors: false,
		  opacityFrom: 0.8,
		  opacityTo: 0.2,
		}
	  },
	colors: ['#B18B5E'],
	dataLabels: {
		enabled: false,
		enabledOnSeries: [1]
	},
	xaxis: {
		categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
	},
};
if (document.querySelector("#chart4")) {
	var chart = new ApexCharts(document.querySelector("#chart4"), options);
	chart.render();
}








    	
});