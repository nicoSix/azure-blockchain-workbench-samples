import React, { Component } from 'react';
import Login from './components/pages/Login/Login';
import Shipments from './components/pages/Shipments/Shipments';
import ShipmentDetails from './components/pages/ShipmentDetails/ShipmentDetails';
import Error from './components/pages/Error/Error';
import Users from './components/pages/Users/Users';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { withAdalLoginApi } from './js/adalConfig';

import './App.css';

/**
 * App : main component, contains a router which redirects to a specified page of the app depending of the taken route
 *
 * @version 1.0.0
 * @author [Nicolas Six](https://github.com/nicoSix)
 */
class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route path='/shipments/:id' component={withAdalLoginApi(ShipmentDetails)}/>
            <Route path='/error/:errorCode' component={Error}/>
            <Route exact path='/shipments' component={withAdalLoginApi(Shipments)}/>
            <Route exact path='/users' component={withAdalLoginApi(Users)}/>
            <Route exact path='/error' component={Error}/>
            <Route exact path='/' component={Login}/>
            <Route component={Error}/>
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
