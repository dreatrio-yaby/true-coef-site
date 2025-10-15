// Cloudflare Pages Functions middleware
// This file enables Node.js compatibility for the entire project

export const onRequest = async (context) => {
  // Pass through to the next handler
  return context.next();
};
