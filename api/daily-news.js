import handler from "../netlify-private-app/netlify/functions/daily-news.js";
import { adapt } from "../netlify-private-app/api/_adapter.js";

export default adapt(handler);
