import React, { Component } from 'react';
import { getUsersFromAssignment, getContractUser } from '../../../js/workbenchApi';

class UserSelectorFromRole extends Component {
    constructor(props) {
        super(props);
        this.roleId = props.roleId;
        this.innerRole = (props.innerRole ? props.innerRole : false);
        this.contractId = (props.contractId ? props.contractId : -1);
        this.state = {
            roleAssignments: [],
        }
    }

    componentDidMount() {
        if(this.innerRole) {
            getContractUser(this.contractId, this.roleId).then(roleReq => {
                console.log(roleReq)
                if(roleReq.response.status === 200) { 
                    this.setState({
                        roleAssignments: [roleReq.content]
                    })
                }
            }) 
        }
        else {
            getUsersFromAssignment(this.roleId).then(roleReq => {
                if(roleReq.response.status === 200) { 
                    this.setState({
                        roleAssignments: roleReq.content.roleAssignments
                    })
                }
            });
        }   
    }

    genOptions() {
        var buffer = [];
        var i = 0;

        this.state.roleAssignments.forEach(user => {
            buffer.push(<option key={ i } value={ user.user.userChainMappings[0].chainIdentifier }>{ user.user.firstName + ' ' + user.user.lastName + ' (' + user.user.emailAddress + ')' }</option>);
            i++;
        }); 

        return buffer;
    }

    render() {
        return (
            <select ref='selectInput' className="form-control">
                { this.genOptions() }
            </select>
        );
    }
}

export default UserSelectorFromRole;