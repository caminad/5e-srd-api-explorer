import Head from 'next/head';

export default function PageNotFound() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found</title>
        <meta name="robots" content="noindex" />
      </Head>

      <p>Not Found.</p>

      <style jsx>{`
        p {
          margin: auto;
          text-align: center;
          font-weight: 700;
          font-size: 1.25rem;
        }
      `}</style>
    </>
  );
}
