import React from 'react';

const Legend = React.memo(function Legend(props) {
    const {data, dimensions, colorScale, hoveredDate, hoveredValueState, orient, alignTo} = props;
    const {boundedWidth} = dimensions;
    const legendHeight = 20;
    let legendWidth = 70;
    let yPostion = dimensions.boundedHeight + 85;
    if (alignTo && alignTo === 'xAxis') {
        yPostion = dimensions.boundedHeight + 45;
    }
    const dataLen = data.length;
    let legendStartPosition = React.useMemo(() => (dimensions.boundedWidth / 2) - ((legendWidth * dataLen) / 2), [dimensions, dataLen]);
    return (
        <React.Fragment>
            {orient === 'bottom' ? (
                <React.Fragment>
                    {data && data.map((item, i) => (
                        <g key={'legend-key-' + i}
                           transform={`translate(${legendStartPosition + legendWidth * (i)},${yPostion})`}>
                            <rect className={'legendBox'} x={"10px"} y={"0"} height={'10'} width={'10'}
                                  style={{fill: colorScale(i)}}></rect>
                            <text x={"25px"} y={"0"} dy={'10px'} style={{
                                'fill': 'white',
                                'fontSize': '12px',
                                "textAnchor": 'start'
                            }}> {item.name}</text>
                        </g>
                    ))}
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <g transform={`translate(${boundedWidth + 120},${legendHeight})`}>
                        <text id={"selected_date_label"} x={"30px"} y={"0"} dx={'49px'} dy={'0px'}
                              style={{'fill': 'white', 'fontSize': '16px', "textAnchor": 'end'}}> {hoveredDate} </text>
                    </g>
                    {data && data.map((item, i) => (
                        <g key={'legend-key-' + i}
                           transform={`translate(${boundedWidth + 100},${legendHeight + legendHeight * (i + 1)})`}>
                            <text x={"0px"} y={"0"} dx={'-30px'} dy={'10px'}
                                  style={{'fill': 'white', 'fontSize': '16px', "textAnchor": 'end'}}> {hoveredValueState
                            && hoveredValueState[item.name]} </text>
                            <rect className={'legendBox'} x={"30px"} y={"0"} height={'10'} width={'10'}
                                  style={{fill: colorScale(i)}}></rect>
                            <text x={"50px"} y={"0"} dx={'30px'} dy={'10px'} style={{
                                'fill': 'white',
                                'fontSize': '16px',
                                "textAnchor": 'middle'
                            }}> {item.name}</text>
                        </g>
                    ))}
                </React.Fragment>
            )}

        </React.Fragment>
    )
});


export default Legend;
