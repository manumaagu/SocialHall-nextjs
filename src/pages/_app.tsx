// pages/_app.js o pages/_app.tsx
import "@/styles/globals.css";
import "@/styles/login.css";
import "@/styles/app.css";
import "@/styles/header.css";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import Head from "next/head";

const noHeaderPages = ["/login/[[...index]]", "/signup/[[...index]]"];

function MyApp({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();

  const showHeader = !noHeaderPages.includes(pathname);

  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>SocialHall</title>
      </Head>
      {showHeader && <Header />}
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp;
