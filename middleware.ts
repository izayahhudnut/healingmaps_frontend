export { auth as middleware } from "@/auth";
// import { NextRequest, NextResponse } from "next/server";

// const isPublicRoute = [
//   "/sign-in",
//   "/sign-up",
//   "/api/webhooks", // Exclude the webhook route from authentication
//   "/api/create-facility",
//   "/api/create-provider",
// ];

// export async function middleware(request: NextRequest) {
//   const { nextUrl } = request;

//   // Check if the current route matches any public route
//   const isPublic = isPublicRoute.some((route) =>
//     nextUrl.pathname.startsWith(route)
//   );

//   // If the route is public, allow the request
//   if (isPublic) {
//     return NextResponse.next();
//   }

//   // Check for authentication
//   const session = await auth();
//   const isAuthenticated: boolean = !!session?.user;

//   console.log("Session:", session, "isAuthenticated:", isAuthenticated);

//   if (!isAuthenticated && !isPublic) {
//     // Redirect to sign-in page if not authenticated
//     return NextResponse.redirect(new URL("/sign-in", request.url));
//   }

//   // If authenticated, allow the request
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     // Always run for API routes
//     "/(api|trpc)(.*)",
//   ],
// };

// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// // Add the webhook route to public routes
// const isPublicRoute = createRouteMatcher([
//   "/",
//   "/sign-in(.*)",
//   "/sign-up(.*)",
//   "/api/webhooks", // Exclude the webhook route from authentication
//   "/api/create-facility",
//   "/api/create-provider",
// ]);

// export default clerkMiddleware(async (auth, request) => {
//   if (!isPublicRoute(request)) {
//     await auth.protect();
//   }
// });
