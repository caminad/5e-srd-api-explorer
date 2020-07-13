import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment } from 'react';
import useSWR from 'swr';
import Entity from '../components/entity';

/**@param {{ apiURL: string }} props */
function Nav({ apiURL }) {
  const apiURLParts = apiURL.slice(1).split('/');

  return (
    <nav>
      {apiURLParts.map((part, i) => (
        <Fragment key={i}>
          <span> / </span>

          <Link
            href={i === 0 ? '/' : '/[...page]'}
            as={['', ...apiURLParts.slice(1, i + 1)].join('/')}
            passHref
          >
            <a>{part}</a>
          </Link>
        </Fragment>
      ))}

      <span> </span>

      <small>
        <a href={apiURL}>[JSON]</a>
      </small>

      <style jsx>{`
        nav {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }
        span {
          color: lightgray;
        }
        a:hover {
          text-decoration: underline;
        }
        small {
          font-size: 1rem;
          color: lightgray;
        }
        small a {
          text-decoration: underline;
        }
      `}</style>
    </nav>
  );
}

export default function CatchallPage() {
  const { asPath } = useRouter();

  const apiURL = asPath === '/' ? '/api' : `/api${asPath}`;

  const { data } = useSWR(apiURL, async (key) => {
    const res = await fetch(key);
    return await res.json();
  });

  return (
    <main>
      <Nav apiURL={apiURL} />

      <div className="container">
        <Entity data={data} />
      </div>

      <style jsx>{`
        .container {
          margin: auto;
        }
      `}</style>
    </main>
  );
}
