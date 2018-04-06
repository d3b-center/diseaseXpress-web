import deAPI from "./generated/deAPI";
import {getApiUrl} from "./urls";

const client = new deAPI(getApiUrl());
export default client;