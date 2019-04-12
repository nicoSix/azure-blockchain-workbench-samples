
import { adalApiFetch, adalDBApiFetch } from './adalConfig';
//import { adalApiFetch } from './adalConfig';
import fetch from 'isomorphic-fetch';

const API_URI = 'https://bcworkbench-nwiyh3-api.azurewebsites.net/api/v1';
const DB_API_URL = 'https://workbench-api.azurewebsites.net/api';

function apiRequest(apiType, URL) {
    if(apiType === 'DBAPI') {
        var sendRequest = adalDBApiFetch;
    }
    else {
        var sendRequest = adalApiFetch;
    }

    return sendRequest(fetch, URL)
        .then(response => {
            if(response.status === 200)  {
                return response.json().then(jsonResponse => {
                    return {
                        content: jsonResponse,
                        response: response
                    }
                });
            }
            else if(response.status === 401) return {
                error: 'Unauthorized',
                response: response
            }
            else return {
                error: 'Content unavailable',
                response: response
            }
        })
        .then(parsedResponse => {
            return parsedResponse;
        });    
}

function responseChecker(resp, errorText) {
    if(resp.response.status === 200) return resp;
    else return {
        error: errorText,
        response: resp.response
    }
}

function responseError(e, functionName) {
    return {
        error: 'Exception in ' + functionName + ' request.',
        response: {
            status: -1,
            exception: e
        }
    }
}

async function getContractParty(party, contractParties) {
    return await ((party, contractParties) => {
        switch(party) {
            case 'owner':
                return getUserDetails(contractParties[1].value);

            case 'initiatingCounterparty':
                return getUserDetails(contractParties[2].value);
            
            case 'currentCounterparty':
                return getUserDetails(contractParties[3].value);

            case 'device':
                return getUserDetails(contractParties[5].value);

            case 'observer':
                return getUserDetails(contractParties[7].value);

            default: 
                return {
                    response: {
                        status: -1
                    }
                }
        }

    })(party, contractParties).then(userReq => {
        if(userReq.response.status === 200) return userReq.content.users[0];
        else {
            return {
                firstName: 'Unknown',
                lastName: 'Unknown'
            };
        }   
    })
}

export const getContracts = async () => {
    try {
        return await apiRequest('API', API_URI + "/applications?name=RefrigeratedTransportation").then(appReq => {
            if(appReq.response.status === 200) {
                return apiRequest('API', API_URI + "/applications/" + appReq.content.applications[0].id + "/workflows").then(wfReq => {
                    if(wfReq.response.status === 200) {
                        return apiRequest('API', API_URI + "/contracts?workflowId=" + wfReq.content.workflows[0].id).then(async contractsReq => {
                            if(contractsReq.response.status === 200) {
                                var contracts = contractsReq.content.contracts;
                                for(var i = 0; i < contracts.length; i++) {
                                    contracts[i]["owner"] = await getContractParty('owner', contracts[i].contractProperties);
                                }
                                return {
                                    content: contracts,
                                    response: contractsReq.response
                                };
                            }
                            else {
                                return {
                                    error: 'Unable to get contracts.',
                                    response: contractsReq.response
                                }
                            }
                        });
                    }
                    else {
                        return {
                            error: 'Unable to get application workflow ID.',
                            response: wfReq.response
                        }
                    }
                });
            }
            else {
                return {
                    error: 'Unable to get application ID.',
                    response: appReq.response
                }
            }
        });
    }
    catch(e) {
        return responseError(e, 'getContracts');
    }
};

export const getUserDetails = async userChainIdentifier => {
    try {
        return await apiRequest('API', API_URI + "/users?userChainIdentifier=" + userChainIdentifier).then(userReq => {
            return responseChecker(userReq, 'Unable to get user details.');
        });
    }
    catch(e) {
        return responseError(e, 'getUserDetails');
    }
}

export const getDeviceFromAddress = async userChainIdentifier => {
    try {
        return await apiRequest('DBAPI', DB_API_URL + "/deviceFromAddress?deviceAddress=" + userChainIdentifier).then(userReq => {
            return responseChecker(userReq, 'Unable to get device details.');
        });
    }
    catch(e) {
        return responseError(e, 'getUserDetails');
    }
}

export const getLoggedUser = async () => {
    try {
        return await apiRequest('API', API_URI + "/users/me").then(userReq => {
            return responseChecker(userReq, 'Unable to get current user.');
        });
    }
    catch(e) {
        return responseError(e, 'getLoggedUser');
    }
}

export const getContract = async contractId => {
    try {
        return await apiRequest('API', API_URI + "/contracts/" + contractId).then(async contractReq => {
            if(contractReq.response.status === 200) {
                contractReq.content["owner"] = await getContractParty('owner', contractReq.content.contractProperties);
                contractReq.content["initiatingCounterparty"] = await getContractParty('initiatingCounterparty', contractReq.content.contractProperties);
                contractReq.content["currentCounterparty"] = await getContractParty('currentCounterparty', contractReq.content.contractProperties);
                contractReq.content["device"] = await getContractParty('device', contractReq.content.contractProperties);
                contractReq.content["observer"] = await getContractParty('observer', contractReq.content.contractProperties);
                return contractReq;
            }
            else return {
                error: 'Unable to get contract from ID.',
                response: contractReq.response
            }
        });
    }
    catch(e) {
        return responseError(e, 'getContract');
    }
} 

