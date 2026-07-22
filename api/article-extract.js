import handler from "../netlify-private-app/netlify/functions/article-extract.js";
import { adapt } from "../netlify-private-app/api/_adapter.js";

export default adapt(handler);
