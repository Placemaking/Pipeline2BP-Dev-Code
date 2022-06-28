import * as React from 'react';
import Map from '../components/Map';
import './routes.css';

function MapPage(props) {
    const drawers = props.drawers;
    const title = props.title;
    const area = props.area;
    const center = props.center;

    //Map Drawers moved inside Map component for more direct data Passing
    return (
        <div id='MapPage'>
            {/* Map type 1 implies viewing project map and activity results */}
            <Map
                title={ title }
                center={ center } 
                zoom={ 16 } 
                type={ 1 }
                drawers={ drawers }
                area={ area }
            />
        </div>
    );
}

export default MapPage;