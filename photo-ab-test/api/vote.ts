import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Aquí guardas en Vercel KV o Postgres o archivo JSON
  console.log("Nuevo voto:", body);

  return NextResponse.json({ ok: true });
}
