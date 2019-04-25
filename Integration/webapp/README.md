# React web application

## Overview

In Azure Blockchain Workbench, when you want to use a decentralized application, you can access to the Workbench UI.
This UI is really generic, and can be fine for some applications but inadequate for larger applications. However, the Workbench also exposes an API which can be used to build external applications. So, you are free to build any application with any language and interact with the blockchain throughout the API. You also have the possibility to integrate the blockchain part into an existing solution !

## Requirements

Before launching the app, you will have to execute the command `npm install` to install every required package for the application.
You also have to enter your Workbench address and application information into the file `adalConfig.js` located in [`webapp\src\js`](./src/js) directory.
For that, please follow to guide which explains how to do it.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.