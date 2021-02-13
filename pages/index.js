import Head from "next/head";
import React from "react";

import HomepageContent from "../features/home/HomepageContent";

export default function Home() {
  return (
    <>
      <Head>
        <title>eFishery Front End Test</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        ></meta>
      </Head>
      <HomepageContent />
    </>
  );
}
