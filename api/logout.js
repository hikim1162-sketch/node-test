import handler from "../netlify-private-app/netlify/functions/logout.js";
import { adapt } from "../netlify-private-app/api/_adapter.js";

export default adapt(handler);
