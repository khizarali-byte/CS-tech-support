export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tickets/:path*',
    '/sessions/:path*',
    '/calendar/:path*',
    '/users/:path*',
    '/recordings/:path*',
    '/timezone/:path*',
  ],
}
