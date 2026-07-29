import type { APIContext } from 'astro';

export async function GET(ctx: APIContext) {
  return ctx.redirect('/admin/v1');
}
