import express from 'express';
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const router = express.Router();

const DisableTryItOutPlugin = function() {
  return {
    statePlugins: {
      spec: {
        wrapSelectors: {
          allowTryItOutFor: () => () => false
        }
      }
    }
  }
}

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: "NFTService",
      version: "1.0.0",
      description: "REST API for NFT Service",
      contact: {
        email: "",
      },
    },
    parameters: {
      
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "apiKey",
        }
      },
    },
    security: [{
      ApiKeyAuth: []
    }],
  },
  apis: ["./src/routes/*.ts", "./src/models/*.ts", "./src/exceptions/*.ts"],
});

const options = {
  swaggerOptions: {
    persistAuthorization: true,
  }
};

require("swagger-model-validator")(swaggerSpec);
router.get("/json", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec, options));

export default router;