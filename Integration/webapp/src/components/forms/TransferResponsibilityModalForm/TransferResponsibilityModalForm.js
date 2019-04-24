import React, { Component } from 'react';
import UserSelectorFromRole from '../../components/UserSelectorFromRole/UserSelectorFromRole';
import { postContractAction } from '../../../js/workbenchApi';
import './TransferResponsibilityModalForm.css';
import '../../../App.css';

class TransferResponsibilityModalForm extends Component {
    constructor(props){
        super(props);
        this.parent = props.parent;
    };

    transferResponsibility() {
        var params = [
            {
                "name": "newCounterparty",
                "value": this.refs.counterparty.refs.selectInput.value,
                "workflowFunctionParameterId": 0,
            }
        ]

        this.parent.setState({ displayLoadingGif: true });

        postContractAction(this.parent.contractId, this.parent.state.actionId, params).then(contractReq => {
            this.parent.closeModal();
            this.parent.setState({ displayLoadingGif: false });
        });
    }

    render() {
        return (
            <div id="newShipmentModalForm">
                <h2>Transfer Responsibility</h2><br/>
                <div className="form-group">
                    <label htmlFor="shipmentOwner">Party</label>
                    <UserSelectorFromRole ref="counterparty" roleId='2'/>
                    <br/>
                    <div align="center">
                        <button className="btn btn-smoothblue" onClick={ this.transferResponsibility.bind(this) }>Submit</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default TransferResponsibilityModalForm;