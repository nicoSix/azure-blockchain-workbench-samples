import React, { Component } from 'react';
import { getContractActions, postContractAction } from '../../../js/workbenchApi';
import './ChooseActionDropdown.css';

/**
 * ChooseActionDropdown: a React component which displays possible actions inside a shipment detail page
 *
 * @version 1.0.0
 * @author [Nicolas Six](https://github.com/nicoSix)
 */
class ChooseActionDropdown extends Component {
    constructor(props) {
        super(props);
        this.contractId = this.props.contractid;
        this.parent = this.props.parent;
        this.state = {
            actions: []
        }
    }

    componentDidMount() {
        this.getAndDisplayContractActions();
    }

    /**
     * sendCompleteAction: send the final action which indicates that the shipments reaches the end of the SC and so the contract is done 
     * 
     * @param {int} contractId 
     */
    sendCompleteAction(contractId) {
        this.parent.setState({ displayLoadingGif: true });

        postContractAction(contractId, 4, []).then(contractReq => {
            this.parent.setState({ displayLoadingGif: false });
        });
    }

    /**
     * getAndDisplayContractActions: retrieve possible contract actions and put then into state to update the Dropdown component
     */
    getAndDisplayContractActions() {
        getContractActions(this.contractId).then(contractReq => {
            if(contractReq.content !== undefined)
                this.setState({
                    actions: contractReq.content.workflowFunctions
                })
            else   
                this.refs.dropdownBtn.textContent = 'No action available';
        });
    }

    render() {
        return (
            <div id="chooseActionDropdown" className="col-md-2 offset-md-8 dropdown" align="right">
                <button ref="dropdownBtn" className="btn btn-smoothblue btn-block dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    + Take action
                </button>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    {this.state.actions.map((a, index) =>
                        (a.id !== 4) 
                        ? <span key={ index } onClick={this.parent.openModal.bind(this, a.id)} className="dropdown-item">{ a.displayName }</span>
                        : <span key={ index } onClick={this.sendCompleteAction.bind(this, this.contractId)} className="dropdown-item">{ a.displayName }</span>
                    )}
                </div>
            </div>
        );
    }
}

export default ChooseActionDropdown;