import handler from "../netlify/functions/daily-news.js";
import { adapt } from "./_adapter.js";

export default adapt(handler);
