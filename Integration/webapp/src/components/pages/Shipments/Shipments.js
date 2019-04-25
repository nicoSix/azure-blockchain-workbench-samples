import React, { Component } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { getContracts, getUsersFromAssignment, getLoggedUser } from '../../../js/workbenchApi';
import loadingGif from '../../../img/loading.gif';
import BoatIcon from 'react-icons/lib/io/android-boat';
import RefreshIcon from 'react-icons/lib/md/refresh';
import Modal from 'react-modal';
import NewShipmentModalForm from '../../forms/NewShipmentModalForm/NewShipmentModalForm';
import './Shipments.css';

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

Modal.setAppElement(document.getElementById('root'));

/**
 * Shipments : represents the shipments page on the Refrigerated Transportation Application
 *
 * @version 1.0.0
 * @author [Nicolas Six](https://github.com/nicoSix)
 */
class Shipments extends Component {
    constructor(props) {
        super(props);
        this.inputTimeout = null;
        this.state = {
            contracts: [],
            filteredContracts: [],
            displayLoadingGif: true,
            modalIsOpen: false,
            isOwner: false
        };

        this.reversed = false;
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        document.body.style.background = 'white';

        this.refreshShipments(true);
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }

    componentDidMount() {
        this.isCurrentUserOwner();
        this.setContractsInState(false);
    }

    /**
     * refreshShipments: refresh shipments on the page every 60 seconds
     * 
     * @param {int} firstTime avoid execution when the timer starts
     */
    refreshShipments(firstTime) {
        if(!firstTime) this.setContractsInState(true);
        setTimeout(this.refreshShipments.bind(this, false), 60000)
    }

    /**
     * setContractsInState: retrieve contracts from an API request and set them in state
     * 
     * @param {bool} silentRefresh indicates if we're displaying a loading gif (first load from nothing to shipment list) or not (refresh)
     */
    setContractsInState(silentRefresh) {
        if(!silentRefresh) this.setState({ displayLoadingGif: true });

        getContracts().then(contractsRequest => {
            switch(contractsRequest.response.status) {
                case 200: 
                    this.setState({
                        contracts: contractsRequest.content,
                    })
                    this.filterShipments();
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

            if(!silentRefresh) this.setState({ displayLoadingGif: false });
        });
    }

    /**
     * getContractState: generates a label containing the litteral state of a shipment, for render()
     * 
     * @param {char} state the state ID representing a litteral state
     */
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

            case '-1':
                return this.createStateLabel('black', 'In deployment');

            default: 
                return this.createStateLabel('black', 'Unknown');
        }
    }

    /**
     * createStateLabel: generates the JSX of the label
     * 
     * @param {string} color CSS color of the generated label (litteral or hex)
     * @param {string} content litteral state
     */
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

    /**
     * getReadableTimestamp: convert a timestamp to litteral date
     * 
     * @param {int} ts timestamp
     */
    getReadableTimestamp(ts) {
        return new Date(ts).toDateString();
    }

    /**
     * filterShipments: takes the shipment list and put them into another ordered shipment list 
     * (if the shipment meet asked criterias) which will be displayed 
     */
    filterShipments() {
        var keepValue;
        var tempContracts = [];

        this.setState({ displayLoadingGif: true });

        this.state.contracts.forEach(contract => {
            keepValue = true;
            if(contract.contractProperties.length !== 0) {
                switch (contract.contractProperties[0].value) {
                    case '0':
                        if(!this.refs.createdCheckbox.checked) keepValue = false;
                        break;
    
                    case '1':
                        if(!this.refs.transitCheckbox.checked) keepValue = false;
                        break;
    
                    case '2':
                        if(!this.refs.successCheckbox.checked) keepValue = false;
                        break;
    
                    case '3':
                        if(!this.refs.oocCheckbox.checked) keepValue = false;
                        break;
    
                    default:
                        keepValue = false;
                        break;
                }
            }
            else {
                if(!this.refs.inDeploymentCheckbox.checked) keepValue = false;
            }
            

            if(this.refs.ownerSearchField.value !== '' && !this.isSearchedOwnerInContract(contract.owner.firstName.toLowerCase(), contract.owner.lastName.toLowerCase())) keepValue = false;
            if (keepValue) tempContracts.push(contract);
        });

        this.reversed = false;
        this.setState({filteredContracts: tempContracts, displayLoadingGif: false}, () => {
            this.orderShipments();
        });
    }

    /**
     * filterShipmentsDelayed: call the filterShipment function after a certain amount of time
     * without typing something else into the search bar 
     */
    filterShipmentsDelayed() {
        clearTimeout(this.inputTimeout);
        this.inputTimeout = setTimeout(this.filterShipments.bind(this), 500);
    }

    /**
     * isSearchedOwnerInContract: search if the owner firstname and lastname corresponds with the text entered inside the search bar
     * 
     * @param {string} firstName 
     * @param {string} lastName 
     */
    isSearchedOwnerInContract(firstName, lastName) {
        if((firstName + lastName).includes(this.refs.ownerSearchField.value.replace(/\s/g, '').toLowerCase())) return true;
        if((lastName + firstName).includes(this.refs.ownerSearchField.value.replace(/\s/g, '').toLowerCase())) return true;
        return false;
    }

    /**
     * orderShipments: order the shipments in asc or desc order, depending of the reversed state variable
     */
    orderShipments() {
        if(this.refs.ascRadio.checked) {
            if(this.reversed) {
                this.setState({filteredContracts: this.state.filteredContracts.reverse()});
                this.reversed = false;
            }
        }
        else {
            if(!this.reversed) {
                this.setState({filteredContracts: this.state.filteredContracts.reverse()});
                this.reversed = true;
            }
        }
    }

    /**
     * getShipmentsGridHeader: display the components block above the shipment list, depending of the isOwner state
     */
    getShipmentsGridHeader() {
        if(this.state.isOwner) {
            return(
                <div className="row">
                    <div className="col-md-1">
                        <button className="btn btn-smoothblue btn-block" onClick={this.setContractsInState.bind(this, false)}><RefreshIcon/></button>
                    </div>
                    <div className="col-md-9 form-group">
                        <input type="text" className="form-control" ref="ownerSearchField" aria-describedby="ownerSearchField" placeholder="Type an owner name or surname to get owner shipments ..." onChange={ this.filterShipmentsDelayed.bind(this) }/>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-smoothblue btn-block" onClick={this.openModal}>+ New shipment</button>
                    </div>
                </div>
            );
        }
        else {
            return(
                <div className="row">
                    <div className="col-md-1">
                        <button className="btn btn-smoothblue btn-block" onClick={this.setContractsInState.bind(this, false)}><RefreshIcon/></button>
                    </div>
                    <div className="col-md-11 form-group">
                        <input type="text" className="form-control" ref="ownerSearchField" aria-describedby="ownerSearchField" placeholder="Type an owner name or surname to get owner shipments ..." onChange={ this.filterShipmentsDelayed.bind(this) }/>
                    </div>
                </div>
            );
        }
    }

    /**
     * Check if the current logged user got the owner role in the solution
     */
    isCurrentUserOwner() {
        return getUsersFromAssignment(4).then(usersReq => {
            if(usersReq.response.status === 200) {
                return getLoggedUser().then(userReq => {
                    if(userReq.response.status === 200) {
                        var externalId = userReq.content.currentUser.externalID;
                        usersReq.content.roleAssignments.forEach(assignment => {
                            if(assignment.user.externalID === externalId) {
                                this.setState({ isOwner: true })
                            }
                        })
                    }
                })
            }
        })
    }

    render() {
        return(
            <div id="shipments">
                <div className="loadingGif" style={{ display: (this.state.displayLoadingGif) ? 'block' : 'none'}}>
                    <img src={loadingGif} alt="Loading ..."/>
                </div>
                <Navbar currentMenu='shipments'/>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-2">
                            <div className="card">
                                <div className="card-body">
                                    <h3 className="card-title filtersCardTitle">Filters</h3><br/>
                                    <h5 className="card-title">Shipments state</h5>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" ref="inDeploymentCheckbox" onChange={ this.filterShipments.bind(this) } defaultChecked={ true }/>
                                        <label className="form-check-label" htmlFor="inDeploymentCheckbox">In deployment</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" ref="createdCheckbox" onChange={ this.filterShipments.bind(this)} defaultChecked={ true }/>
                                        <label className="form-check-label" htmlFor="createdCheckbox">Created</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" ref="transitCheckbox" onChange={ this.filterShipments.bind(this) } defaultChecked={ true }/>
                                        <label className="form-check-label" htmlFor="transitCheckbox">In transit</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" ref="successCheckbox" onChange={ this.filterShipments.bind(this) } defaultChecked={ true }/>
                                        <label className="form-check-label" htmlFor="successCheckbox">Success</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" ref="oocCheckbox" onChange={ this.filterShipments.bind(this) } defaultChecked={ true }/>
                                        <label className="form-check-label" htmlFor="oocCheckbox">Out-of-compliance</label>
                                    </div><br/>
                                    <h5 className="card-title">Order by</h5>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="orderByOptions" ref="ascRadio" onChange={ this.orderShipments.bind(this) }/>
                                        <label className="form-check-label" htmlFor="successCheckbox">Date asc.</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="orderByOptions" ref="descRadio" onChange={ this.orderShipments.bind(this) } defaultChecked={ true }/>
                                        <label className="form-check-label" htmlFor="successCheckbox">Date desc.</label>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                        <div className="col-md-10">
                            { this.getShipmentsGridHeader() }
                            <div className="row">
                                { this.state.filteredContracts.map(c => 
                                    <div className="col-md-3" key={ c.id }>
                                        <div className="card">
                                            <div className="card-body">
                                                <h5 className="card-title"><BoatIcon/> Shipment n°{ c.id }</h5>
                                                <h6 className="card-subtitle mb-2 text-muted">{ (c.contractProperties.length !== 0 ? this.getContractState(c.contractProperties[0].value) : this.getContractState('-1')) }</h6><hr/>
                                                <p className="card-text">Owned by : { (c.contractProperties.length !== 0 ? <a className="bold" href={ '/users?name=' + c.owner.firstName + ' ' + c.owner.lastName }>{ c.owner.firstName + ' ' + c.owner.lastName }</a> : 'Unavailable')}</p>
                                                <p className="card-text">Created : { this.getReadableTimestamp(c.timestamp) } </p>
                                                <a href={ "/shipments/" + c.id } className="card-link">See contract details</a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={customStyles}
                    contentLabel="Add shipment"
                    >

                    <NewShipmentModalForm parent={ this }/>
                </Modal>
            </div>
        )
    };
}

export default Shipments;