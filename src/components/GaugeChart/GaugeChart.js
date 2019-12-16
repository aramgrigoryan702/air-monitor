import React from 'react';

let uniqueId = 0;

let defaultProps = {
    label: "Gauge",
    min: 0,
    max: 100,
    value: 40,
    width: 400,
    height: 75,
    color: '#fe0400',
    backgroundColor: "#edebeb",
    topLabelStyle: {
        textAnchor: "middle",
        fill: "#999999",
        stroke: "none",
        fontStyle: "normal",
        fontVariant: "normal",
        fontWeight: 'bold',
        fontStretch: 'normal',
        lineHeight: 'normal',
        fillOpacity: 1
    },
    valueLabelStyle: {
        textAnchor: "middle",
        fill: "#010101",
        stroke: "none",
        fontStyle: "normal",
        fontVariant: "normal",
        fontWeight: 'bold',
        fontStretch: 'normal',
        lineHeight: 'normal',
        fillOpacity: 1
    },
    minMaxLabelStyle: {
        textAnchor: "middle",
        fill: "#999999",
        stroke: "none",
        fontStyle: "normal",
        fontVariant: "normal",
        fontWeight: 'normal',
        fontStretch: 'normal',
        fontSize: 20,
        lineHeight: 'normal',
        fillOpacity: 1
    },
    valueFormatter: (value) => `${value}`
};

function useGaugeChart(props) {

    let uniqueFilterId;
    let propsVal = {...defaultProps, ...props};

    let topLabelStyle = (propsVal.topLabelStyle.fontSize
        ? propsVal.topLabelStyle
        : { ...propsVal.topLabelStyle, fontSize: (propsVal.width / 10) });
    let valueLabelStyle = (propsVal.valueLabelStyle.fontSize
        ? propsVal.valueLabelStyle
        : { ...propsVal.valueLabelStyle, fontSize: (propsVal.width / 5) });

    function _getPathValues  (value)  {
        if (value < propsVal.min) propsVal.value = propsVal.min;
        if (value > propsVal.max) propsVal.value = propsVal.max;

        let dx = 0;
        let dy = 0;

        let alpha = (1 - (value - propsVal.min) / (propsVal.max - propsVal.min)) * Math.PI;
        let Ro = propsVal.width / 2 - propsVal.width / 10;
        let Ri = Ro - propsVal.width / 6.666666666666667;

        let Cx = propsVal.width / 2 + dx;
        let Cy = propsVal.height / 1.25 + dy;
        let Xo = propsVal.width / 2 + dx + Ro * Math.cos(alpha);
        let Yo = propsVal.height - (propsVal.height - Cy) - Ro * Math.sin(alpha);
        let Xi = propsVal.width / 2 + dx + Ri * Math.cos(alpha);
        let Yi = propsVal.height - (propsVal.height - Cy) - Ri * Math.sin(alpha);
        return { alpha, Ro, Ri, Cx, Cy, Xo, Yo, Xi, Yi };
    };

    function _getPath (value)  {
        let { Ro, Ri, Cx, Cy, Xo, Yo, Xi, Yi } = _getPathValues(value);

        let path = "M" + (Cx - Ri) + "," + Cy + " ";
        path += "L" + (Cx - Ro) + "," + Cy + " ";
        path += "A" + Ro + "," + Ro + " 0 0 1 " + Xo + "," + Yo + " ";
        path += "L" + Xi + "," + Yi + " ";
        path += "A" + Ri + "," + Ri + " 0 0 0 " + (Cx - Ri) + "," + Cy + " ";
        path += "Z ";
        return path;
    };

    let { Cx, Ro, Ri, Xo, Cy, Xi } = _getPathValues(propsVal.max);

    if (!uniqueFilterId) uniqueFilterId = "filter_" + uniqueId++;

    return {propsVal, uniqueFilterId, Cx, Ro, Ri, Xo, Cy, Xi,topLabelStyle,valueLabelStyle, _getPath};

}

const GaugeChart = React.memo((props)=>{
    const {propsVal, uniqueFilterId, Cx, Ro, Ri, Xo, Cy, Xi,topLabelStyle,valueLabelStyle, _getPath} = useGaugeChart(props);

    return (
        <svg height="100%" version="1.1" width="100%" xmlns="http://www.w3.org/2000/svg" style={{
            width: propsVal.width,
            height: propsVal.height,
            overflow: 'hidden',
            position: 'relative',
            left: 0,
            top: 0
        }}>
            <defs>
                <filter id={uniqueFilterId}>
                    <feOffset dx="0" dy="3"/>
                    <feGaussianBlur result="offset-blur" stdDeviation="5"/>
                    <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
                    <feFlood floodColor="black" floodOpacity="0.2" result="color"/>
                    <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
                    <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
                </filter>
            </defs>
            <path fill={propsVal.backgroundColor} stroke="none" d={_getPath(propsVal.max)}
                  filter={"url(#" + uniqueFilterId + ")"}/>
            <path style={ {transition: 'all 0.3s ease-out'}} fill={propsVal.color} stroke="none" d={_getPath(propsVal.value)}
                  filter={"url(#" + uniqueFilterId + ")"}/>
            <text x={propsVal.width / 2} y={propsVal.height / 5 * 4} textAnchor="middle" style={valueLabelStyle}>
                { propsVal.valueFormatter(propsVal.value) }
            </text>
            <text x={((Cx - Ro) + (Cx - Ri)) / 2} y={Cy + 25} textAnchor="middle" style={propsVal.minMaxLabelStyle}>
                {propsVal.min}
            </text>
            <text x={(Xo + Xi) / 2} y={Cy + 25} textAnchor="middle" style={propsVal.minMaxLabelStyle}>
                {propsVal.max}
            </text>
        </svg>
    )

});


export default GaugeChart;