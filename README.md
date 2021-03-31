# Marker-allocation-tool-api

Trello board: https://trello.com/b/mAYp4wAx/classe-a-web-based-tool-for-organising-markers

# Contributing

To start working on a feature either:

- work on a existing branch (not develop or main)
- or checkout from develop and name the branch according the branch name specified in the trello item e.g. MAT-2

Once you are done with a branch create a pull request to develop.

Do not merge develop branch into main until we are ready to do a deployment and have done testing.

# To run the script

- create a directory
- cd into the directory created

- npm install express
- npm install sqlite3
- npm run start

# src/app.js

App will run at http://localhost:8000/
API endpoint

- GET a list of users
  http://localhost:8000/api/users
- GET a single user using userID
  http://localhost:8000/api/user/(userID)
- POST a new user specifing (userID ,firstName, lastName, email, role)

# src/db/database.js

- The script will create a database based on the ERD.
- insert some test users
