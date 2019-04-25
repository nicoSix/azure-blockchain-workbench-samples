import React, { Component } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import ChooseRoleDropdown from '../../components/ChooseRoleDropdown/ChooseRoleDropdown';
import loadingGif from '../../../img/loading.gif';
import { getUsers, deleteAssignmentToUser, getUserRights } from '../../../js/workbenchApi';
import { getRoleFromRoleId } from '../../../js/util';
import * as qs from 'query-string';
import './Users.css';

/**
 * Users : represents users page on the Refrigerated Transportation Application
 *
 * @version 1.0.0
 * @author [Nicolas Six](https://github.com/nicoSix)
 */
class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            filteredUsers: [],
            displayLoadingGif: true,
            predefinedName: (qs.parse(props.location.search).name !== undefined ? qs.parse(props.location.search).name : false),
            canUserModifyRoles: false
        };

        document.body.style.background = 'white';
    }

    componentDidMount() {
        this.canUserModifyRoles()
        this.setUsersInState();
    }

    /**
     * canUserModifyRoles : make a request to set in state a boolean indicating if the user can modify roles or not
     */
    canUserModifyRoles() {
        getUserRights().then(userReq => {
            if(userReq.response.status === 200) {
                this.setState({
                    canUserModifyRoles: (userReq.content["canModifyRoleAssignments"])
                });
            }
        })
    }

    /**
     * deleteAssignment : delete an assignment of a user (only available for admins)
     * 
     * @param {JSON} assignment object containing assignment information (ID, name ...)
     */
    deleteAssignment(assignment) {
        deleteAssignmentToUser(assignment).then(response => {
            if(response.status === 204) {
                this.setUsersInState();
            }
        });
    } 

    /**
     * getRoleLabels : generate labels in the assignment column which indicates user roles
     * 
     * @param {JSON} assignments object containing assignments with their information (ID, name ...)
     */
    getRoleLabels(assignments) {
        var stringAssignments = [];
        var i = 0;
        assignments.forEach(assignment => {
            stringAssignments.push(
                <span key={i} className="badge badge-smoothblue">{ getRoleFromRoleId(assignment.applicationRoleId) }
                    { this.state.canUserModifyRoles ? <i onClick={ this.deleteAssignment.bind(this, assignment) } style={{cursor: 'pointer'}}> x</i> : <span/> }
                </span>
            );
            i++;
        });

        return stringAssignments;
    }

    /**
     * filterUsers : hide users in the table if they are not corresponding to asked criterias
     */
    filterUsers() {
        var keepValue;
        var tempUsers = [];

        this.setState({ filteredUsers: [], displayLoadingGif: true});

        this.state.users.forEach(user => {
            keepValue = true;
            if(this.refs.userSearchField.value !== '' && !this.isUserSearched(user.firstName.toLowerCase(), user.lastName.toLowerCase())) keepValue = false;
            if (keepValue) tempUsers.push(user);
        });

        if(this.state.reverse) this.setState({filteredUsers: tempUsers.reverse(), displayLoadingGif: false});
        else this.setState({filteredUsers: tempUsers, displayLoadingGif: false});
    }

    /**
     * filterUsersDelayed : set a timeout which calls the filterUsers function after a fixed amount of time (to avoid mass refreshs when typing for a user in the search bar)
     */
    filterUsersDelayed() {
        clearTimeout(this.inputTimeout);
        this.inputTimeout = setTimeout(this.filterUsers.bind(this), 500);
    }

    /**
     * isUserSearched : return a boolean which indicates if the user 
     */
    isUserSearched(firstName, lastName) {
        if((firstName + lastName).includes(this.refs.userSearchField.value.replace(/\s/g, '').toLowerCase())) return true;
        if((lastName + firstName).includes(this.refs.userSearchField.value.replace(/\s/g, '').toLowerCase())) return true;
        return false;
    }

    /**
     *  setUsersInState : set the user variable in the state, after requesting for them
     */
    setUsersInState() {
        this.setState({ displayLoadingGif: true, filteredUsers: [] });
        getUsers().then(usersRequest => {
            switch(usersRequest.response.status) {
                case 200: 
                    this.setState({
                        users: usersRequest.content.users,
                        filteredUsers: usersRequest.content.users,
                        displayLoadingGif: false
                    })

                    if(this.state.predefinedName) {
                        this.refs.userSearchField.value = this.state.predefinedName;
                        this.filterUsers();
                    }

                    break;

                case 401: 
                    window.location.href = window.location.origin + '/error/unauthorized';
                    break;

                case 500: 
                    window.location.href = window.location.origin + '/error/server_error';
                    break;

                case -1: 
                    window.location.href = window.location.origin + '/error/server_error';
                    break;

                default:
                    window.location.href = window.location.origin + '/error/not_found';
                    break;
            }
        });
    }

    render() {
        return(
            <div id="users">
                <div className="loadingGif" style={{ display: (this.state.displayLoadingGif) ? 'block' : 'none'}}>
                    <img src={loadingGif} alt="Loading ..."/>
                </div>
                <Navbar currentMenu='users'/>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12 my-auto">
                            <div className="row">
                                <div className="col-md-12 form-group">
                                    <input type="text" className="form-control" ref="userSearchField" aria-describedby="userSearchField" placeholder="Type a name or surname to get somebody ..." onChange={ this.filterUsersDelayed.bind(this) }/>
                                </div>
                            </div>
                            <table className="table table-responsive table-hover">
                                <thead>
                                    <tr>
                                        <th scope="col">Firstname</th>
                                        <th scope="col">Lastname</th>
                                        <th scope="col">Email address</th>
                                        <th scope="col">Blockchain address</th>
                                        <th scope="col">Assignments</th>
                                        { this.state.canUserModifyRoles ? <th scope="col">Actions</th> : <th/> }
                                    </tr>
                                </thead>
                                <tbody>
                                {this.state.filteredUsers.map((u, index) =>
                                    <tr key={index}>
                                        <td>{ u.firstName }</td>
                                        <td>{ u.lastName }</td>
                                        <td>{ u.emailAddress }</td>
                                        <td>{ u.userChainMappings[0].chainIdentifier }</td>
                                        <td>{ this.getRoleLabels(u.rolesAssignments, u.userID) }</td>
                                        { this.state.canUserModifyRoles ? <td><ChooseRoleDropdown userId={ u.userID } parent={ this } rolesAlreadyOwned={ u.rolesAssignments }/></td> : <td/> }
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )
    };
}

export default Users;