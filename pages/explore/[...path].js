import { useRouter } from 'next/router';
import Entity from '../../components/entity';
import DATA from '../../data/5e.json';
import PageNotFound from '../404';

/**
 * @param {unknown} data
 */
function summarize(data) {
  /** @type {{ [k: string]: { _path: string[] | null, name: string | null, description: string | null } }} */
  const result = {};

  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('_')) continue;

    result[key] = {
      _path: value._path ?? null,
      name: value.name ?? null,
      description: value.description ?? null,
    };
  }

  return result;
}

/**
 * @param {{ [key: string]: unknown }} data
 * @param {string[]} path
 */
const dig = (data, path) => path.reduce((prev, key) => prev?.[key], data);

/**@type {import('next').GetStaticPaths<{ path: string[] }>} */
export async function getStaticPaths() {
  return {
    paths: Object.values(DATA).map(({ _path }) => ({
      params: { path: _path },
    })),
    fallback: true,
  };
}

/**@param {import('next').GetStaticPropsContext<{ path: string[] }>} context */
export async function getStaticProps(context) {
  const { path } = context.params;

  let data = dig(DATA, path) ?? null;

  if (data && path.length === 1) {
    data = summarize(data);
  }

  return { props: { path, data } };
}

/**@param {import('next').InferGetStaticPropsType<typeof getStaticProps>} props */
export default function CatchallPage({ path, data }) {
  const { isFallback } = useRouter();

  if (isFallback) {
    return (
      <p className="m-auto text-center opacity-50 italic text-xl">Loading...</p>
    );
  }

  if (!data) {
    return <PageNotFound />;
  }

  return (
    <main className="container m-auto">
      <Entity data={data} path={path} />
    </main>
  );
}
