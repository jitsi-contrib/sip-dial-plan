// check your prosody config file and get the secret from "app_secret"
export const TOKEN_SECRET = "myappsecret";

// "HS256" and "HS512" are supported. If you don't update it explicitly in your
// prosody config file then the default value is "HS256"
export const TOKEN_ALGORITHM = "HS256";
