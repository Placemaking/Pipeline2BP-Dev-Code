import * as React from 'react';
import axios from '../api/axios.js';
import Button from '@mui/material/Button';
import DisplayCards from '../components/DisplayCards';
import { Link, useParams, useLocation } from 'react-router-dom';

import './routes.css';

function TeamHome(props){
    // Load Viewable Projects by Team selected on previous page
    const teams = props.passToken.user?.teams

    let teamInfo = teams
    let projectInfo = ''


    const projectToken = async() => {
        let projectId = teamInfo?.projects;

        try {
            const response = await axios.post('/projects', JSON.stringify({ projectId }), {
               headers: { 'Content-Type': 'application/json' },
               withCredentials: true
            });
            console.log(JSON.stringify(response));
            projectInfo = response.data;
            
        } catch(error){
            //user login error
            console.log('ERROR: ', error);
            return;
        }
    }

    React.useEffect(() => {
        projectToken()
    });

    //project array structure hardcoded on template

    return(
        <div id='teamHome'>
            <div id='newProjectButtonBox'>
                <Button 
                    id='newProjectButton' 
                    variant='contained' 
                    component={ Link } 
                    state={ useLocation.state }
                    to='new'
                >
                    New Project
                </Button>
            </div>
            {/* type = 1 implies the project style cards */}
            <DisplayCards type={ 1 } projects={ projectInfo }/>
        </div>
    );
}
export default TeamHome;