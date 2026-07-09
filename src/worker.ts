import { Client } from "pg";

export interface Env {
  // Bind your Hyperdrive configuration under the name "HYPERDRIVE" in wrangler.toml
  HYPERDRIVE: { connectionString: string };
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    // 1. Initialize Client using the connection string from Hyperdrive
    const client = new Client({
      connectionString: env.HYPERDRIVE.connectionString,
    });

    try {
      // 2. Establish connection to your Railway PostgreSQL database
      await client.connect();

      // 3. Run query (e.g., SELECT * FROM pg_tables)
      const result = await client.query("SELECT * FROM pg_tables");

      // 4. Return results as JSON
      return Response.json({ result: result.rows });
    } catch (e) {
      // 5. Handle errors gracefully
      return Response.json(
        { error: e instanceof Error ? e.message : e },
        { status: 500 }
      );
    } finally {
      // 6. CRITICAL: Close connection to prevent exhaustion of connection pool
      // ctx.waitUntil executes this in the background, speeding up the response time
      ctx.waitUntil(client.end());
    }
  },
};
