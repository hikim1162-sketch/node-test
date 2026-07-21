import handler from "../netlify/functions/ai-sentence-analysis.js";
import { adapt } from "./_adapter.js";

export default adapt(handler);
