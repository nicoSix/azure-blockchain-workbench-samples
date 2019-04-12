import React, { Component } from 'react';
import Navbar from '../Navbar/Navbar';
import { getContracts } from '../../js/workbenchApi';
import loadingGif from '../../img/loading.gif';
import BoatIcon from 'react-icons/lib/io/android-boat';
import './Shipments.css';

class Shipments extends Component {
    constructor(props) {
        super(props);
        this.inputTimeout = null;
        this.state = {
            contracts: [],
            filteredContracts: [],
            reversed: false,
            displayLoadingGif: true
        };
        document.body.style.background = 'white';
    }

    componentDidMount() {
        this.setContractsInState();
    }

    setContractsInState() {
        getContracts().then(contractsRequest => {
            switch(contractsRequest.response.status) {
                case 200: 
                    this.setState({
                        contracts: contractsRequest.content,
                        filteredContracts: contractsRequest.content,
                        displayLoadingGif: false
                    })
                    break;

                case 401: 
                    window.location.href = window.location.origin + '/error/unauthorized';
                    break;

                case 500: 
                    window.location.href = window.location.origin + '/error/server_error';
                    break;

                default:
                    window.location.href = window.location.origin + '/error/not_found';
                    break;
            }
        });
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

    getReadableTimestamp(ts) {
        return new Date(ts).toDateString();
    }

    filterShipments() {
        var keepValue;
        var tempContracts = [];

        this.setState({ filteredContracts: [], displayLoadingGif: true});

        this.state.contracts.forEach(contract => {
            keepValue = true;
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
                    break;
            }

            if(this.refs.ownerSearchField.value !== '' && !this.isSearchedOwnerInContract(contract.owner.firstName.toLowerCase(), contract.owner.lastName.toLowerCase())) keepValue = false;
            if (keepValue) tempContracts.push(contract);
        });

        if(this.state.reverse) this.setState({filteredContracts: tempContracts.reverse(), displayLoadingGif: false});
        else this.setState({filteredContracts: tempContracts, displayLoadingGif: false});
    }

    filterShipmentsDelayed() {
        clearTimeout(this.inputTimeout);
        this.inputTimeout = setTimeout(this.filterShipments.bind(this), 500);
    }

    isSearchedOwnerInContract(firstName, lastName) {
        if((firstName + lastName).includes(this.refs.ownerSearchField.value.replace(/\s/g, '').toLowerCase())) return true;
        if((lastName + firstName).includes(this.refs.ownerSearchField.value.replace(/\s/g, '').toLowerCase())) return true;
        return false;
    }

    orderShipments() {
        this.setState({filteredContracts: this.state.filteredContracts.reverse(), reverse: !this.state.reverse})
    }

    getShipmentsGridHeader() {
        return(
            <div className="row">
                <div className="col-md-10 form-group">
                    <input type="text" className="form-control" ref="ownerSearchField" aria-describedby="ownerSearchField" placeholder="Type an owner name or surname to get owner shipments ..." onChange={ this.filterShipmentsDelayed.bind(this) }/>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-smoothblue btn-block">+ New shipment</button>
                </div>
            </div>
        );
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
                                        <input className="form-check-input" type="radio" name="orderByOptions" onChange={ this.orderShipments.bind(this) } defaultChecked={ true }/>
                                        <label className="form-check-label" htmlFor="successCheckbox">Date asc.</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="orderByOptions" onChange={ this.orderShipments.bind(this) }/>
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
                                                <h6 className="card-subtitle mb-2 text-muted">{ this.getContractState(c.contractProperties[0].value) }</h6><hr/>
                                                <p className="card-text">Owned by : <a className="bold" href={ '/users/' + c.owner.userID }>{ c.owner.firstName + ' ' + c.owner.lastName }</a></p>
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
            </div>
        )
    };
}

export default Shipments;