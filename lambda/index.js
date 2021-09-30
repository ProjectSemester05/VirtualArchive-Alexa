const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const axios = require('axios');
const ddb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
const dynamoDBTableName = "CatalogueDB";
const demo_data = require('./documents/demoData.json');
const jwt = require("jwt-decode")
//const main = require('./main.json');
const {getRemoteData} = require('./api/api-get-data.js');
// const {deleteRequest} = require('./api/api-delete-data.js');

const postRequest = async (userID, catalog) => {
    try {
        const res = await axios.post(`https://v86cz5q48g.execute-api.us-east-1.amazonaws.com/dev/catalogue/new/${userID}`,
            {
                CatalogueName: catalog
            }
            );
        let data = res.data;
        // console.log("in : ",data);
        return res
    }catch (err) {
        console.log(err);
    }
}

const postRequestItem = async (userID,catalogUUID,item,description) => {
    try {
        const res = await axios.post(`https://v86cz5q48g.execute-api.us-east-1.amazonaws.com/dev/item/new`,
            {
                ItemName: item,
                CatalogueUUID: catalogUUID,
                Description: description,
                UserID: userID
            }
            );
        let data = res.data;
        // console.log("in : ",data);
        return res
    }catch (err) {
        console.log(err);
    }
}


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        const { accessToken } = handlerInput.requestEnvelope.session.user;
        let decoded = jwt(accessToken)
        let userID = decoded.sub
        
        let count = 0
        var today = new Date();
        var month = today.getMonth()+1
        if(month < 10){
            month = '0'+month
        }
        
        var date = today.getDate()+'-'+month+'-'+today.getFullYear();
        // userID = '14082a4d-35d1-4450-97c3-393730cffa29'
        await getRemoteData(`https://v86cz5q48g.execute-api.us-east-1.amazonaws.com/dev/reminder-by-user/${userID}`)
            .then((response) => {
                const data = JSON.parse(response);

                let Reminders = data.Reminders;
                // console.log(Reminders)
                Reminders.forEach(remind => {
                    // console.log(remind.ReminderDate)
                    // console.log(date)
                    if(remind.ReminderDate === date){
                        count = count +1
                    }
                   
                });

            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
            })
            
        let speakOutput = 'Welcome to Virtual Archive. You can organize your items efficiently.';
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

const CatalogueAddItemHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CatalogAddItemIntent';
    },
    async handle(handlerInput) {
        const { accessToken } = handlerInput.requestEnvelope.session.user;
        let decoded = jwt(accessToken)
        let userID = decoded.sub
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const item = Alexa.getSlotValue(requestEnvelope, 'item');
        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalog');
        const description = Alexa.getSlotValue(requestEnvelope, 'description');
        
        let catalogUUID ='';
        let speechText = "";
        
        await getRemoteData(`https://v86cz5q48g.execute-api.us-east-1.amazonaws.com/dev/catalogue-by-name/${catalog}`)
            .then((response) => {
                const data = JSON.parse(response);
    
                catalogUUID = data.Catalogues[0].UUID;
                // speechText = catalogUUID;
            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
            })
        
        await postRequestItem(userID,catalogUUID,item,description);
        
        
        
        if (description !== null && description !== undefined){
            speechText = speechText+ "You Successfully added "+item+" to the "+catalog+" catalogue, saying "+description
        } else {
            speechText = speechText+ "You Successfully added "+item+" to the "+catalog+" catalogue"
        }
            
        
        
        
        
        // const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const CreateCatalogueHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CreateCatalogueIntent';
    },
    async handle(handlerInput) {
        
        const { accessToken } = handlerInput.requestEnvelope.session.user;
        let decoded = jwt(accessToken)
        let userID = decoded.sub
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalog');
        
        let speechText = ""
        
        await postRequest(userID,catalog);
        // return HelpIntentHandler.handle(handlerInput);
        speechText = "You successfully created "+ catalog +" catalogue."

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

        await getRemoteData(`https://v86cz5q48g.execute-api.us-east-1.amazonaws.com/dev/catalogue-by-name/${catalog}`)
            .then((response) => {
                const data = JSON.parse(response);

                catalogUUID = data.Catalogues[0].UUID;
            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
            })

        await getRemoteData(`https://v86cz5q48g.execute-api.us-east-1.amazonaws.com/dev/item-by-catalogue-uuid/${catalogUUID}`)
            .then((response) => {
                const data = JSON.parse(response);

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
const UpdateItemHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'UpdateItemIntent';
    },
    handle(handlerInput) {
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const item = Alexa.getSlotValue(requestEnvelope, 'item');
        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalog');
        const description = Alexa.getSlotValue(requestEnvelope, 'description');
        
        let speechText = "";
        
        speechText = "Description of the " +item+ " in the "+catalog+" catalog is updated to "+description ;
        
        
        // const speakOutput = 'You can say hello to me! How can I help?';

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
    handle(handlerInput) {
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalog');
        const item = Alexa.getSlotValue(requestEnvelope, 'item');
        
        let speechText = ""
        
 
        speechText = item + " is deleted from the " + catalog;
        
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
    handle(handlerInput) {
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const item = Alexa.getSlotValue(requestEnvelope, 'item');
        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalogue');
        const reminder = Alexa.getSlotValue(requestEnvelope, 'date');
        
        let speechText = ""
        
        speechText = "You Successfully added a reminder to "+item+" in the "+catalog+" catalog. It is "+reminder ;
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
    handle(handlerInput) {
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const item = Alexa.getSlotValue(requestEnvelope, 'item');
        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalog');
        const reminder = Alexa.getSlotValue(requestEnvelope, 'reminder');
        
        let speechText = "";
        
        speechText = "Reminder of the " +item+ " in the "+catalog+" catalog is updated into "+reminder ;
        
        
        // const speakOutput = 'You can say hello to me! How can I help?';

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
    handle(handlerInput) {
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const item = Alexa.getSlotValue(requestEnvelope, 'item');

        let speechText = "";
        
        speechText = "Catalogue of the "+item+" is kitchen items";
        
        
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const DeleteCatalogueIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DeleteCatalogueIntent';
    },
    handle(handlerInput) {
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalog');
        
        let speechText = "";
        
        speechText = catalog+" catalogue is deleted";
        
        
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const ViewCataloguesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ViewCataloguesIntent';
    },
    async handle(handlerInput) {
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        let speechText = "Catalogues: ";
        
        const { accessToken } = handlerInput.requestEnvelope.session.user;
        let decoded = jwt(accessToken)
        let userID = decoded.sub
        
        await getRemoteData(`https://v86cz5q48g.execute-api.us-east-1.amazonaws.com/dev/catalogue-by-user-id/${userID}`)
            .then((response) => {
                const data = JSON.parse(response);

                let catalogs = data.Items;
                
                catalogs.forEach(catalog=> {
                    speechText = speechText+catalog.CatalogueName+", "
                });

            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
        })
        // speechText = "Catalogues: kitchen items,default catalogue,book collections";
        
        
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

        let speechText = "You have set reminders for the following items: ";
        
        const { accessToken } = handlerInput.requestEnvelope.session.user;
        let decoded = jwt(accessToken)
        let userID = decoded.sub
        
        const itemUUID_array = []
        await getRemoteData(`https://v86cz5q48g.execute-api.us-east-1.amazonaws.com/dev/reminder-by-user/${userID}`)
            .then((response) => {
                const data = JSON.parse(response);

                let reminders = data.Reminders;
                
                reminders.forEach(remind=> {
                    let itemuuid = remind.ItemUUID;
                    itemUUID_array.push(itemuuid)
                });

            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
            })
        
        for(const uuid of itemUUID_array){
            await getRemoteData(`https://v86cz5q48g.execute-api.us-east-1.amazonaws.com/dev/item/${uuid}`)
            .then((response) => {
                const data = JSON.parse(response);

                let name = data.item.ItemName;
                
                speechText = speechText + ',' +name;

                


            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
            })
        }
        // speechText = "Catalogues: kitchen items,default catalogue,book collections";
        
        
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
    
            await getRemoteData(`https://v86cz5q48g.execute-api.us-east-1.amazonaws.com/dev/item-description/${catalog}/${item}`)
            .then((response) => {
                    const data = JSON.parse(response);
    
                    descript = data.description;
    
            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
            })
    
            if(descript === ''){
                speechText = 'Invalid item name'
            }
            speechText = `Description of ${item} is ${descript}`

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
            let item_uuid = '';
            
            await getRemoteData(`https://wuaatihexl.execute-api.us-east-1.amazonaws.com/dev/catalogue-by-name/${catalog}`)
                .then((response) => {
                    const data = JSON.parse(response);
    
                    catalogUUID = data.Catalogues[0].UUID;
    
                })
                .catch((err) => {
                    console.log(`ERROR: ${err.message}`);
                })
    
            await getRemoteData(`https://wuaatihexl.execute-api.us-east-1.amazonaws.com/dev/item-by-catalogue-uuid/${catalogUUID}`)
            .then((response) => {
                const data = JSON.parse(response);

                let allItems = data.Items
                

                allItems.forEach(dbitem => {
                    if(dbitem.ItemName.localeCompare(item) === 0){
                        speechText = `Reminder of ${item} is ${dbitem.Reminder}`;
                        item_uuid = dbitem.UUID
                    }
                });


                
                if(speechText === ''){
                    speechText = 'Invalid item name'
                }

            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
            })
            if(item_uuid !== ''){
                await getRemoteData(`https://wuaatihexl.execute-api.us-east-1.amazonaws.com/dev/reminder/${catalogUUID}`)
                    .then((response) => {
                        const data = JSON.parse(response);
        
                        let reminder_data = data.reminder.Reminder;
                        speechText = `Reminder of ${item} is ${reminder_data}`;
                    })
                .catch((err) => {
                    console.log(`ERROR: ${err.message}`);
                })
                
            }

            if(speechText === ''){
                speechText = 'Invalid item name'
            }

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
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

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
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();