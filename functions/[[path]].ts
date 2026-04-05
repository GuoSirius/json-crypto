// Cloudflare Pages Functions - SPA 回退处理
// 所有未匹配的路由返回 index.html

export async function onRequest(context) {
  // 返回 index.html，让客户端路由处理
  return context.env.ASSETS.fetch(new Request(context.request.url));
}
