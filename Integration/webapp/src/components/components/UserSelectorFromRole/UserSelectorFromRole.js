import React, { Component } from 'react';
import { getUsersFromAssignment, getContractUser } from '../../../js/workbenchApi';

/**
 * UserSelectorFromRole: a React component which displays a select input, filled with users (useful for form creation)
 *
 * @version 1.0.0
 * @author [Nicolas Six](https://github.com/nicoSix)
 */
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

    render() {
        return (
            <select ref='selectInput' className="form-control">
                {this.state.roleAssignments.map((u, index) =>
                    <option key={ index } value={ u.user.userChainMappings[0].chainIdentifier }>
                        { u.user.firstName + ' ' + u.user.lastName + ' (' + u.user.emailAddress + ')' }
                    </option>
                )}
            </select>
        );
    }
}

export default UserSelectorFromRole;