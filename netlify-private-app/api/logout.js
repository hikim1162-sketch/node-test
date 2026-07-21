import handler from "../netlify/functions/logout.js";
import { adapt } from "./_adapter.js";

export default adapt(handler);
