import { useRouter } from 'next/router';
import { flip, map, pathOr, pick, pipe, startsWith, values } from 'ramda';
import { omitBy } from 'ramda-adjunct';
import Entity from '../../components/entity';
import DATA from '../../data/5e.json';
import PageNotFound from '../404';

const summarize = pipe(
  omitBy(flip(startsWith('_'))),
  map(pick(['_path', 'name', 'description']))
);

/**@type {import('next').GetStaticPaths<{ path: string[] }>} */
export async function getStaticPaths() {
  return {
    paths: map(({ _path }) => ({ params: { path: _path } }), values(DATA)),
    fallback: true,
  };
}

/**@param {import('next').GetStaticPropsContext<{ path: string[] }>} context */
export async function getStaticProps(context) {
  const { path: _path } = context.params;

  let data = pathOr(null, _path, DATA);

  if (data && _path.length === 1) {
    data = summarize(data);
  }

  return { props: { path: _path, data } };
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
