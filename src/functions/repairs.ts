/* This code sample provides a starter kit to implement server side logic for your Teams App in TypeScript,
 * refer to https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference for complete Azure Functions
 * developer guide.
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { jwtDecode, JwtPayload } from "jwt-decode";

import repairRecords from "../repairsData.json";


/**
 * This function handles the HTTP request and returns the repair information.
 *
 * @param {HttpRequest} req - The HTTP request.
 * @param {InvocationContext} context - The Azure Functions context object.
 * @returns {Promise<Response>} - A promise that resolves with the HTTP response containing the repair information.
 */
export async function repairs(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {





  //joeadd re ai
  context.log("HTTP trigger function processed a request.");
  context.log(
    "AZURE_FUNCTIONS_ENVIRONMENT =",
    process.env.AZURE_FUNCTIONS_ENVIRONMENT
  );
  context.log("NODE_ENV =", process.env.NODE_ENV);
context.log("Joehmm azure hosts sets this env, not in vscode =", process.env.AZURE_FUNCTIONS_ENVIRONMENT);


  // joe add re ai  local vrs dev 
// Right above your permission guard:
//const isDevelopment_Joe =
  //process.env.AZURE_FUNCTIONS_ENVIRONMENT === "DevelopmentJOELOCAL"; .. opp azure functions sets this var to Development, not in vscode
  const isDevelopment_Joe =
  process.env.AZURE_FUNCTIONS_ENVIRONMENT === "Development";
//  joe rem re ai  local vrs dev 
  //if (!hasRequiredScopes(req, 'repairs_read')) {
    //return {
      //status: 403,
      //body: "Insufficient permissions",
    //};    
  //}
 // joe add ai
if (!isDevelopment_Joe && !hasRequiredScopes(req, "repairs_read")) {
  return { status: 403, body: "Insufficient permissions" };
}







  // Initialize response.
  const res: HttpResponseInit = {
    status: 200,
    jsonBody: {
      results: repairRecords,
    },
  };

  // Get the assignedTo query parameter.
  const assignedTo = req.query.get("assignedTo");

  // If the assignedTo query parameter is not provided, return the response.
  if (!assignedTo) {
    return res;
  }

  // Filter the repair information by the assignedTo query parameter.
  const repairs = repairRecords.filter((item) => {
    const fullName = item.assignedTo.toLowerCase();
    const query = assignedTo.trim().toLowerCase();
    const [firstName, lastName] = fullName.split(" ");
    return fullName === query || firstName === query || lastName === query;
  });

  // Return filtered repair records, or an empty array if no records were found.
  res.jsonBody.results = repairs ?? [];
  return res;
}

function hasRequiredScopes(req: HttpRequest, requiredScopes: string[] | string): boolean {
  if (typeof requiredScopes === "string") {
    requiredScopes = [requiredScopes];
  }

  const token = req.headers.get("Authorization")?.split(" ");
  if (!token || token[0] !== "Bearer") {
    return false;
  }

  try {
    const decodedToken = jwtDecode<JwtPayload & { scp?: string }>(token[1]);
    const scopes = decodedToken.scp?.split(" ") ?? [];
    return requiredScopes.every(scope => scopes.includes(scope));
  }
  catch (error) {
    return false;
  }
}

app.http("repairs", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: repairs,
});
