import React, { Component } from 'react';
import './MinimalNavbar.css';
import logo from '../../../img/microsoft_logo.png';

class MinimalNavbar extends Component {
    render() {
        return (
            <div id="minimal-navbar">
                <nav className="navbar">
                    <a className="navbar-brand" href="http://www.microsoft.com">
                        <img src={logo} alt="Microsoft"/>
                    </a>
                </nav>
            </div>
        )
    };
}

export default MinimalNavbar;