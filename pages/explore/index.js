import DATA from '../../data/5e.json';
import CatchallPage from './[...path]';

/**
 * @param {string} s
 */
const toUpperCase = (s) => s.toUpperCase();

/**
 * @param {string} s
 */
const titleize = (s) => s.replace(/_/g, ' ').replace(/\b[a-z]/g, toUpperCase);

export function getStaticProps() {
  const data = {};

  for (const [key, { _path }] of Object.entries(DATA)) {
    data[key] = { _path, name: titleize(key) };
  }

  return { props: { path: [], data } };
}

export default CatchallPage;
