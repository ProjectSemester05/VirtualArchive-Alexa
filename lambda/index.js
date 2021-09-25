const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
const dynamoDBTableName = "CatalogueDB";
//const main = require('./main.json');
// const getRemoteData = require('./api-data.js');

const getRemoteData = (url) => new Promise((resolve, reject) => {
  const client = url.startsWith('https') ? require('https') : require('http');
  const request = client.get(url, (response) => {
    if (response.statusCode < 200 || response.statusCode > 299) {
      reject(new Error(`Failed with status code: ${response.statusCode}`));
    }
    const body = [];
    response.on('data', (chunk) => body.push(chunk));
    response.on('end', () => resolve(body.join('')));
  });
  request.on('error', (err) => reject(err));
});


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to Virtual Archive! You can organize your items efficiently.';

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

const CatalogueAddItemHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CatalogAddItemIntent';
    },
    handle(handlerInput) {
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const item = Alexa.getSlotValue(requestEnvelope, 'item');
        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalog');
        const description = Alexa.getSlotValue(requestEnvelope, 'description');
        
        let speechText = ""
        
        if (description !== null && description !== undefined){
            speechText = "You Successfully added "+item+" to the "+catalog+" catalogue, saying "+description
        } else {
            speechText = "You Successfully added "+item+" to the "+catalog+" catalogue"
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
    handle(handlerInput) {
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const catalog = Alexa.getSlotValue(requestEnvelope, 'catalog');
        
        let speechText = ""
        
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

                if (allItems.length === 0) {
                    speechText = "There are no items in "+catalog
                } else {

                    speechText = "Items in "+catalog+" are, "

                    allItems.forEach(item => {
                        speechText = speechText+item.ItemName+", "
                    });

                    speechText = speechText.slice(0, -2);
                }

            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
            })


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
    
            let catalogUUID = ""
    
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
                        speechText = `Description of ${item} is ${dbitem.Description}`;
                    }
                });


                
                if(speechText === ''){
                    speechText += 'Invalid item name '
                }

            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
            })


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
                    speechText += 'Invalid item name '
                }

            })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
            })
            if(item_uuid !== ''){
                await getRemoteData(`https://wuaatihexl.execute-api.us-east-1.amazonaws.com/dev/reminder/${item_uuid}`)
                    .then((response) => {
                        const data = JSON.parse(response);
        
                        let reminder_data = data.reminder.Reminder;
                        speechText = `Reminder of ${item} is ${reminder_data}`;
                    })
                .catch((err) => {
                    console.log(`ERROR: ${err.message}`);
                })
                
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
        const speakOutput = 'Goodbye!';

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
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .lambda();