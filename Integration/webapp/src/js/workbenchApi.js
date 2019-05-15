
import { adalApiFetch } from './adalConfig';
import fetch from 'isomorphic-fetch';

const API_URI = '<your API URL here>/api/v1';

/**
 * apiRequest : function which executes a request and parse the answer
 * 
 * @param {string} URL request URL
 * @param {*} options variable containing request optional parameters
 */
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

/**
 * parseBodyContract: return a request body from contract informations
 * 
 * @param {JSON} contract informations about the contract
 */
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

/**
 * responseChecker: parse an error request response if request failed
 * 
 * @param {JSON} resp the request response
 * @param {string} errorText an optional response text 
 */
function responseChecker(resp, errorText) {
    if(resp.response.status === 200) return resp;
    else return {
        error: errorText,
        response: resp.response
    }
}

/**
 * responseError: return an error object which will act as  an error request response if an exception occurs in a request function
 * 
 * @param {Exception} e the exception
 * @param {string} functionName the function which failed
 */
function responseError(e, functionName) {
    return {
        error: 'Exception in ' + functionName + ' request.',
        response: {
            status: -1,
            exception: e
        }
    }
}

/**
 * getContractParty: return information about a party from the contract
 * 
 * @param {string} party the party which we are looking for
 * @param {Array} contractParties the contract parties
 */
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

/**
 * getContracts: return the list of all the shipments, enhanced with parties informations
 */
export const getContracts = async () => {
    try {
        return await apiRequest(API_URI + "/applications?name=RefrigeratedTransportation").then(appReq => {
            if(appReq.response.status === 200) {
                return apiRequest(API_URI + "/applications/" + appReq.content.applications[0].id + "/workflows").then(wfReq => {
                    if(wfReq.response.status === 200) {
                        return apiRequest(API_URI + "/contracts?top=99999&workflowId=" + wfReq.content.workflows[0].id).then(async contractsReq => {
                            if(contractsReq["status"] !== 204) {
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
                            }
                            else {
                                return {
                                    content: [],
                                    response: contractsReq
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

/**
 * getUserDetails: retrieve user details from his Ethereum address
 * 
 * @param {string} userChainIdentifier hexadecimal Ethereum address which represents a user
 */
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

/**
 * getLoggedUser: get informations about the user which executes this function (by extension, the logged user in the app)
 */
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

/**
 * getContractActions: get possible actions which can be executed for a specified contract
 * 
 * @param {int} contractId ID of the specified contract
 */
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

/**
 * addAssignmentToUser: add a defined assignment to a user, by providing the wanted role ID
 * 
 * @param {int} userId 
 * @param {int} roleId
 */
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

/**
 * deleteAssignmentToUser: delete an assignment with its ID and additional informations
 * 
 * @param {JSON} assignment the object containing assignment informations
 */
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

/**
 * getUsers: retrieve all users of the application, but also their role assignments
 */
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

/**
 * getUsersFromAssignment: get all the users which have a specified role in the application
 * 
 * @param {int} roleId 
 */
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

/**
 * getContract: get contract informations from its contract ID
 * 
 * @param {int} contractId 
 */
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

/**
 * getContractUser: retrieve a user from a defined contract, from his role
 * 
 * @param {int} contractId 
 * @param {int} roleId 
 */
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

/**
 * postContract: post a new contract on the blockchain
 * 
 * @param {JSON} contract an object which contains contract informations, to build the request body
 */
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

/**
 * postContractAction: send a transaction to the blockchain (an action in the context of the workbench) 
 * 
 * @param {int} contractId
 * @param {int} actionId
 * @param {JSON} params contains action parameters depending of the action type
 */
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

/**
 * getUserRight: get workbench current user right
 */
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