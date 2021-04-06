# Marker-allocation-tool-api

Trello board: https://trello.com/b/mAYp4wAx/classe-a-web-based-tool-for-organising-markers

# Contributing

To start working on a feature either:

- work on a existing branch (not develop or main)
- or checkout from develop and name the branch according the branch name specified in the Trello item e.g. MAT-2

Once you are done with a branch create a pull request to develop.

Do not merge develop branch into main until we are ready to do a deployment and have done testing.

# To run the script

1. After cloning the repository, run `npm install` or `yarn install`.

2. Run `npm run build` command. It has to be done before you run the project if you make any changes.

3. `npm run dev` command will use Nodemon library to run the project.

 - If you don't want to use Nodemon, `node build/index.js`. This requires the second step to be completed first anyway.

The app will run at the port number 8000 by default.

# API endpoints

- GET a list of users
  http://localhost:8000/api/users
- GET a single user using userID
  http://localhost:8000/api/user/(userID)
- POST a new user specifing (userID ,firstName, lastName, email, role)

# src/db/database.js

- The script will create a database based on the ERD.
- insert some test users
