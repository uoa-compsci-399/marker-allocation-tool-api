# Marker-allocation-tool-api

Trello board: https://trello.com/b/mAYp4wAx/classe-a-web-based-tool-for-organising-markers

# Contributing

To start working on a feature either:

- work on a existing branch (not develop or main)
- or checkout from develop and name the branch according the branch name specified in the Trello item e.g. MAT-2

Once you are done with a branch create a pull request to develop.

Do not merge develop branch into main until we are ready to do a deployment and have done testing.

# To run the script

1. After cloning the repository, run `yarn install`.

2. Then to install Yarn: `npm install -g yarn`

3. Install https://volta.sh/ for automatic node & yarn version management

4. From project root run `yarn install`

5. Run `yarn run dev` command will use Nodemon package to run the server.

6. If you don't want to use Nodemon run `yarn run start`, but you will have
   to restart whenever you make changes.

7. Open in http://localhost:8000/

# API endpoints

- GET a list of users
  http://localhost:8000/api/users
- GET a single user using userID
  http://localhost:8000/api/user/(userID)
- POST a new user specifing (userID ,firstName, lastName, email, role)

# src/db/database.js

- The script will create a database based on the ERD.
- insert some test users
