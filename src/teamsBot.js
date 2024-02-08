const { TeamsActivityHandler, MessageFactory, CardFactory } = require("botbuilder");
const axios = require('axios');
const canvaAdaptiveCard = require("./adaptiveCards/CanvaAdaptiveCard.json");
const fs = require('fs');
const path = require('path');
var Bottleneck = require("bottleneck/es5");

class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();
    console.log(`Constructor called`);
    const languageDirectory = './Languages';
    const dirPath = path.resolve(__dirname, languageDirectory);
    const languageObjects = {};
    const RTLLanguages = ['ar', 'he', 'ur', 'yi', 'pe', 'di', 'arc'];

    // Read all files in the directory
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
    const filePath = path.join(dirPath, file);

      // Check if it's a file (not a directory)
      if (fs.statSync(filePath).isFile()) {
        // Extract language code from file name
        const languageCode = path.parse(file).name; 
        languageObjects[languageCode] = require(filePath);
      }
    });

    this.onMessage(async (context, next) => {  
    const text = context.activity.text.toLowerCase();
    const userLanguage = context.activity.locale;
    const languageISO = userLanguage.substring(0,2);
    console.log('user languague ISO is ' + languageISO);

    let userLanguageFile = languageObjects[languageISO];
    
    if (!userLanguageFile) {
        userLanguageFile = languageObjects['en'];
    } 

    const commentAction = context.activity.value; 
    const replyToId = context.activity.replyToId;
    
    if (commentAction) {
            const userComment = commentAction.userInput;
            try {
                await axios.post('http://localhost:3000/webhook', { userComment, replyToId });
            } catch (error) {
                console.error('Error making POST request:', error);
            }
           // await context.sendActivity(`You entered: ${userComment}`);
    }
    
    else if(text.includes('send') && RTLLanguages.includes(languageISO)){
            canvaAdaptiveCard.rtl = true;
            canvaAdaptiveCard.actions[0].card.rtl = true;
            await this.localizeCard(canvaAdaptiveCard, userLanguageFile, context);
    }
    
    else if(text.includes('send')) {
            canvaAdaptiveCard.rtl = false;
            canvaAdaptiveCard.actions[0].card.rtl = false;
            await this.localizeCard(canvaAdaptiveCard, userLanguageFile, context);
    }
    
    else {
          console.log('If not send');
          await context.sendActivity('How may i assist you ?');
    }
 
    await next();
    });
  }



localizeCard(adaptiveCard, languageValues, context) {
  let cardString = JSON.stringify(adaptiveCard);

  Object.keys(languageValues).forEach((variable) => {
    const placeholder = `{{${variable}}}`;
    const regex = new RegExp(placeholder, 'g');
    cardString = cardString.replace(regex, languageValues[variable]);
  });
  
  const parsed = JSON.parse(cardString);
  const card2 = CardFactory.adaptiveCard(parsed);
  context.sendActivity({ attachments: [card2] });
}

async handleTeamsMessagingExtensionSubmitAction(context, action) {
    console.log('handle submit action is called ');
}

async handleTeamsTaskModuleFetch(context, taskModuleRequest) {
  //const tableCard = this.showCommentBox();
  return {
    task: {
      type: 'continue',
      value: {
        //card: tableCard,
        title: "Preview of Link",
        url: "https://botiframe.netlify.app/index.html",
        height: "large",
        width: "large",
        fallbackUrl: "https://botiframe.netlify.app/index.html"
      },
    },
  };
}


async handleTeamsMessagingExtensionFetchTask(context, action) {
   // const tableCard = this.getTableCard();
   let randomNumber =  Math.floor(1000 + Math.random() * 9000);
   console.log('random number is ', randomNumber);
    return {
      task: {
        type: 'continue',
        value: {
          //card: tableCard,
          url: "https://www.canva.com/design/DAF7iyLNoUs/sOrjkaOzO1wHfvRNJd5b7w/view?embed&utm_source=integration_ms-teams&utm_medium=referral&utm_content=f3f31bb5-8faa-413a-9861-7c62e101ce03&utm_campaign=unfurl_document-url-public_preview_button&utm_term=ff4ea8e6-677f-43cf-b8c5-1c1c65bfeafd/param?a="+randomNumber,
          title: "Task Module Bot",
          fallbackUrl: "https://www.canva.com/design/DAF7iyLNoUs/sOrjkaOzO1wHfvRNJd5b7w/view?embed&utm_source=integration_ms-teams&utm_medium=referral&utm_content=f3f31bb5-8faa-413a-9861-7c62e101ce03&utm_campaign=unfurl_document-url-public_preview_button&utm_term=ff4ea8e6-677f-43cf-b8c5-1c1c65bfeafd/param?a="+randomNumber
        },
      },
    };
  }

  showCommentBox() {
    {
      const tableCard = CardFactory.adaptiveCard({
        type: 'AdaptiveCard',
          body: [
            {
                type: 'TextBlock',
                text: 'Please Comment Here'
            },
            {
                type: 'Input.Text',
                id: 'userInput',
                placeholder: 'Type here...'
            },
          ],
            actions: [
            {
                type: 'Action.Submit',
                title: 'Send'
            }
        ],
    });
     
      return tableCard;
    }
  }

  getTableCard() {
    const table = [];
    for (let i = 1; i <= 100; i++) {
      table.push({
        type: 'TextBlock',
        text: i.toString(),
        wrap: true,
      });
    }
    const tableCard = CardFactory.adaptiveCard({
      type: 'AdaptiveCard',
      body: [
          {
              type: 'TextBlock',
              text: 'Canva Message Extension UI',
              weight: 'bolder',
              size: 'medium'
          },

          {
              type: 'TextBlock',
              text: 'Demo App of Extension'
          },

          {
              type: 'Image',
              url: 'https://cdn3d.iconscout.com/3d/free/thumb/free-canva-9234654-7516879.png',//images[4].urlToImage,
              size: 'auto'
          }
      ],
      actions: [
          {
              type: 'Action.OpenUrl',
              title: 'Open In Canva',
              url: 'https://www.canva.com'
          }

         
      ],
  });
   
    return tableCard;
  }

  async onTeamsMessagingExtensionSubmitAction(context, action) {
    const commentAction = action.data;
    const userComment = commentAction.userInput;
    console.log('User Comment:', userComment);
   // await context.sendActivity(`You entered: ${userComment}`);
  }

  async handleTeamsTaskModuleSubmit(context, taskModuleRequest) {
    const userComment = taskModuleRequest.data.userInput;
    try {
      await axios.post('http://localhost:3000/webhook', { userComment });
  } catch (error) {
      console.error('Error making POST request:', error);
  }

  await context.sendActivity({ type: 'invokeResponse', value: null });

}
}
module.exports.TeamsBot = TeamsBot;


