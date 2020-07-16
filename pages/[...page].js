import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment } from 'react';
import useSWR from 'swr';
import Entity from '../components/entity';

/**@param {{ apiURL: string }} props */
function Nav({ apiURL }) {
  const apiURLParts = apiURL.split('/').slice(1);

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
      `}</style>
    </nav>
  );
}

export default function CatchallPage() {
  const { asPath } = useRouter();

  let apiURL = `/api${asPath}`;
  if (apiURL.endsWith(`/`)) {
    apiURL = apiURL.slice(0, -1);
  }

  const { data } = useSWR(apiURL, async (key) => {
    const res = await fetch(
      `https://5e-database-static.vercel.app${key}?depth=2`
    );
    return await res.json();
  });

  return (
    <main>
      <Nav apiURL={apiURL} />

      <div className="container">
        <Entity data={data} url={apiURL.slice(4)} />
      </div>

      <style jsx>{`
        .container {
          margin: auto;
        }
      `}</style>
    </main>
  );
}
