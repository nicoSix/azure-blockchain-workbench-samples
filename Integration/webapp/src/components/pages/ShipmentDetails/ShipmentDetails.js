import React, { Component } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import ChooseActionDropdown from '../../components/ChooseActionDropdown/ChooseActionDropdown';
import TransferResponsibilityModalForm from '../../forms/TransferResponsibilityModalForm/TransferResponsibilityModalForm';
import loadingGif from '../../../img/loading.gif';
import BoatIcon from 'react-icons/lib/io/android-boat';
import LeftArrowIcon from 'react-icons/lib/md/arrow-back';
import ConnectedIcon from 'react-icons/lib/go/radio-tower';
import Modal from 'react-modal';
import { getContract } from '../../../js/workbenchApi';
import './ShipmentDetails.css';

const customStyles = {
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)'
    }
};

class ShipmentDetails extends Component {
    constructor(props) {
        super(props);
        this.contractId = this.props.match.params.id; 
        this.state = {
            contract: {
                device: {
                    firstName: 'Unknown',
                    lastName: 'Unknown'
                },
                owner: {
                    firstName: 'Unknown',
                    lastName: 'Unknown'
                },
                currentCounterparty: {
                    firstName: 'Unknown',
                    lastName: 'Unknown'
                },
                lastCounterparty: {
                    firstName: 'Unknown',
                    lastName: 'Unknown'
                },
                initiatingCounterparty: {
                    firstName: 'Unknown',
                    lastName: 'Unknown'
                },
                observer: {
                    firstName: 'Unknown',
                    lastName: 'Unknown'
                },
                contractProperties: this.genPropertiesTab()
            },
            displayLoadingGif: true,
            contractState: '-1',
            actionId: -1
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.refresh(true);
        document.body.style.background = 'white';
    }

    refresh(firstTime) {
        if(!firstTime) this.setContractInState(true);
        setTimeout(this.refresh.bind(this, false), 5000)
    }

    async componentDidMount() {
        await this.setContractInState(false);
    }

    openModal(actionId) {
        this.setState({modalIsOpen: true, actionId: actionId});
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }

    genPropertiesTab() {
        var pTab = new Array(17);
        for(var i = 0; i < 17; i++) {
            pTab[i] = {
                workflowPropertyId: i+1,
                value: ''
            }
        }
    }

    setContractInState(silentRefresh) {
        if(!silentRefresh) this.setState({displayLoadingGif: true});

        getContract(this.contractId).then(contractRequest => {
            this.setState({
                contract: contractRequest.content,
                contractState: contractRequest.content.contractProperties[0].value,
            })
        });

        if(!silentRefresh) this.setState({displayLoadingGif: false});
    }

    goToShipments() {
        window.location.href = window.location.origin + '/shipments';
    }

    getLastTelemetryUpdate() {
        try {
            return new Date(this.state.contract.contractProperties[16].value*1000).toDateString();
        }
        catch(e) {
            return 'Unknown';
        }
    }

    getContractState(state) {
        switch (state) {
            case '0':
                return this.createStateLabel('#002850', 'Created');

            case '1': 
                return this.createStateLabel('#008aa3', 'In transit');

            case '2': 
                return this.createStateLabel('green', 'Success');

            case '3': 
                return this.createStateLabel('#c60b01', 'Out-of-Compliance');

            default: 
                return this.createStateLabel('black', 'Unknown');
        }
    }

    getLastCounterpartyIfDefined() {
        if(this.state.contract.lastCounterparty.firstName !== 'Unknown') return (
            <p className="card-text">- Last Counterparty :
                <b>{ ' ' + this.state.contract.lastCounterparty.firstName + ' ' + this.state.contract.lastCounterparty.lastName }</b>
            </p>
        )
    }

    getCounterpartyIfDefined() {
        if(this.state.contract.currentCounterparty.firstName !== 'Unknown') return (
            <p className="card-text">- Current Counterparty :
                <b>{ ' ' + this.state.contract.currentCounterparty.firstName + ' ' + this.state.contract.currentCounterparty.lastName }</b>
            </p>
        )
    }

    createStateLabel(color, content) {
        return (<span style={{
            color: 'white',
            backgroundColor: color,
            border: '1px solid ' + color,
            borderRadius: '5px',
            paddingLeft: '5px',
            paddingRight: '5px'
        }}>{ content }</span>);
    }

    getModalFromAction() {
        switch(this.state.actionId) {
            case 2:
                //ingest telemetry
                break;

            case 3:
                return (<TransferResponsibilityModalForm parent={ this }/>);
                break;

            default:
                break;
        }
        return(<h1>Modal</h1>)
    }

    render() {
        return(
            <div id="shipmentDetails">
                <div className="loadingGif" style={{ display: (this.state.displayLoadingGif) ? 'block' : 'none'}}>
                    <img src={loadingGif} alt="Loading ..."/>
                </div>
                <Navbar currentMenu='shipments'/>
                <div className="container">             
                    <div className="row">
                        <div className="col-md-2">
                            <button className="btn btn-smoothblue btn-block" onClick={ this.goToShipments }><LeftArrowIcon/> Go back</button>
                        </div>
                        <ChooseActionDropdown contractid={ this.contractId } parent={ this }/>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card">
                                <h5 className="card-header">
                                    <div style={{ float:'left'}}><BoatIcon/> Shipment n°{ this.state.contract.id } </div>
                                    <div style={{ float:'right'}}>{ this.getContractState(this.state.contractState) }</div>
                                </h5>
                                <div className="card-body">
                                    <h6 className="card-title">Owner :
                                        <b>{ ' ' + this.state.contract.owner.firstName + ' ' + this.state.contract.owner.lastName }</b>
                                    </h6><hr/>
                                    <h6>Contract members</h6>
                                    <p className="card-text">- Initiating Counterparty :
                                        <b>{ ' ' + this.state.contract.initiatingCounterparty.firstName + ' ' + this.state.contract.initiatingCounterparty.lastName }</b>
                                    </p>
                                    { this.getLastCounterpartyIfDefined() }
                                    { this.getCounterpartyIfDefined() }
                                    <p className="card-text">- Observer :
                                        <b>{ ' ' + this.state.contract.observer.firstName + ' ' + this.state.contract.observer.lastName }</b>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                        <div className="card">
                            <h5 className="card-header"><ConnectedIcon/> Device data</h5>
                                <div className="card-body">
                                    <h6 className="card-title">Device in charge :
                                        <b>{ ' ' + this.state.contract.device.firstName + ' ' + this.state.contract.device.lastName }</b>
                                    </h6>
                                    <p className="card-text">Last telemetry update : { this.getLastTelemetryUpdate() }</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={customStyles}
                    contentLabel="New action"
                    >

                    { this.getModalFromAction() }
                </Modal>
            </div>
        )
    };
}

export default ShipmentDetails;