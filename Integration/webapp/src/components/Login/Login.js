import React, { Component } from 'react';
import MicrosoftIcon from 'react-icons/lib/ti/vendor-microsoft';
import MinimalNavbar from '../MinimalNavbar/MinimalNavbar';

import './Login.css';

class Login extends Component {
    constructor(props) {
        super(props);
    }

    goToShipments() {
        window.location.href = window.location.origin + '/shipments';
    }

    render() {
        return (
            <div id="login">
                <MinimalNavbar/>
                <div className="centered">
                    <h1 className="login-text">Refrigerated Transportation application</h1>
                    <p className="login-text">
                        Welcome to the Refrigerated Transportation application portal.
                        Please login with your Microsoft account to enter.
                    </p>
                    <div className="login-button"><button className="btn btn-primary" onClick={this.goToShipments.bind(this)}><MicrosoftIcon/> Sign in with Microsoft</button></div>
                </div>
            </div>
        )
    };
}

export default Login;