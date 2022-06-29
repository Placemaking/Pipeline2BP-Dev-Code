import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AppNavBar from './components/AppNavBar';
import Home from './routes/Home';
import Title from './routes/Title';
import Projects from './routes/Projects';
import NewProject from './routes/NewProject';
import NewUser from './routes/NewUser';
import SettingsPage from './routes/SettingsPage';
import EditProject from './routes/EditProject';
import ProjectPage from './routes/ProjectPage';
import NewProjectPoints from './routes/NewProjectPoints';
import NewProjectArea from './routes/NewProjectArea';
import ProjectForm from './routes/ProjectForm';

function App() {
    // !! token/storage of choice, verification of choice
    const [token, setToken] = React.useState({});

    // true == active user (logged in)
    // check token in place with more persistant storage
    const [state, setState] = React.useState(/*token !== null && token !== '' ? true : */false);
    

    // Set user vars to access the user home page
    function handleOnLogin(active, token) {
        // Will be used to block users from user pages unless logged in
        setState(active);
        setToken(token);
    }

    // clear all fields on logout
    function handleOnLogout(active) {
        // setUser({});
        // setEmail("");
        // setPassword("");
        // localStorage.clear();
        setState(active);
    }

    function TeamPages(){
        // User Pages
        // (heroku-url)/home/teams/:id/(any url below)
        return(
            <div id='teamPages'>
                <Routes>
                    {/* Find a more stable/consistent way to manage tokens instead of passing states, they can expire after a few mintues*/}
                    <Route index element={<Projects passToken={token}/>}/>
                    <Route path='projects/:id/*' element={<ProjectPage />} />
                    <Route path='new' element={<NewProject />} />
                    <Route path='new/area/points' element={<NewProjectPoints />} />
                    <Route path='new/area/points/form' element={<ProjectForm />} />
                    <Route path='new/area' element={<NewProjectArea />} />
                    <Route path='edit/:id' element={<EditProject />} />
                </Routes>
            </div>
        );
    }

    // Pages to be accessed by a logged in user
    // can be reached at (heroku-url)/home/(any component path below), ex: (url)/home/settings
    function UserRoutes() {
        
        const passLogout = (active) => {
            handleOnLogout(active);
        }

        //Logout button in AppNavBar, so logout function is passed there
        return (
            <div id='userRoutes'>
                <AppNavBar passLogout={ passLogout } passToken={ token }/>
                <Routes>
                    <Route index element={ <Home passToken={ token }/>} />
                    <Route path='teams/:id/*' element={ <TeamPages /> } />
                    <Route path='settings' element={ <SettingsPage /> } />
                </Routes>
            </div>
        );
    } 

    // (heroku-url)/(any path below)
    return(
        <Router>
            <Routes>
                {/* pass onLogin function to handle user state pass for new user as well (?)*/}
                <Route index element={<Title onLogin={handleOnLogin}/>}/>
                    <Route path='home/*' element={<UserRoutes />}/>
                <Route path='new' element={<NewUser onLogin={handleOnLogin} />} />
            </Routes>
        </Router>
    );
}

export default App;