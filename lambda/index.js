const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const axios = require('axios');
const ddb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
const dynamoDBTableName = "CatalogueDB";
const demo_data = require('./documents/demoData.json');
const jwt = require("jwt-decode")
//const main = require('./main.json');
// const {getRequest} = require('./api/api-get-data.js');
// const {deleteRequest} = require('./api/api-delete-data.js');
const base_url = 'https://n8l7szvh3j.execute-api.us-east-1.amazonaws.com/dev'
// let userID = 'ad397421-c7df-4244-874e-816f1e650c68';
const { accessToken } = handlerInput.requestEnvelope.session.user;
let decoded = jwt(accessToken)
let userID = decoded.sub




//get request
const getRequest = async (url, userID) => {
    try {
        let response =  await axios.get(url, {headers: { userid: userID}}) 
        // console.log("success");
        let data = response.data;
        // console.log(data);
        return {data, success: true};
  
    } catch (error) {
        // console.log("error");
        return {error, success: false};
    }
};
//post request to store catalogue name
const postRequest = async (userID, catalog) => {
    try {
        const res = await axios.post(`${base_url}/catalogue/new`,
            {
                CatalogueName: catalog
            },
            {
                headers: {userid: userID}
            }
            );
        let res_data = res.data;
        // console.log(res_data);
        return {res_data, success: true};
    }catch (err) {
        // console.log(err);
        return {err, success: false};
    }
}

const postRequestReminder = async (userID,date, description,time, itemUUID) => {
    try {
        const res = await axios.post(`${base_url}/reminder/new`,
            {
                ReminderDate: date,
                ReminderTime: time,
                Description: description,
                ItemUUID: itemUUID
            },
            {
                headers: {userid: userID}
            }
            );
        let res_data = res.data;
        // console.log(res_data);
        return {res_data, success: true};
    }catch (err) {
        // console.log(err);
        return {err, success: false};
    }
}

const updateRequest = async (userID, item, description,catalogUUID,uuid) => {
    try {
        const res = await axios.put(`${base_url}/item/edit`,
            {
                ItemName: item,
                CatalogueUUID: catalogUUID,
                Description: description,
                UUID: uuid
            },
            {
                headers: {userid: userID}
            }
            );
        let res_data = res.data;
        // console.log(res_data);
        return {res_data, success: true};
    }catch (err) {
        // console.log(err);
        return {err, success: false};
    }
}

const updateRequestReminder = async (userID, reminder, description,itemUUID,time,uuid) => {
    try {
        const res = await axios.put(`${base_url}/reminder/edit`,
            {   
                UUID: uuid,
                ReminderDate: reminder,
                ReminderTime: time,
                Description: description,
                ItemUUID: itemUUID
            },
            {
                headers: {userid: userID}
            }
            );
        let res_data = res.data;
        // console.log(res_data);
        return {res_data, success: true};
    }catch (err) {
        console.log(err);
        return {err, success: false};
    }
}
//post request to store item in a catalogue
const postRequestItem = async (userID,catalogUUID,item,description) => {
    try {
        const res = await axios.post(`${base_url}/item/new`,
            {
                ItemName: item,
                CatalogueUUID: catalogUUID,
                Description: description,
                UserID: userID
            },
            {
                headers: {userid: userID}
            }
            );
        let data = res.data;
        // console.log("in : ",data);
        return {data, success: true};
    }catch (err) {
        // console.log(err);
        return {err, success: false};
    }
}
const deleteRequest = async (url) => {
    try {
        // console.log(url)
        let res = await axios.delete(url,
        {
            headers: {userid: userID}
        });
        let data = res.data;
        // console.log(data);
        return {data,success: true};
  
    } catch (error) {
      return {error,success: false};
    }
}

const todayDate = () => {
    var today = new Date();
    var month = today.getMonth()+1
    if(month < 10){
        month = '0'+month
    }
    let today_date = today.getDate()
    if(today_date < 10){
        today_date = '0'+today_date
    }
    
    var date = today_date+'-'+month+'-'+today.getFullYear();
    return date
}
//executes when launch intent triggers
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        // const { accessToken } = handlerInput.requestEnvelope.session.user;
        // let decoded = jwt(accessToken)
        // let userID = decoded.sub
        
        let count = 0
        let date = todayDate();
        // date = '01-10-2021'
        let userID = 'ad397421-c7df-4244-874e-816f1e650c68';
        // console.log(`${base_url}/reminder-by-user`)
        await getRequest(`${base_url}/reminder-by-user`,userID)
            .then((response) => {               
                const data = JSON.parse(JSON.stringify(response.data));
                let Reminders = data.Reminders;
                // console.log(Reminders);
                
                Reminders.forEach(remind => {
                    // console.log(remind.Date)
                    // console.log(date)
                    if(remind.ReminderDate === date){
                        count = count +1
                    }
                   
                });

            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
            })
            
        let speakOutput = 'Welcome to Virtual Archive. You can organize your items efficiently!';
        if(count > 1 ){
            speakOutput = speakOutput + ' You have '+count+' reminders today';
        }
        else if(count === 1){
            speakOutput = speakOutput + ' You have '+count+' reminder today';
        }
        
        
        var demo_blue = require('./documents/demo_blue.json');

    // Check to make sure the device supports APL
    if (
      Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)[
        'Alexa.Presentation.APL'
      ]
    ) {
      // add a directive to render our simple template
      handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        document: demo_blue,
      });
    }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
    //         .addDirective({
    //     type: 'Alexa.Presentation.APL.RenderDocument',
    //     version: '1.0',
    //     document: main,
    //     datasources: {}
    //   })
            .reprompt(speakOutput)
            .getResponse();
    }
};

// user touch event - open catalogue command
const demoTypeIntentHandler = {
  canHandle(handlerInput) {
    //Runs if the demoTypeIntent was invoked verbally OR if the button in the demo_blue.json document was pressed
    return (
      (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          'demoTypeIntent') ||
      (Alexa.getRequestType(handlerInput.requestEnvelope) ===
        'Alexa.Presentation.APL.UserEvent' &&
        handlerInput.requestEnvelope.request.source.id === 'catalogueButton')
    );
  },
  handle(handlerInput) {
    var next_demo = 'cheese';
    var speakOutput = '';

    // load our APL and APLA documents
    var demo_doc = require(`./documents/${next_demo}DemoMain.json`);
    var intro_doc = require(`./documents/APLA_docIntro.json`);
    const doc_data = demo_data[0];

    // set the cheese we're on (numerically)
    // we'll compute this value when we get navigation commands, but
    // when you "say cheese," it's all "gouda"
    var atts = handlerInput.attributesManager.getSessionAttributes();
    atts.cheeseno = 0;

    if (
      Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)[
        'Alexa.Presentation.APL'
      ]
    ) {
      // add a directive to render our simple template
      handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'demoDoc', // we need a token so we can target future commands to this document
        document: demo_doc,
        datasources: {
          demo: {
            type: 'object',
            properties: doc_data,
          },
        },
      });
    }
    
      handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APLA.RenderDocument',
        document: intro_doc,
        datasources: {
          demo: {
            type: 'object',
            properties: doc_data,
          },
        },
      });

    if (!atts.beenHere) {
        speakOutput =
          '';
          atts.beenHere = true;
      } else {
          speakOutput = ""
      }
    
    handlerInput.attributesManager.setSessionAttributes(atts);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

//user touch event -  toggle between catalogues
const nextBackIntentHandler = {
  canHandle(handlerInput) {
    //Runs if the demoTypeIntent was invoked verbally OR if the button in the demo_blue.json document was pressed
    return (
      (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          'nextBackIntent') ||
      (Alexa.getRequestType(handlerInput.requestEnvelope) ===
        'Alexa.Presentation.APL.UserEvent' &&
        handlerInput.requestEnvelope.request.arguments[0] === 'cheesenext') ||
      (Alexa.getRequestType(handlerInput.requestEnvelope) ===
        'Alexa.Presentation.APL.UserEvent' &&
        handlerInput.requestEnvelope.request.arguments[0] === 'cheeseback')
    );
  },
  handle(handlerInput) {
    const intro_doc = require("./documents/APLA_docIntro.json");

    // figure out the proper cheese to use and assign to doc_data
    //get direction
    var mover = 1; //if it's not backwards, it's forwards
    if((handlerInput.requestEnvelope.request.hasOwnProperty('intent') && handlerInput.requestEnvelope.request.intent.slots.direction.value === "back")
      ||(handlerInput.requestEnvelope.request.hasOwnProperty('arguments') && handlerInput.requestEnvelope.request.arguments[0] === 'cheeseback'))
    {
        mover = -1;
    }

    var atts = handlerInput.attributesManager.getSessionAttributes();
    if (atts.hasOwnProperty('cheeseno')) {
      atts.cheeseno += mover;
      if (atts.cheeseno === demo_data.length) atts.cheeseno = 0;
      if (atts.cheeseno === -1) atts.cheeseno = (demo_data.length - 1);
    } else {
      atts.cheeseno = 1;
    }

    var doc_data = demo_data[atts.cheeseno];
    handlerInput.attributesManager.setSessionAttributes(atts);

    //add command execute update
    if (
      Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)[
        'Alexa.Presentation.APL'
      ]
    ) {
      handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.ExecuteCommands',
        token: 'demoDoc',
        commands: [
          {
            type: 'SetValue',
            componentId: 'mainScreen',
            property: 'bodyText',
            value: doc_data.bodyText,
          },
          {
            type: 'SetValue',
            componentId: 'mainScreen',
            property: 'imageSource',
            value: doc_data.imageSource,
          },
          {
            type: 'SetValue',
            componentId: 'mainScreen',
            property: 'primaryText',
            value: doc_data.imageCaption,
          },
        ],
      });
    }    
    handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APLA.RenderDocument',
        document: intro_doc,
        datasources: {
          demo: {
            type: 'object',
            properties: doc_data,
          },
        },
      });
    
    const speakOutput = "";
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('speakOutput')
      .getResponse();
  },
};

//add item to a catalogue
const CatalogueAddItemHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CatalogAddItemIntent';
    },
    async handle(handlerInput) {
        // const { accessToken } = handlerInput.requestEnvelope.session.user;
        // let decoded = jwt(accessToken)
        // let userID = decoded.sub
        let userID = 'ad397421-c7df-4244-874e-816f1e650c68';
        let description = '';
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const item = Alexa.getSlotValue(requestEnvelope, 'item');
        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalog');
        description = Alexa.getSlotValue(requestEnvelope, 'description');
        
        let catalogUUID ='';
        let speechText = "";
        
        await getRequest(`${base_url}/catalogue-by-name/${catalog}`,userID)
            .then((response) => {
                const data = JSON.parse(JSON.stringify(response.data));
                
                catalogUUID = data.Catalogues[0].UUID;
                // console.log(catalogUUID);
                
                // speechText = catalogUUID;
            })
            .catch((err) => {
                speechText = 'Catalogue does not exist';
                console.log(`ERROR: ${err.message}`);
            })
        
        await postRequestItem(userID,catalogUUID,item,description)
        
            .then((response) => {
                // console.log(response)
                if(response.success == true){
                    if (description !== null && description !== undefined){
                        speechText = speechText+ "You Successfully added "+item+" to the "+catalog+" catalogue, saying "+description
                    } else {
                        speechText = speechText+ "You Successfully added "+item+" to the "+catalog+" catalogue"
                    }
                } 
                else{
                    speechText = 'Catalogue does not exist';
                }
                
            })
            .catch((err) => {
                // console.log(`ERROR: ${err.message}`);
                speechText = 'You have failed to add the item.';
            })
                
        // const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// create a catalogue intent
const CreateCatalogueHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CreateCatalogueIntent';
    },
    async handle(handlerInput) {
        
        // const { accessToken } = handlerInput.requestEnvelope.session.user;
        // let decoded = jwt(accessToken)
        // let userID = decoded.sub
        let userID = 'ad397421-c7df-4244-874e-816f1e650c68';
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalog');
        
        let speechText = ""
        
        await postRequest(userID,catalog)
        .then((response) => {
            // console.log(response.success);
            if(response.success == true){
                speechText = "You successfully created "+ catalog +" catalogue."
            }
            else{
                speechText = "Catalogue name already exists. Try again with a diffrent name."
            }
        })
        .catch((err) => {
            // console.log('err');
            speechText = "Error occurred while creating the catalogue. Try again with a diffrent name."
        });
        // return HelpIntentHandler.handle(handlerInput);
        
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const OpenCatalogueHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OpenCatalogueIntent';
    },
    async handle(handlerInput) {

        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalog');

        let speechText = "";

        let catalogUUID = ""

        await getRequest(`${base_url}/catalogue-by-name/${catalog}`,userID)
            .then((response) => {
                const data = JSON.parse(JSON.stringify(response.data));
                // console.log(data);
                catalogUUID = data.Catalogues[0].UUID;
            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
            })

            await getRequest(`${base_url}/item-by-catalogue-uuid/${catalogUUID}`,userID)
            .then((response) => {
                const data = JSON.parse(JSON.stringify(response.data));
                // console.log(data);
                let allItems = data.Items

                if (allItems.length === 0) {
                    speechText = "There are no items in "+catalog
                } else {

                    speechText = "Items in "+catalog+" are "

                    allItems.forEach(item => {
                        speechText = speechText+item.ItemName+", "
                    });

                    speechText = speechText.slice(0, -2);
                }


            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
            })
            if (speechText === ""){
                speechText = "There are no items in "+catalog
            }

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

//update the description of an item
const UpdateItemHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'UpdateItemIntent';
    },
    async handle(handlerInput) {
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const item = Alexa.getSlotValue(requestEnvelope, 'item');
        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalog');
        const description = Alexa.getSlotValue(requestEnvelope, 'description');
        
        let speechText = "";
        let catalogUUID = '8df3136c-bb2a-491d-9fa3-2f09bae6d977';
        let uuid = '106d445f-0fcb-4179-ad3b-dda17b0c2814';

        await getRequest(`${base_url}/item-by-name/${catalogUUID}`,userID)
            .then((response) => {
                const data = JSON.parse(JSON.stringify(response));
                // console.log(data);

            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
            })
        await updateRequest(userID,item,description,catalogUUID,uuid)
        .then((response) => {
            // console.log(response.success);
            if(response.success === true){
                speechText = "Description of the " +item+ " in the "+catalog+" catalog is updated to "+description ;
            }
            else{
                speechText = "Failed to update the description"
            }
        })
        .catch((err) => {
            // console.log('err');
            speechText = "Update failed. Catalogue name does not exists."
        });

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const DeleteItemHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DeleteItemIntent';
    },
    async handle(handlerInput) {
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalog');
        const item = Alexa.getSlotValue(requestEnvelope, 'item');
        
        let speechText = "";
        let itemUUID = "";
        let catalogueUUID = "";

        await getRequest(`${base_url}/item-uuid/${catalog}/${item}`,userID)
        .then((response) => {
            const data = JSON.parse(JSON.stringify(response.data));

            itemUUID = data.itemUuid;

        })
        .catch((err) => {
            speechText = "Item deletion failed";
            // console.log(`ERROR: ${err.message}`);
        })

        if(itemUUID == ""){
            await getRequest(`${base_url}/catalogue-by-name/${catalog}`,userID)
            .then((response) => {
                const data = JSON.parse(JSON.stringify(response.data));
                // console.log(data);
                catalogueUUID = data.Catalogues[0].UUID;
                speechText = item+" item does not exist";
            })
            .catch((err) => {
                speechText = catalog+" catalogue does not exist";
                // console.log(`ERROR: ${err.message}`);
            })
           
        }
        else{
            await deleteRequest(`${base_url}/item/${itemUUID}`,userID)
                .then((response) => {
                    // console.log(response);
                    if(response.success == true){
                        speechText = item + " is deleted from the " + catalog;
                    }
                    else{
                        speechText = "Item deletion failed";
                    }

                })
                .catch((err) => {
                    speechText = "Item deletion failed";
                    // console.log(`ERROR: ${err.message}`);
                })
        }
        
        
        // const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const AddReminderIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddReminderIntent';
    },
    async handle(handlerInput) {
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const item = Alexa.getSlotValue(requestEnvelope, 'item');
        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalogue');
        const description = Alexa.getSlotValue(requestEnvelope, 'description');
        const date = Alexa.getSlotValue(requestEnvelope, 'date');
        const time = Alexa.getSlotValue(requestEnvelope, 'time');
        let itemUUID = '';
        let speechText = ""

        await getRequest(`${base_url}/item-uuid/${catalog}/${item}`,userID)
        .then((response) => {
            const data = JSON.parse(JSON.stringify(response.data));

            itemUUID = data.itemUuid;

        })
        .catch((err) => {
            console.log(`ERROR: ${err.message}`);
        })
        // console.log(itemUUID);
        await postRequestReminder(userID, date, description,time, itemUUID)
        .then((response) => {
            const data = JSON.parse(JSON.stringify(response));
            // console.log(data);
            if(data.success === true){
                speechText = "You successfully added a reminder to "+item+" in the "+catalog+" catalog. It is "+description+". And it is due on "+date+" at "+time+".";
            }
            else{
                speechText = "You have failed to add the reminder";
            }


        })
        .catch((err) => {
            console.log(`ERROR: ${err.message}`);
        })
        
        // const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const UpdateReminderHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'UpdateReminderIntent';
    },
    async handle(handlerInput) {
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const item = Alexa.getSlotValue(requestEnvelope, 'item');
        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalog');
        const description = Alexa.getSlotValue(requestEnvelope, 'description');
        const date = Alexa.getSlotValue(requestEnvelope, 'date');
        const time = Alexa.getSlotValue(requestEnvelope, 'time');
        
        let speechText = "";
        let itemUUID = "";
        let reminder_uuid= '';
        await getRequest(`${base_url}/item-uuid/${catalog}/${item}`,userID)
        .then((response) => {
            const data = JSON.parse(JSON.stringify(response.data));

            itemUUID = data.itemUuid;

        })
        .catch((err) => {
            console.log(`ERROR: ${err.message}`);
        });

        await getRequest(`${base_url}/reminder-by-item/${itemUUID}`,userID)
            .then((response) => {
                const data = JSON.parse(JSON.stringify(response.data));
                // console.log(data);
                reminder_uuid =  data.Reminders[0].UUID;
                
            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
            })
        // console.log(reminder)
        await updateRequestReminder(userID,date,description,itemUUID,time,reminder_uuid)
        .then((response) => {
            // console.log(response.success);
            if(response.success === true){
                speechText = `Reminder of the ${item} in ${catalog} is updated into ${description} which is due on ${date} at ${time}.` ;
            }
            else{
                speechText = "Failed to update the reminder"
            }
        })
        .catch((err) => {
            // console.log('err');
            speechText = "Error occurred while updating the reminder.";
        });
        

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const ViewCatalogueOfItemIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ViewCatalogueOfItemIntent';
    },
    async handle(handlerInput) {
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const item = Alexa.getSlotValue(requestEnvelope, 'item');

        let speechText = "";
        let catalogueUUID = []
        let counter = 0
        let catalogText = ''
        await getRequest(`${base_url}/item-by-name/${item}`,userID)
        .then((response) => {
            const data = JSON.parse(JSON.stringify(response.data));
            // console.log(data);
            data.Items.forEach(item=> {
                catalogueUUID.push(item.CatalogueUUID);
            });
            // catalogueUUID = data.Catalogues[0].CatalogueUUID;
            
        })
        .catch((err) => {
            console.log(`ERROR: ${err.message}`);
        })

        for(uuid of catalogueUUID) {
            await getRequest(`${base_url}/catalogue/${uuid}`,userID)
            .then((response) => {
                const data = JSON.parse(JSON.stringify(response.data));
                // console.log(data);
                catalogueName = data.catalogue.CatalogueName;
                catalogText += catalogueName + ", "
                // speechText = "Catalogue of the "+item+" is "+catalogueName;
                counter += 1
                
            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
            })
        }
        if(counter == 1){
            speechText = "Catalogue of the "+item+" is "+catalogText;
        }
        else if(counter > 1){
            speechText = "There are "+counter+" catalogues for "+item;
            speechText += ". They are "+catalogText;
        }
        else{
            speechText = "Couldn't find the catalogue for the "+item;
        }

        // console.log(speechText);        
        
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};


//deleting a catalogue using catalogue name
const DeleteCatalogueIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DeleteCatalogueIntent';
    },
    async handle(handlerInput) {
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalog');

        let speechText = "";
        let catalogueUUID = '';

        //get the uuid of the catalogue from catalogue name
        await getRequest(`${base_url}/catalogue-by-name/${catalog}`,userID)
            .then((response) => {
                const data = JSON.parse(JSON.stringify(response.data));
                // console.log(data);
                catalogueUUID = data.Catalogues[0].UUID;
                
            })
            .catch((err) => {
                speechText = 'Invalid item name'
                console.log(`ERROR: ${err.message}`);
            })
        // console.log(catalogueUUID);

        //delete the catalogue using catalogue uuid
        await deleteRequest(`${base_url}/catalogue/${catalogueUUID}`,userID)
            .then((response) => {
                // console.log(response);
                if(response.success == true){
                    // const data2 = JSON.parse(response);
                    // speechText = data2;
                    speechText = catalog+" catalogue is deleted";
                }
                else{
                    speechText = "Catalogue deletion failed";
                }

            })
            .catch((err) => {
                speechText = catalog+" catalogue does not exist";
                console.log(`ERROR: ${err.message}`);
            })
          
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

//view all the catalogues of the user
const ViewCataloguesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ViewCataloguesIntent';
    },
    async handle(handlerInput) {
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        let speechText = "Catalogues; ";
        
        // const { accessToken } = handlerInput.requestEnvelope.session.user;
        // let decoded = jwt(accessToken)
        // let userID = decoded.sub

        await getRequest(`${base_url}/catalogue-by-user/`,userID)
            .then((response) => {
                if(response.success == true){
                    const data = JSON.parse(JSON.stringify(response.data));
                    // console.log(data);
    
                    let catalogs = data.Catalogues;
                    // console.log(catalogs)
                    catalogs.forEach(catalog=> {
                        // console.log(catalog.CatalogueName);
                        speechText = speechText+catalog.CatalogueName+", "
                    });
                }
                else{
                    speechText = "There are no catalogue found"
                }


            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
        })
        // console.log(speechText)
        // speechText = "Catalogues; kitchen items,default catalogue,book collections";
        
        
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const ViewTodayReminderIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ViewTodayReminderIntent';
    },
    async handle(handlerInput) {
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        let speechText = "Following items have reminders today; ";
 
        // const { accessToken } = handlerInput.requestEnvelope.session.user;
        // let decoded = jwt(accessToken)
        // let userID = decoded.sub

        const itemUUID_array = []
        await getRequest(`${base_url}/reminder-by-user`,userID)
            .then((response) => {
                const data = JSON.parse(JSON.stringify(response.data));
                
                let reminders = data.Reminders;
                // console.log(reminders);
                reminders.forEach(remind=> {
                    if(remind.ReminderDate === todayDate()){
                        let itemuuid = remind.ItemUUID;
                        itemUUID_array.push(itemuuid)
                    }
                    
                });

            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
            })
        
        for(const uuid of itemUUID_array){
            await getRequest(`${base_url}/item/${uuid}`,userID)
            .then((response) => {
                const data = JSON.parse(JSON.stringify(response.data));
                // console.log(data);
                let name = data.item.ItemName;
                
                speechText = speechText + name+ ',' ;

            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
            })
        }
 
        speechText = speechText.slice(0, -1);
        // console.log(speechText);
        
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const ViewDescriptionHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ViewDescriptionIntent';
    },
    async handle(handlerInput) {
    
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const item = Alexa.getSlotValue(requestEnvelope, 'item');
        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalog');

        let speechText = ``;

        let descript =''

        await getRequest(`${base_url}/item-description/${catalog}/${item}`,userID)
            .then((response) => {
                const data = JSON.parse(JSON.stringify(response.data));
                // console.log(data)
                descript = data.description;
                speechText = `Description of ${item} is ${descript}`;

            })
            .catch((err) => {
                speechText = 'Invalid item name'
                console.log(`ERROR: ${err.message}`);
            })

        if(descript === ''){
            speechText = 'Invalid item name'
        }
            

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};


const ViewReminderHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ViewReminderIntent';
    },
    async handle(handlerInput) {
    
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const item = Alexa.getSlotValue(requestEnvelope, 'item');
        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalog');

        let speechText = ``;

        let catalogUUID = ""

        let itemUUID = '';

        await getRequest(`${base_url}/item-uuid/${catalog}/${item}`,userID)
        .then((response) => {
            const data = JSON.parse(JSON.stringify(response.data));

            itemUUID = data.itemUuid;

        })
        .catch((err) => {
            console.log(`ERROR: ${err.message}`);
        })

        await getRequest(`${base_url}/reminder-by-item/${itemUUID}`,userID)
            .then((response) => {
                const data = JSON.parse(JSON.stringify(response.data));
                // console.log(data);
                let reminder_time =  data.Reminders[0].ReminderTime;
                let reminder_data = data.Reminders[0].ReminderDate;
                let description = data.Reminders[0].Description;
                speechText = `Reminder of ${item} is due on ${reminder_data} at ${reminder_time}. And it is ${description}.`;
            })
        .catch((err) => {
            console.log(`ERROR: ${err.message}`);
        })
            

        if(speechText === ''){
            speechText = 'Invalid item name'
        }

    return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }
};
const DeleteReminderIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DeleteReminderIntent';
    },
    async handle(handlerInput) {
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const item = Alexa.getSlotValue(requestEnvelope, 'item');
        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalog');

        let speechText = "";
        let catalogueUUID = '';
        let uuid = '';
        await getRequest(`${base_url}/item-uuid/${catalog}/${item}`,userID)
        .then((response) => {
            const data = JSON.parse(JSON.stringify(response.data));

            itemUUID = data.itemUuid;

        })
        .catch((err) => {
            console.log(`ERROR: ${err.message}`);
        })

        await getRequest(`${base_url}/reminder-by-item/${itemUUID}`,userID)
            .then((response) => {
                const data = JSON.parse(JSON.stringify(response.data));
                // console.log(data);
                uuid = data.Reminders[0].UUID;
            })
        .catch((err) => {
            console.log(`ERROR: ${err.message}`);
        })
        
        await deleteRequest(`${base_url}/reminder/${uuid}`,userID)
            .then((response) => {
                // console.log(response);
                if(response.success == true){
                    speechText = `Reminder of ${item} in ${catalog} is deleted.`;
                }
                else{
                    speechText = "Reminder deletion failed";
                }

            })
            .catch((err) => {
                speechText = "Item deletion failed";
                // console.log(`ERROR: ${err.message}`);
            })  
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Execution Cancelled';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = `Sorry, I don't know about that. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};



/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        demoTypeIntentHandler,
        nextBackIntentHandler,        
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        CatalogueAddItemHandler,
        CreateCatalogueHandler,
        OpenCatalogueHandler,
        UpdateItemHandler,
        DeleteItemHandler,
        AddReminderIntentHandler,
        UpdateReminderHandler,
        ViewDescriptionHandler,
        ViewReminderHandler,
        ViewCatalogueOfItemIntentHandler,
        DeleteCatalogueIntentHandler,
        ViewCataloguesIntentHandler,
        ViewTodayReminderIntentHandler,
        DeleteReminderIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();