import React, { Component } from 'react';
import UserSelectorFromRole from '../../components/UserSelectorFromRole/UserSelectorFromRole';
import { postContract } from '../../../js/workbenchApi';
import './NewShipmentModalForm.css';
import '../../../App.css';

/**
 * NewShipmentModalForm : this is the content inside the modal to create a new shipment
 *
 * @version 1.0.0
 * @author [Nicolas Six](https://github.com/nicoSix)
 */
class NewShipmentModalForm extends Component {
    constructor(props){
        super(props);
        this.parent = props.parent;
    };

    /**
     * NewShipmentModalForm: executed after clicking on Submit, send the form data to a function which will execute a transaction to create the shipment
     */
    createShipment() {
        var contract = {
            device: this.refs.device.refs.selectInput.value,
            owner: this.refs.owner.refs.selectInput.value,
            observer: this.refs.observer.refs.selectInput.value,
            minTemperature: this.refs.minTemperature.value,
            maxTemperature: this.refs.maxTemperature.value,
            minHumidity: this.refs.minHumidity.value,
            maxHumidity: this.refs.maxHumidity.value,
        }

        this.parent.setState({ displayLoadingGif: true });

        postContract(contract).then(contractReq => {
            this.parent.setState({ displayLoadingGif: false });
            this.parent.closeModal();

            if(contractReq.response.status === 200) {
                this.parent.setContractsInState(false);
            }            
        });
    }

    render() {
        return (
            <div id="newShipmentModalForm">
                <h2>Create a new shipment</h2><br/>
                <div className="form-group">
                    <label htmlFor="shipmentOwner">Device</label>
                    <UserSelectorFromRole ref="device" roleId='3'/>
                    <label htmlFor="shipmentOwner">Owner</label>
                    <UserSelectorFromRole ref="owner" roleId='4'/>
                    <label htmlFor="shipmentOwner">Observer</label>
                    <UserSelectorFromRole ref="observer" roleId='5'/>
                    <label htmlFor="minTemperature">Minimal temperature allowed</label>
                    <input type="number" defaultValue="0" className="form-control" ref="minTemperature"/>
                    <label htmlFor="maxTemperature">Maximal temperature allowed</label>
                    <input type="number" defaultValue="0" className="form-control" ref="maxTemperature"/>
                    <label htmlFor="minHumidity">Minimal humidity allowed</label>
                    <input type="number" defaultValue="0" className="form-control" ref="minHumidity"/>
                    <label htmlFor="maxHumidity">Maximal humidity allowed</label>
                    <input type="number" defaultValue="0" className="form-control" ref="maxHumidity"/>
                    <br/>
                    <div align="center">
                        <button className="btn btn-smoothblue" onClick={ this.createShipment.bind(this) }>Submit</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default NewShipmentModalForm;