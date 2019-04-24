
import { adalApiFetch } from './adalConfig';
import fetch from 'isomorphic-fetch';

const API_URI = 'https://bcworkbench-nwiyh3-api.azurewebsites.net/api/v1';

function apiRequest(URL, options) {
    return adalApiFetch(fetch, URL, options)
        .then(response => {
            if(response.status === 200)  {
                return response.json().then(jsonResponse => {
                    return {
                        content: jsonResponse,
                        response: response
                    }
                });
            }
            if(response.status === 204)  {
                return response;
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

function parseBodyContract(contract) {
    return JSON.stringify({
        "workflowFunctionID": 0,
        "workflowActionParameters": [
          {
            "name": "device",
            "value": contract.device,
            "workflowFunctionParameterId": 0
          },
          {
            "name": "supplyChainOwner",
            "value": contract.owner,
            "workflowFunctionParameterId": 1
          },
          {
            "name": "supplyChainObserver",
            "value": contract.observer,
            "workflowFunctionParameterId": 2
          },
          {
            "name": "minHumidity",
            "value": contract.minHumidity,
            "workflowFunctionParameterId": 3
          },
          {
            "name": "maxHumidity",
            "value": contract.maxHumidity,
            "workflowFunctionParameterId": 4
          },
          {
            "name": "minTemperature",
            "value": contract.minTemperature,
            "workflowFunctionParameterId": 5
          },
          {
            "name": "maxTemperature",
            "value": contract.maxTemperature,
            "workflowFunctionParameterId": 6
          },
        ]
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

            case 'lastCounterparty':
                return getUserDetails(contractParties[4].value);

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
        return await apiRequest(API_URI + "/applications?name=RefrigeratedTransportation").then(appReq => {
            if(appReq.response.status === 200) {
                return apiRequest(API_URI + "/applications/" + appReq.content.applications[0].id + "/workflows").then(wfReq => {
                    if(wfReq.response.status === 200) {
                        return apiRequest(API_URI + "/contracts?top=99999&workflowId=" + wfReq.content.workflows[0].id).then(async contractsReq => {
                            if(contractsReq.response.status === 200) {
                                var contracts = contractsReq.content.contracts;
                                
                                for(var i = 0; i < contracts.length; i++) {
                                    if(contracts[i].contractProperties.length !== 0) {
                                        contracts[i]["owner"] = await getContractParty('owner', contracts[i].contractProperties);
                                        contracts[i]["deploymentInProgress"] = false;
                                    }
                                    else {
                                        contracts[i]["deploymentInProgress"] = true;
                                    }
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
        return await apiRequest(API_URI + "/users?userChainIdentifier=" + userChainIdentifier).then(userReq => {
            return responseChecker(userReq, 'Unable to get user details.');
        });
    }
    catch(e) {
        return responseError(e, 'getUserDetails');
    }
}

export const getLoggedUser = async () => {
    try {
        return await apiRequest(API_URI + "/users/me").then(userReq => {
            return responseChecker(userReq, 'Unable to get current user.');
        });
    }
    catch(e) {
        return responseError(e, 'getLoggedUser');
    }
}

export const getContractActions = async contractId => {
    try {
        return await apiRequest(API_URI + "/contracts/" + contractId + "/actions").then(contractReq => {
            return responseChecker(contractReq, 'Unable to get contract actions.');
        });
    }
    catch(e) {
        return responseError(e, 'getContractActions');
    }
}

export const addAssignmentToUser = async (userId, roleId) => {
    try {
        return await apiRequest(API_URI + "/applications?name=RefrigeratedTransportation").then(async appReq => {
            if(appReq.response.status === 200) {
                return await apiRequest(API_URI + "/applications/" + appReq.content.applications[0].id + "/roleAssignments", {
                    method: "post",
                    headers: {'Content-type': 'application/json'},
                    body: JSON.stringify({
                        "userId": userId,
                        "applicationRoleId": roleId
                    })
                }).then(userReq => {
                    return responseChecker(userReq, 'Unable to add assignment.');
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
        return responseError(e, 'addAssignmentToUser');
    }   
}

export const deleteAssignmentToUser = async (assignment) => {
    try {
        return await apiRequest(API_URI + "/applications?name=RefrigeratedTransportation").then(async appReq => {
            if(appReq.response.status === 200) {
                return await apiRequest(API_URI + "/applications/" + appReq.content.applications[0].id + "/roleAssignments/" + assignment.id, {
                    method: "delete"
                })
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
        return responseError(e, 'deleteAssignmentToUser');
    }   
}

export const getUsers = async () => {
    try {
        return await apiRequest(API_URI + "/applications?name=RefrigeratedTransportation").then(appReq => {
            if(appReq.response.status === 200) {
                return apiRequest(API_URI + "/applications/" + appReq.content.applications[0].id + "/roleAssignments").then(async permissionsReq => {
                    var usersReq = await apiRequest(API_URI + "/users");
                    var users = usersReq.content.users;

                    users.forEach(u => {
                        if(u["rolesAssignments"] === undefined) u["rolesAssignments"] = [];
                    })

                    permissionsReq.content.roleAssignments.forEach(p => {
                        users[p.user.userID - 1].rolesAssignments.push(p);
                    });

                    usersReq.content.users = users;
                    return usersReq;
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
        return responseError(e, 'getUsers');
    }
};

export const getUsersFromAssignment = async roleId => {
    try {
        var appRes = await apiRequest(API_URI + "/applications?name=RefrigeratedTransportation").then(appReq => {
            if(appReq.response.status === 200) {
                return appReq.content.applications[0].id;
            }
            else {
                return {
                    error: 'Unable to get application ID.',
                    response: appReq.response
                }
            }
        });


        if(appRes.error === undefined) 
            return apiRequest(API_URI + "/applications/" + appRes + "/roleAssignments?applicationRoleId=" + roleId).then(async permissionsReq => {
                return responseChecker(permissionsReq, 'Unable to get users from role id.');
            });
        else return appRes;
    }
    catch(e) {
        return responseError(e, 'getContracts');
    }
}

export const getContract = async contractId => {
    try {
        return await apiRequest(API_URI + "/contracts/" + contractId).then(async contractReq => {
            if(contractReq.response.status === 200) {
                contractReq.content["owner"] = await getContractParty('owner', contractReq.content.contractProperties);
                contractReq.content["initiatingCounterparty"] = await getContractParty('initiatingCounterparty', contractReq.content.contractProperties);
                contractReq.content["currentCounterparty"] = await getContractParty('currentCounterparty', contractReq.content.contractProperties);
                contractReq.content["lastCounterparty"] = await getContractParty('lastCounterparty', contractReq.content.contractProperties);
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

export const getContractUser = async (contractId, roleId) => {
    try {
        return await apiRequest(API_URI + "/contracts/" + contractId).then(async contractReq => {
            if(contractReq.response.status === 200) {
                switch(roleId) {
                    case '1': 
                        return {
                            response: contractReq.response,
                            content: {
                                user: await getContractParty('initiatingCounterparty', contractReq.content.contractProperties)
                            }
                        }

                    case '2': 
                        return {
                            response: contractReq.response,
                            content: {
                                user: await getContractParty('counterparty', contractReq.content.contractProperties)
                            }
                        }

                    case '3': 
                        return {
                            response: contractReq.response,
                            content: {
                                user: await getContractParty('device', contractReq.content.contractProperties)
                            }
                        }

                    case '4': 
                        return {
                            response: contractReq.response,
                            content: {
                                user: await getContractParty('owner', contractReq.content.contractProperties)
                            }
                        }
                    
                    case '5': 
                        return {
                            response: contractReq.response,
                            content: {
                                user: await getContractParty('observer', contractReq.content.contractProperties)
                            }
                        }

                    default:
                        return {
                            response: {
                                status: 404,
                                statusText: 'Role ID missing or uncorrect.'
                            }
                        }
                }
            }
            else return {
                error: 'Unable to get contract from ID.',
                response: contractReq.response
            }
        });
    }
    catch(e) {
        return responseError(e, 'getContractUser');
    }
} 


export const postContract = async contract => {
    try {
        return await apiRequest(API_URI + "/contracts?workflowId=1&contractCodeId=1&connectionId=1", {
            method: "post",
            headers: {'Content-type': 'application/json'},
            body: parseBodyContract(contract)
        }).then(contractReq => {
            return responseChecker(contractReq, 'Unable to post new contract.');
        });
    }
    catch(e) {
        return responseError(e, 'postContract');
    }
}

export const postContractAction = async (contractId, actionId, params) => {
    try {
        return await apiRequest(API_URI + "/contracts/" + contractId + "/actions", {
            method: "post",
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({"workflowActionParameters": params, "workflowFunctionId": actionId})
        }).then(contractReq => {
            return responseChecker(contractReq, 'Unable to post new contract action.');
        });
    }
    catch(e) {
        return responseError(e, 'postContractAction');
    }
}

export const getUserRights = async () => {
    try {
        return await apiRequest(API_URI + "/capabilities").then(userReq => {
            return responseChecker(userReq, 'Unable to get user rights.');
        });
    }
    catch(e) {
        return responseError(e, 'getUserRights');
    }
}