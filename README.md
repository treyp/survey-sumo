# survey-sumo

This is a responsive web app written to display random survey questions to guests. Guests get a randomly chosen unanswered survey question until all questions have been answered. They can also go back and edit previously answered questions.

It also comes with an interface for admins to see the results, edit the survey questions and answers, and create other admins. Questions are not published until an admin chooses to publish them, which gives them a chance to finish writing answers and making edits before the question goes live.

The backend is written in [Node.js](https://nodejs.org/) and uses [Express](http://expressjs.com/) and [Sequelize](http://www.sequelizejs.com/). The front end is a single-page [React](https://facebook.github.io/react/) app that uses [Redux](http://redux.js.org/) and [material-ui](http://www.material-ui.com/). The front end gets built using [Webpack](http://webpack.github.io/) and [Babel](https://babeljs.io/).

# Installation

## Prerequisites
Make sure you have the following installed:

* MySQL
* Latest stable version of [Node.js v0.10.x](https://nodejs.org/en/download/releases/)

## Instructions

1. Check out this repo using git
2. Create a database (and user for it, if you don't have one) in your MySQL instance. For example:

    ```sql
    CREATE USER 'surveysumo'@'localhost' IDENTIFIED BY 'slenderman';
    GRANT ALL PRIVILEGES ON *.* TO 'surveysumo'@'localhost';
    create database surveysumo;
    ```

3. `npm install`
4. `cp config.js.sample config.js` - Copy `./config.js.sample` to `./config.js` (this is done so your changes are `.gitignore`d). Edit the file to reflect your environment. In addition to these settings, the environment type can be set later using the environmental variable `NODE_ENV`, which supports the values `production` and `development` (see the Running section below).
5. `npm run setup` (If you want to load some sample data, use `npm run sample` instead.) This will set up the database tables and default user in your database using the configuration from the previous step.

## Running

In production:

* `NODE_ENV=production npm start`
* A Procfile is also included for hosting with Heroku. You'll need to set up the environmental variables ("config vars" in your Heroku app settings). Make sure the database is initialized per the installation instructions above. You may want to host the code locally, point it to your remote Heroku database, and run `npm run setup` locally.

During development:

* Run `npm run dev`
  * Debug output will be turned on for all Node modules (except `babel`, which is noisy)
  * `webpack-dev-middleware` will refresh the front end bundles as you code
  * `nodemon` will restart the server on file changes
* If you want to reset the database, run `npm run setup` (or `npm run sample` if you want an example of survey data). Note: both of these will reset the admin user to the default.
* If you want to record some sample responses, the quickest way to do this is to open an incognito window for the guest-facing side, `/`. Rinse and repeat for more responses.

# Usage

Once the server is running, the admin interface to create a survey is available at `/admin`. The default login was configured in `./config.js` during installation.

Once the survey is ready, you can send a link to the root, `/`, to your guests.

# Contributing

This app follows the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript). The Node portion follows [their legacy ES5 rules](https://github.com/airbnb/javascript/blob/master/es5). The front end, which gets compiled by Babel, follows [their React rules](https://github.com/airbnb/javascript/blob/master/react).

[eslint](http://eslint.org/) rules are included. `npm i -g eslint eslint-config-airnbn` and then `eslint .` to check your code.

# Todo

* In polling for responses in admin tool, only send diff since last request
* We assume only one browser per user. In the case that users can sign in to multiple devices, we'll need to create some concept of users, whether it be unique URLs or actual logins.
* HTTPS support, which will also require changing the session cookie to secure cookie
* Isomorphic JS, which for most frameworks, requires a Node version upgrade
* Move assets to different domain to prevent cookies from being sent
* Only send chunks of survey to user when survey gets large
* Re-ordering of answers by admin
* A shuffle option per question to optionally randomize the order of the answers
* Allow multiple responses per question
* Polyfills for older browsers
* Configure webpack to output hash name in asset filename for long term browser caching
* Better install process/no default login
* Use proper material design on admin login page
