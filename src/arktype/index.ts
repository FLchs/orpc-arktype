import { OpenAPIHandler } from "@orpc/openapi/fetch"; // or '@orpc/server/node'
import { CORSPlugin } from "@orpc/server/plugins";
import { onError } from "@orpc/server";
import { router } from "./router";
import { serve } from "bun";
import { OpenAPIGenerator } from "@orpc/openapi";
import { experimental_ArkTypeToJsonSchemaConverter as ArkTypeToJsonSchemaConverter } from "@orpc/arktype";

const handler = new OpenAPIHandler(router, {
  plugins: [new CORSPlugin()],
  interceptors: [onError((error) => console.error(error))],
});

const openAPIGenerator = new OpenAPIGenerator({
  schemaConverters: [new ArkTypeToJsonSchemaConverter()],
});

serve({
  port: 3001,
  async fetch(request: Request) {
    const { matched, response } = await handler.handle(request, {
      prefix: "/api",
      context: {
        headers: Object.fromEntries(request.headers),
      },
    });

    if (matched) {
      return response;
    }
    console.log(request.url);

    if (request.url === "http://localhost:3001/spec.json") {
      const spec = await openAPIGenerator.generate(router, {
        info: {
          title: "My Playground",
          version: "1.0.0",
        },
        servers: [
          { url: "/api" } /** Should use absolute URLs in production */,
        ],
        security: [{ bearerAuth: [] }],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
            },
          },
        },
      });
      return new Response(JSON.stringify(spec));
    }
    const html = `
    <html>
      <head>
        <title>My Client</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="https://orpc.unnoq.com/icon.svg" />
      </head>
      <body>
        <div id="app"></div>

        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        <script>
          Scalar.createApiReference('#app', {
            url: '/spec.json',
            authentication: {
              securitySchemes: {
                bearerAuth: {
                  token: 'default-token',
                },
              },
            },
          })
        </script>
      </body>
    </html>
  `;

    return new Response(html, {
      headers: { "Content-Type": "text/html;  charset=utf-8" },
    });
  },
});
