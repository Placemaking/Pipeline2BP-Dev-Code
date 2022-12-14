import React, { useState } from 'react';
import { ViewableArea, ContentContainer } from '../../components/content.component.js'
import { HeaderBack } from '../../components/headers.component';
import { getDayStr, getTimeStr } from '../../components/timeStrings.component.js';
import { BoundaryMapResults } from '../../components/Maps/boundaryMapResults.component.js'

export function BoundaryMapResultsView(props) {
    // this console log shows all the collected data for the test
    // console.log(props.selectedResult);
    
    const [area] = useState(props.selectedResult.sharedData.area.points)
    const [position] = useState(props.selectedResult.standingPoints)

    // Temp marker, inputted data points, and all of their locations
    const [data, setData] = useState(props.selectedResult.data)

    let startTime = new Date(props.selectedResult.date);
    let day = new Date(props.selectedResult.sharedData.date);

    // Main render
    return(
        <ViewableArea>
            <HeaderBack {...props} text={getDayStr(day)+ " - " + getTimeStr(startTime)}/>
            <ContentContainer>

                <BoundaryMapResults
                    area={area}
                    position={position}
                    dataMarkers={data}
                    graph={props.selectedResult.graph}
                />

            </ContentContainer>
        </ViewableArea>
    )
}