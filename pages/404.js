import Head from 'next/head';

export default function PageNotFound() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found</title>
        <meta name="robots" content="noindex" />
      </Head>

      <p className="m-auto text-center font-bold text-xl">Not Found.</p>
    </>
  );
}
