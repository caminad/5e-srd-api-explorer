import DATA from '../data/5e.json';
import Entity from '../components/entity';

/**@typedef {{ path: string[], data: unknown }} Props */

/**@type {import('next').GetServerSideProps<Props, { path: string[] }>} */
export async function getServerSideProps(context) {
  const { path } = context.params;

  /**@type {unknown} */
  let data = DATA;
  for (const index of path) {
    data = data?.[index] ?? { error: 'Not Found' };
  }

  // Don’t send all of the data down if an index is requested.
  if (path.length < 3) {
    const shallow = {};
    for (const [key, value] of Object.entries(data)) {
      shallow[key] = {
        name:
          value.name ??
          key.replace(/-/g, ` `).replace(/\b[a-z]/g, (c) => c.toUpperCase()),
        description: value.description || null,
      };
    }
    data = shallow;
  }

  return { props: { path, data } };
}

/**@param {Props} props */
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
