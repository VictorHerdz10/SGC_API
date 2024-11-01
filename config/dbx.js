import { Dropbox } from 'dropbox';
import dotenv from "dotenv";

dotenv.config();

const dbx = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  clientId: process.env.DROPBOX_CLIENT_ID,
  clientSecret: process.env.DROPBOX_CLIENT_SECRET,
});

export default dbx;