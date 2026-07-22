import handler from "../netlify-private-app/netlify/functions/youtube-shorts.js";
import { adapt } from "../netlify-private-app/api/_adapter.js";

export default adapt(handler);
