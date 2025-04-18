import { sql } from "@/lib/server/db"

export async function GET () {
  // run to make sure the db works
  await sql`select * from backups limit 1;`
  return Response.json({
    // if we get here that means the query ran
    db: 'ok'
  })
}