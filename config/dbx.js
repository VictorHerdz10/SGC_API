import { Dropbox } from 'dropbox';
import dotenv from "dotenv";

dotenv.config();

const dbx = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN
});

export default dbx;