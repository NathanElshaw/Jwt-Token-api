# Jwt Auth

### Basic Usage

1. Use npm install to install all needed packages.
2. Ensure default.ts file is property set up (jwt_private_key, jwt_public_key token_TTL and port, optional if you don't want to use a db comment or remove lines marked with remove for no db usage and leave db_key blank.)
   &nbsp;Setting up Jwt Keys:
   &nbsp;&nbsp;1. Generate a RSA key: https://travistidwell.com/jsencrypt/demo/ (use 2048 bit+)
   &nbsp;&nbsp;2. Encode RSA key with base64 https://www.base64encode.org
   &nbsp;&nbsp;2. Insert Public key and Private key in nessesary spot.
