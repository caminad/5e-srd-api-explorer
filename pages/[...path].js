import DATA from '../data/5e.json';
import Entity from '../components/entity';

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
  return slug.replace(/-/g, ` `).replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

/**@param {import('next').GetServerSidePropsContext<{ path: string[] }>} context */
export async function getServerSideProps(context) {
  const { path } = context.params;

  let data = dig(DATA, path) ?? null;

  if (typeof data === `object` && data !== null && path.length < 3) {
    // Don’t send all of the data down if an index is requested.
    data = Object.entries(data).reduce((shallow, [key, value]) => {
      shallow[key] = {
        name: value.name ?? titleize(key),
        description: value.description ?? null,
      };
      return shallow;
    }, {});
  }
  return { props: { path, data } };
}

/**@param {import('next').InferGetServerSidePropsType<typeof getServerSideProps>} props */
export default function CatchallPage({ path, data }) {
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
