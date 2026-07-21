import handler from "../netlify/functions/login.js";
import { adapt } from "./_adapter.js";

export default adapt(handler);
