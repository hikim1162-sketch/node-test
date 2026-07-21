function requestBody(request) {
  if (request.method === "GET" || request.method === "HEAD") return undefined;
  if (request.body === undefined || request.body === null) return undefined;
  return typeof request.body === "string" || Buffer.isBuffer(request.body)
    ? request.body
    : JSON.stringify(request.body);
}

export function adapt(netlifyHandler) {
  return async function vercelHandler(request, response) {
    const protocol = request.headers["x-forwarded-proto"] || "https";
    const host = request.headers.host || "localhost";
    const webRequest = new Request(`${protocol}://${host}${request.url}`, {
      method: request.method,
      headers: request.headers,
      body: requestBody(request),
    });

    const result = await netlifyHandler(webRequest);
    response.statusCode = result.status;
    result.headers.forEach((value, name) => response.setHeader(name, value));
    response.end(Buffer.from(await result.arrayBuffer()));
  };
}
