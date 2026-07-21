import handler from "../netlify/functions/check-auth.js";
import { adapt } from "./_adapter.js";

export default adapt(handler);
