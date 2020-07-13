import Head from 'next/head';
import 'tailwindcss/dist/base.css';
import 'tailwindcss/dist/components.css';

/**@param {import('next/app').AppProps} props */
export default function App({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <title>D&amp;D 5th Edition API Explorer</title>
      </Head>

      <Component {...pageProps} />

      <footer>
        Made by <a href="https://twitter.com/kitibyte">David Jones</a> using the{' '}
        <a href="https://www.dnd5eapi.co/">D&amp;D 5th Edition API</a> ·{' '}
        <a href="https://github.com/kitibyte/5e-srd-api-explorer">
          github.com/kitibyte/5e-srd-api-explorer
        </a>
      </footer>

      <style jsx>{`
        div {
          margin: auto;
          padding: 0.5rem;
          min-height: 100vh;
          display: grid;
          grid-template-rows: 1fr auto;
          color: rgb(46, 52, 54);
          background: white;
        }
        footer {
          margin-top: 4rem;
          border-top: 1px solid lightgray;
          padding-top: 2rem;
          padding-bottom: 2rem;
          text-align: center;
        }
        a {
          text-decoration: underline;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
