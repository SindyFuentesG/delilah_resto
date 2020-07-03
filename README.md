# DELILAH RESTÓ

This is a REST API developed with Node.js and the purpose is managing a restaurant.

The API include this features:

- Users' register and login 
- Products' CRUD
- Orders' CRUD

## Installation

Clone the project
```bash
$ git clone https://github.com/SindyFuentesG/delilah_resto.git
``` 
Use npm or yarn to install the dependencies

```bash
$ npm install
```

```bash
$ yarn install
```

## Database configuration
In ``` config.js``` file located in (```sequlize/config.js```) you will find the database configuration. There you can edit the database's host, port, user and password.

## Database creation
In ``` database.sql``` file you will find all the queries to create delilah_resto database and tables.

## Deployment
```bash
cd server
node index.js
```
## API Documentation
All information about API enpoints is [here](https://github.com/SindyFuentesG/delilah_resto/blob/master/spec.yml)

## Dependencies used
- express v.4.17.1
- jsonwebtoken v.8.5.1
- mysql2 v.2.1.0
- sequlize 5.21.13



