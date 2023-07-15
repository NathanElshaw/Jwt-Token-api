# Jwt Auth

### Libaraies/Frameworks Used:

- Express
- Node.js
- Typescript
- JsonWebToken
- Cookie-Parser
- Mongoose

### Basic Usage

1. Use npm install to install all needed packages.
2. Ensure default.ts file is property set up (jwt_private_key, jwt_public_key token_TTL and port, optional if you don't want to use a db comment or remove lines marked with remove for no db usage and leave db_key blank.)

- &nbsp;&nbsp;&nbsp;&nbsp;Setting up Jwt Keys:

  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1. Generate a RSA key: https://travistidwell.com/jsencrypt/demo/ (use 2048 bit+)

  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. Encode RSA key with base64: https://www.base64encode.org

  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3. Insert Public key and Private key in nessesary spot.

1. Run npm start to start the web server

   &nbsp;&nbsp;&nbsp;&nbsp;Routes: Domain(http://Localhost:(your port number in default file))

   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/api: Create new jwt token if none exist

   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/api/get: Will display Jwt information

   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/api/delete: Will delete token

   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;To add more add them to the Routes.ts File in /src

### Flowchart

Represntation of how the api should work.

!["FlowChart"](Assests/Flowchart.jpeg, "Flowchart")
