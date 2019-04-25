import React, { Component } from 'react';
import { addAssignmentToUser } from '../../../js/workbenchApi';
import { getRoleFromRoleId } from '../../../js/util';
import './ChooseRoleDropdown.css';

/**
 * ChooseRoleDropdown: a React component which displays possible roles which can be given to a user
 * @version 1.0.0
 * @author [Nicolas Six](https://github.com/nicoSix)
 */
class ChooseRoleDropdown extends Component {
    constructor(props) {
        super(props);
        this.rolesAlreadyOwned = props.rolesAlreadyOwned;
        this.userId = props.userId;
        this.parent = props.parent;
        this.state = {
            availableRoles: []
        }
    }

    componentDidMount() {
        this.setAvailableRoles();
    }

    /**
     * setAvailableRoles: retrieve available roles which can be taken by a user in the app, 
     * and put them into the dropdown without forgetting to remove roles that the user already have
     */
    setAvailableRoles() {
        var availableRoles = [];
        var roleIdAlreadyOwned = [];

        this.rolesAlreadyOwned.forEach(roleAlreadyOwned => {
            roleIdAlreadyOwned.push(roleAlreadyOwned.applicationRoleId);
        })

        for(var i = 1; i <= 5; i++) {
            if(!roleIdAlreadyOwned.includes(i)) availableRoles.push(i);
        }

        this.setState({
            availableRoles: availableRoles
        })
    }

    /**
     * addRoleToUser: add the dropdown selected role to the user linked to the dropdown
     * 
     * @param {int} roleId
     */
    addRoleToUser(roleId) {
        addAssignmentToUser(this.userId, roleId).then(userReq => {
            if(userReq.response.status === 200) {
                this.setState({
                    availableRoles: this.state.availableRoles.filter(function(roleIdInArray) {return roleIdInArray !== roleId})
                });

                this.parent.setUsersInState();
            }
        });
    }

    render() {
        return (
            <div id="chooseRoleDropdown" className="dropdown">
                <button ref="dropdownBtn" className="btn btn-smoothblue btn-block dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    + Add role
                </button>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    {(this.state.availableRoles.length === 0 ? 
                        <span key='0' className="dropdown-item">No available role</span> : 
                        this.state.availableRoles.map((rId, index) =>
                            <span key={ index } onClick={this.addRoleToUser.bind(this, rId)} className="dropdown-item">{ getRoleFromRoleId(rId) }</span>
                        )
                    )}
                </div>
            </div>
        );
    }
}

export default ChooseRoleDropdown;