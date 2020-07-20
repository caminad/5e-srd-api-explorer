import DATA from '../../data/5e.json';
import CatchallPage from './[...path]';

/**
 * @param {string} slug
 */
function titleize(slug) {
  return slug.replace(/-/g, ` `).replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

export function getStaticProps() {
  // Don’t send all of the data down if an index is requested.
  const data = Object.entries(DATA).reduce((shallow, [key, value]) => {
    if (!key.startsWith(`_`)) {
      shallow[key] = {
        _path: value._path,
        name: titleize(key),
      };
    }
    return shallow;
  }, {});

  return { props: { path: [], data } };
}

export default CatchallPage;
