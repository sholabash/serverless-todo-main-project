// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const API_ID = '148emtdk0d'
const DOMAIN = 'dev-ct5r50qu.us.auth0.com'
const CLIENT_ID = '9yvzrpXqRgSS1BonsXjOS8GocZ30zST2'
const CALLBACK_URL = 'http://localhost:3000/callback'
export const apiEndpoint = `https://${API_ID}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map.
  domain: DOMAIN,            // Auth0 domain
  clientId: CLIENT_ID,          // Auth0 client id
  callbackUrl: CALLBACK_URL
}
