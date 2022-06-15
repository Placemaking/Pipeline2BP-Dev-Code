import * as React from 'react';
import Map from '../components/Map';
import { useLocation } from 'react-router-dom';

function NewArea() {
    const loc = useLocation();

    const [values, setValues] = React.useState({
        center: loc.state.center,
        title: loc.state.title, 
        zoom: loc.state.zoom
    });

    return (
        <div id='newArea'>
            {/* Empty New Project page, Google map component w/ searchable locations for new projects */}
            <Map center={values.center} title={values.title} type={4} zoom={values.zoom} />
        </div>
    );
}

export default NewArea;