import React, { Component } from 'react';
import './Navbar.css';
import logoSmall from '../../img/microsoft_logo_small.png';
//import { authContextApi, authContextDBApi } from '../../js/adalConfig';
import { authContextApi } from '../../js/adalConfig';
import { getLoggedUser } from '../../js/workbenchApi';

class Navbar extends Component {
    constructor(props) {
        super(props);
        this.currentMenu = props.currentMenu;
        this.state = {
            currentUser: {
                firstName: 'Unknown',
                lastName: 'Unknown'
            }
        }
    }

    logOut() {
        authContextApi.logOut();
        //authContextDBApi.logOut();
    }

    openCurrentUser() {
        window.location.href = window.location.origin + '/users/' + this.state.currentUser.userID;
    }

    async componentDidMount() {
        getLoggedUser().then(userReq => {
            if(userReq.response.status === 200) {
                this.setState({
                    currentUser: userReq.content.currentUser
                })
            }
        });
    }

    render() {
        return (
            <div id="navbar">
                <nav className="navbar navbar-expand-lg full-navbar">
                    <a className="navbar-brand" href="http://www.microsoft.com">
                        <img src={logoSmall} alt="Microsoft"/>
                    </a>
                    <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
                        <ul className="navbar-nav mr-auto separate-content">
                            <li className="nav-item">
                                <a style={{ textDecoration: (this.currentMenu === 'shipments' ? 'underline' : 'none')}} className="nav-link shipments-link" href="/shipments">Shipments</a>
                            </li>
                            <li className="nav-item shipments-link">
                                <a style={{ textDecoration: (this.currentMenu === 'users' ? 'underline' : 'none')}} className="nav-link" href="/users">Users</a>
                            </li>
                        </ul>

                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <span className="nav-link name-label" onClick={ this.openCurrentUser.bind(this) }>Current user : {
                                    this.state.currentUser.firstName + ' ' + this.state.currentUser.lastName 
                                }
                                </span>
                            </li>
                            <li className="nav-item">
                                <span className="nav-link" onClick={ this.logOut }>Log out</span>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
        )
    };
}

export default Navbar;