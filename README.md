# Getting Started with Alexa Skill

Alexa Skill as a Cataloguing Application for Users

## Create and Manage Skills with Alexa Developer Console

Sign up/ Log in with Amazon Alexa account.</br>
You can go the following link to manage your skill via Alexa developer console  https://developer.amazon.com/alexa/console/ask

## Create and Manage Skills with VS Code

Install VS code editor
### Install and initialize ASK CLI

Use npm to install ASK CLI. 'npm install -g ask-cli'  </br>
Use the 'ask configure' command to initialize ASK CLI with your Amazon and AWS credentials

### Sign in to your Amazon developer account from VS Code
Use the following procedure to log into your Amazon developer account from VS Code. </br>

In the activity bar, click the Alexa icon. </br>
On the Sign in page, click Sign in. The Amazon developer account sign in page launches in your browser.  </br>
After signing in, return to VS Code. </br>

## Testing

Setup
To get started, you need to install Bespoken Tools.

If you haven't already, follow these steps:

Install NPM
Instructions here if you have not already installed npm. https://docs.npmjs.com/getting-started

#### Open a Command Prompt  </br>
  For Mac, run Applications -> Terminal  </br>
  For Windows, select Run -> cmd  </br>

#### Install Bespoken Tools  </br>
Once on the command-line, type:  </br>

'npm install bespoken-tools -g'   </br>

If that fails with a permission warning, you can simply run:  </br>

'sudo npm install bespoken-tools -g'   </br>

To confirm that it is installed, type: 'bst' on the command-prompt.  </br>
You should see something like this:  </br>

$ bst   </br>
BST: v2.0.0  Node: v8.11.1   </br>

Usage: bst [options] [command]  </br>

#### Run Your Tests   
If you are starting with one of the sample projects below, just go ahead and enter:  </br>

'bst test'   </br>
That's all there is to it!   </br>
