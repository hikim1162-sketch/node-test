import handler from "../netlify/functions/article-extract.js";
import { adapt } from "./_adapter.js";

export default adapt(handler);
