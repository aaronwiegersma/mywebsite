// /api/invite.ts (Vercel)
// Set env vars in Vercel: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE
import { NextRequest, NextResponse } from 'next/server'; // or standard Node handler
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // { org_id, email, role }
    const { org_id, email, role = 'member' } = body;

    // Auth from cookie (optional): verify requester is owner/admin of org via RLS-safe lookup
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);

    // Send invite email (creates user if needed)
    const { data: inviteRes, error: adminErr } = await supabase.auth.admin.inviteUserByEmail(
      email,
      { redirectTo: `${process.env.PUBLIC_SITE_URL}/login.html` }
    );
    if (adminErr) throw adminErr;

    // Record invite in public table
    const { error: dbErr } = await supabase
      .from('org_invites')
      .insert({
        org_id,
        email: email.toLowerCase(),
        role,
        created_by: inviteRes.user?.app_metadata?.provider ? null : inviteRes.user?.id // optional
      });
    if (dbErr) throw dbErr;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
