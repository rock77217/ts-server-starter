/**
 * @swagger
 * components:
 *   responses:
 *     NotFound:
 *       description: The specified resource was not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     RequestError:
 *       description: Request data invalid
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     Unauthorized:
 *       description: Unauthorized
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *       required:
 *         - error
 */

export default class HttpException extends Error {
  public status: number;

  constructor(message: string, status?: number) {
    super(message);
    this.message = message;

    if (status) {
      this.status = status;
    } else {
      if (Object.values(MSG_400).find(s => message.startsWith(s))) {
        this.status = 400;
      } else if (Object.values(MSG_403).find(s => message.startsWith(s))) {
        this.status = 403;
      } else if (Object.values(MSG_404).find(s => message.startsWith(s))) {
        this.status = 404;
      } else {
        this.status = 500;
      }
    }
  }
}

/**
 * Http return values
 */
 export const MSG_200 = {
  successful: "Successful",
  activated: "Activated",
};
export const MSG_400 = {
  already_activated: "Already activated",
  already_init: "Adm user already activated",
  entity_not_found: "Entity not found. Please check your input.",
  role_invalid: "Invalid roles",
  user_not_found: "User name not found",
  update_failed: "Update data failed.",
  delete_failed: "Delete data failed.",
};
export const MSG_403 = {
  auth_failed: "Authentication error",
  key_invalid: "API key invalid",
  not_activated: "This user not activated yet",
  permission_denied: "Permission denied",
};
export const MSG_404 = {
  not_found: "Not Found",
};
export const MSG_500 = {
  update_failed: "Database update error",
  server_error: "Server error, please contact administrator",
  model_not_found: "Model not found. Please check your input.",
};
