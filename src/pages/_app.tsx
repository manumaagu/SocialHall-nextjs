// pages/_app.js o pages/_app.tsx
import "@/styles/globals.css";
import "@/styles/login.css";
import "@/styles/app.css";
import { ClerkProvider, RedirectToSignIn } from "@clerk/nextjs";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import Head from "next/head";

const publicPages = ["/login/[[...index]]", "/signup/[[...index]]", "/public-page", "/"];
const noHeaderPages = ["/login/[[...index]]", "/signup/[[...index]]"];

function MyApp({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();

  const isPublicPage = publicPages.includes(pathname);
  const showHeader = !noHeaderPages.includes(pathname);

  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>SocialHall</title>
      </Head>
      {showHeader && <Header />}
      {/* {!isPublicPage && <RedirectToSignIn redirectUrl={"/login"} />} */}
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp;
