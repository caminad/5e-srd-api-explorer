import { useRouter } from 'next/dist/client/router';
import Head from 'next/head';
import Link from 'next/link';
import '../styles/tailwind.css';

function Nav({ path }) {
  const { pathname } = useRouter();

  return (
    <nav>
      <Link href="/">
        <a aria-current={pathname === '/' ? 'page' : undefined}>home</a>
      </Link>

      <Link href="/explore">
        <a aria-current={pathname === '/explore' ? 'page' : undefined}>
          explore
        </a>
      </Link>

      {path?.map((part, i) => (
        <Link
          key={`${i}-${part}`}
          href="/explore/[...path]"
          as={[`/explore`, ...path.slice(0, i + 1)].join(`/`)}
        >
          <a aria-current={i === path.length - 1 ? 'page' : undefined}>
            {part.replace(/_/g, ` `)}
          </a>
        </Link>
      ))}

      <style jsx>{`
        nav {
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
        }
        a:not([aria-current]):not(:hover):not(:focus) {
          color: lightgray;
        }
        a + a::before {
          content: ' / ';
          color: lightgray;
        }
      `}</style>
    </nav>
  );
}

function Footer() {
  return (
    <footer>
      Made by <a href="https://twitter.com/kitibyte">David Jones</a> using the{' '}
      <a href="https://github.com/bagelbits/5e-database/">
        D&amp;D 5th Edition API Database
      </a>
      {' · '}
      <a href="https://github.com/kitibyte/5e-srd-api-explorer">
        github.com/kitibyte/5e-srd-api-explorer
      </a>
      <style jsx>{`
        footer {
          margin-top: 2rem;
          padding-top: 2rem;
          padding-bottom: 2rem;
          text-align: center;
          font-size: 0.875rem;
        }
        a {
          text-decoration: underline;
          white-space: nowrap;
        }
      `}</style>
    </footer>
  );
}

/**@param {import('next/app').AppProps} props */
export default function App({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <title>D&amp;D 5th Edition API Explorer</title>
      </Head>

      <Nav {...pageProps} />

      <Component {...pageProps} />

      <Footer />

      <style jsx>{`
        div {
          margin: auto;
          padding: 0.5rem;
          min-height: 100vh;
          display: grid;
          grid-template-rows: min-content auto min-content;
          color: rgb(46, 52, 54);
          background: white;
        }
      `}</style>
    </div>
  );
}
