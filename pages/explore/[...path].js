import Head from 'next/head';
import { useRouter } from 'next/router';
import Entity from '../../components/entity';
import DATA from '../../data/5e.json';

/**
 * @param {unknown} obj
 * @param {string[]} keys
 */
function dig(obj, keys) {
  for (const key of keys) {
    if (typeof obj === `object` && obj !== null && obj.hasOwnProperty(key)) {
      obj = obj[key];
    } else {
      return undefined;
    }
  }
  return obj;
}

/**
 * @param {string} slug
 */
function titleize(slug) {
  return slug.replace(/_/g, ` `).replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

export function getStaticPaths() {
  const paths = [];
  for (const { _path, ...category } of Object.values(DATA)) {
    paths.push({ params: { path: _path } });
    for (const item of Object.values(category)) {
      paths.push({ params: { path: item._path } });
    }
  }
  return { paths, fallback: true };
}

/**@param {import('next').GetStaticPropsContext<{ path: string[] }>} context */
export async function getStaticProps(context) {
  const { path = [] } = context.params;

  let data = dig(DATA, path) ?? null;

  if (typeof data === `object` && data !== null && path.length < 2) {
    // Don’t send all of the data down if an index is requested.
    data = Object.entries(data).reduce((shallow, [key, value]) => {
      if (!key.startsWith(`_`)) {
        shallow[key] = {
          _path: value._path,
          name: value.name ?? titleize(key),
          description: value.description ?? null,
        };
      }
      return shallow;
    }, {});
  }
  return { props: { path, data } };
}

/**@param {import('next').InferGetStaticPropsType<typeof getStaticProps>} props */
export default function CatchallPage({ path, data }) {
  const { isFallback } = useRouter();

  if (isFallback) {
    return (
      <>
        <p>Loading...</p>

        <style jsx>{`
          p {
            margin: auto;
            text-align: center;
            color: lightgray;
            font-style: italic;
            font-size: 1.25rem;
          }
        `}</style>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Head>
          <title>Not Found</title>
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

  return (
    <main className="container">
      <Entity data={data} path={path} />

      <style jsx>{`
        main {
          margin: auto;
        }
      `}</style>
    </main>
  );
}
