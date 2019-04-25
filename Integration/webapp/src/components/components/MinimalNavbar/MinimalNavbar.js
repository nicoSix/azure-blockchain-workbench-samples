import React from 'react';
import './MinimalNavbar.css';
import logo from '../../../img/microsoft_logo.png';

/**
 * ChooseActionDropdown: a React functional component which displays a transparent navbar with Microsoft logo 
 *
 * @version 1.0.0
 * @author [Nicolas Six](https://github.com/nicoSix)
 */
const MinimalNavbar = () => {
    return (
        <div id="minimal-navbar">
            <nav className="navbar">
                <a className="navbar-brand" href="http://www.microsoft.com">
                    <img src={logo} alt="Microsoft"/>
                </a>
            </nav>
        </div>
    )
}

export default MinimalNavbar;