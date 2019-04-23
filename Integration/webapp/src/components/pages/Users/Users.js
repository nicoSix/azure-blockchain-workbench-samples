import React, { Component } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import loadingGif from '../../../img/loading.gif';
import { getUsers } from '../../../js/workbenchApi';
import { getRoleFromRoleId } from '../../../js/util';
import * as qs from 'query-string';
import './Users.css';

class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            filteredUsers: [],
            displayLoadingGif: true,
            predefinedName: (qs.parse(props.location.search).name !== undefined ? qs.parse(props.location.search).name : false)
        };
        document.body.style.background = 'white';
    }

    componentDidMount() {
        this.setUsersInState();
    }

    getUsersGridHeader() {
        return(
            <div className="row">
                <div className="col-md-10 form-group">
                    <input type="text" className="form-control" ref="userSearchField" aria-describedby="userSearchField" placeholder="Type a name or surname to get somebody ..." onChange={ this.filterUsersDelayed.bind(this) }/>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-smoothblue btn-block">+ Add user</button>
                </div>
            </div>
        );
    }

    getRoleLabels(assignments) {
        var stringAssignments = [];
        var i = 0;
        assignments.forEach(assignment => {
            stringAssignments.push(<span key={i} className="badge badge-smoothblue">{ getRoleFromRoleId(assignment) }<i onClick={console.log('Delete assignment')} style={{cursor: 'pointer'}}> x</i></span>);
            i++;
        });

        return stringAssignments;
    }

    filterUsers() {
        var keepValue;
        var tempUsers = [];

        this.setState({ filteredContracts: [], displayLoadingGif: true});

        this.state.users.forEach(user => {
            keepValue = true;
            if(this.refs.userSearchField.value !== '' && !this.isSearchedUserInContract(user.firstName.toLowerCase(), user.lastName.toLowerCase())) keepValue = false;
            if (keepValue) tempUsers.push(user);
        });

        if(this.state.reverse) this.setState({filteredContracts: tempUsers.reverse(), displayLoadingGif: false});
        else this.setState({filteredUsers: tempUsers, displayLoadingGif: false});
    }

    filterUsersDelayed() {
        clearTimeout(this.inputTimeout);
        this.inputTimeout = setTimeout(this.filterUsers.bind(this), 500);
    }

    isSearchedUserInContract(firstName, lastName) {
        if((firstName + lastName).includes(this.refs.userSearchField.value.replace(/\s/g, '').toLowerCase())) return true;
        if((lastName + firstName).includes(this.refs.userSearchField.value.replace(/\s/g, '').toLowerCase())) return true;
        return false;
    }

    setUsersInState() {
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
                            { this.getUsersGridHeader() }
                            <table className="table table-responsive table-hover">
                                <thead>
                                    <tr>
                                        <th scope="col">Firstname</th>
                                        <th scope="col">Lastname</th>
                                        <th scope="col">Email address</th>
                                        <th scope="col">Blockchain address</th>
                                        <th scope="col">Assignments</th>
                                        <th scope="col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {this.state.filteredUsers.map((u, index) =>
                                    <tr key={index}>
                                        <td>{ u.firstName }</td>
                                        <td>{ u.lastName }</td>
                                        <td>{ u.emailAddress }</td>
                                        <td>{ u.userChainMappings[0].chainIdentifier }</td>
                                        <td>{ this.getRoleLabels(u.rolesAssignments) }</td>
                                        <td>
                                            <button className="btn btn-smoothblue btn-action">Change roles</button>
                                            <button className="btn btn-danger">Delete user</button>
                                        </td>
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