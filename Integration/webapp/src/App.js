import React, { Component } from 'react';
import Login from './components/Login/Login';
import Shipments from './components/Shipments/Shipments';
import ShipmentDetails from './components/ShipmentDetails/ShipmentDetails';
import Error from './components/Error/Error';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { withAdalLoginApi, withAdalLoginDBApi } from './js/adalConfig';

import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route path='/shipments/:id' component={withAdalLoginApi(ShipmentDetails)}/>
            <Route path='/error/:errorCode' component={Error}/>
            <Route exact path='/shipments' component={withAdalLoginApi(Shipments)}/>
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
