import React, { Component } from 'react';
import { getContractActions, postContractAction } from '../../../js/workbenchApi';
import './ChooseActionDropdown.css';

class ChooseActionDropdown extends Component {
    constructor(props) {
        super(props);
        this.contractId = this.props.contractid;
        this.parent = this.props.parent;
        this.state = {
            actions: []
        }
    }

    sendPostContractAction(contractId, actionId) {
        this.parent.setState({ displayLoadingGif: true });

        postContractAction(contractId, actionId, []).then(contractReq => {
            this.parent.setState({ displayLoadingGif: false });
        });
    }

    componentDidMount() {
        this.getAndDisplayContractActions();
    }

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
                        : <span key={ index } onClick={this.sendPostContractAction.bind(this, this.contractId, a.id)} className="dropdown-item">{ a.displayName }</span>
                    )}
                </div>
            </div>
        );
    }
}

export default ChooseActionDropdown;