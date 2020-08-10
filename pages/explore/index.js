import { mapObjIndexed, pipe, replace, toUpper } from 'ramda';
import DATA from '../../data/5e.json';
import CatchallPage from './[...path]';

const titleize = pipe(replace(/_/g, ' '), replace(/\b[a-z]/g, toUpper));

export function getStaticProps() {
  const data = mapObjIndexed(
    ({ _path }, key) => ({ _path, name: titleize(key) }),
    DATA
  );

  return { props: { path: [], data } };
}

export default CatchallPage;
