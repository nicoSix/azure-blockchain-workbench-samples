import React, { Component } from 'react';
import MinimalNavbar from '../../components/MinimalNavbar/MinimalNavbar';

import './Error.css';

/**
 * Error : represents the error page on the Refrigerated Transportation Application
 *
 * @version 1.0.0
 * @author [Nicolas Six](https://github.com/nicoSix)
 */
class Error extends Component {
    constructor(props) {
        super(props);
        if(this.props.match.params.errorCode != null)
            this.error = this.props.match.params.errorCode; 
        else this.error = 'not_found';

        console.log(this.error);
    }

    /**
     * goToShipments: redirect the user to shipments page
     */
    goToShipments() {
        this.props.history.push('/shipments');
    }

    /**
     * getErrorText: return a JSX object containing the detail about an error
     */
    getErrorText() {
        switch(this.error) {
            case 'unauthorized':
                return  (<span>You don't have access to this page.
                        Try to log in again, or contact your administrator.</span>)

            case 'not_found':
                return  (<span>This page doesn't exist.
                Click on the button below to go back to the main menu.</span>)

            case 'server_error':
                return  (<span>The server returned an internal error code.
                Contact your administrator to fix the problem.</span>)


            default:
                return (<span>This page doesn't exist.
                Click on the button below to go back to the main menu.</span>)

        }
    }

    /**
     * getErrorTitle: return a JSX object containing the title which describes an error
     */
    getErrorTitle() {
        switch(this.error) {
            case 'unauthorized':
                return (<span>Error 401 : unauthorized.</span>)

            case 'server_error':
                return (<span>Error 500 : internal server error.</span>)

            default:
                return (<span>Error 404 : page not found.</span>)
        }
    }

    render() {
        return (
            <div id="error">
                <MinimalNavbar/>
                <div className="centered">
                    <h1 className="error-text">{ this.getErrorTitle() }</h1>
                    <p className="error-text">
                        { this.getErrorText() }
                    </p>
                    <div className="error-button"><button className="btn btn-primary" onClick={this.goToShipments.bind(this)}>Return to menu</button></div>
                </div>
            </div>
        )
    };
}

export default Error;