import * as d3 from "d3";

export  const WindDirections = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

let index= 0;
export  const WindDirectionsWeight  = WindDirections.reduce((acc, keyName)=>{
  acc[keyName] = index++;
  return  acc;
}, {})

export  const  WindroseColorScale = d3.scaleOrdinal().domain(WindDirections).range(["#eb3224", "#ef772f", "#f5ba41","#e3fc52", "#a0fa4e","#89f94d","#75f950","#74faa2","#72fbfc",  "#3890f7", "#034ef5","#0e25f5","#722cf2","#cc3af6","#ea3cd6","#eb3468"]);
;
