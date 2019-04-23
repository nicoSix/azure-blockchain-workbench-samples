import React, { Component } from 'react';
import UserSelectorFromRole from '../../components/UserSelectorFromRole/UserSelectorFromRole';
import { postContract } from '../../../js/workbenchApi';
import './NewShipmentModalForm.css';
import '../../../App.css';

class NewShipmentModalForm extends Component {
    constructor(props){
        super(props);
        this.parent = props.parent;
    };

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
                    <UserSelectorFromRole ref="device" role='3'/>
                    <label htmlFor="shipmentOwner">Owner</label>
                    <UserSelectorFromRole ref="owner" role='4'/>
                    <label htmlFor="shipmentOwner">Observer</label>
                    <UserSelectorFromRole ref="observer" role='5'/>
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