require(`dotenv`).config();

const fetch = require(`node-fetch`).default;
const fs = require(`fs`).promises;
const { basename, dirname, relative, sep } = require(`path`).posix;

const numericCollator = new Intl.Collator(undefined, { numeric: true });

run().catch((error) => {
  process.exitCode = 1;
  console.error(error);
});

/**
 * @typedef {{ href: string, [key: string]: unknown }} Entity
 */

async function run() {
  let auth;
  if (process.env.GITHUB_ACCESS_TOKEN) {
    auth = { Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}` };
  }

  /**@type {{ name: string, download_url: string }[]} */
  const contents = await fetch(
    `https://api.github.com/repos/bagelbits/5e-database/contents/src`,
    { headers: { Accept: `application/vnd.github.v3+json`, ...auth } }
  ).then((res) => res.json());

  /**@type {Entity[]} */
  const entities = [].concat(
    ...(await Promise.all(
      contents
        .filter((entry) => entry.name.endsWith(`.json`))
        .filter((entry) => !entry.name.includes(`Test`))
        .map(async (entry) => {
          const res = await fetch(entry.download_url);
          return JSON.parse(await res.text(), reviver);
        })
    ))
  );

  const json = JSON.stringify(entities, replacer, 2);
  await fs.mkdir(`./data`, { recursive: true });
  await fs.writeFile(`./data/5e.json`, json);
}

/**
 * Modifies source JSON for consistency during parsing.
 * @this {Record<string, unknown>}
 * @param {string} key
 * @param {unknown} value
 * @returns {unknown}
 */
function reviver(key, value) {
  switch (key) {
    case `index`:
    case `class_levels`:
      return /* drop unused */;

    case `desc`:
      // Rename key.
      this.description = reviver(`description`, value);
      return /* drop replaced */;

    case `description`:
    case `higher_level`:
    case `special`:
      if (Array.isArray(value)) {
        // Ensure that description-like values are strings.
        return reviver(key, value.join(`\n`));
      } else {
        break;
      }
  }

  switch (typeof value) {
    case `string`:
      if (value.startsWith(`/api/`)) {
        // Sorce uses a variety of keys for references, this makes sure that they’re all caught.
        this.href = value;
        return /* drop replaced */;
      } else if (value.startsWith(`http://www.dnd5eapi.co/api/`)) {
        // Re-write absolute URLs which all use numeric ids.
        const parent = dirname(value.slice(value.indexOf(`/api/`)));
        const slug = /**@type {string} */ (this.name)
          .toLowerCase()
          .replace(/ /g, `-`);
        this.href = `${parent}/${slug}`;
        return /* drop replaced */;
      } else {
        break;
      }
  }

  if (!value) {
    return /* drop falsy */;
  } else if (typeof value === `object` && Object.keys(value).length === 0) {
    return /* drop empty */;
  } else {
    return value;
  }
}

/**
 * Expands source entities into nested indices during serialization.
 * @this {Record<string, unknown>}
 * @param {string} key
 * @param {unknown} value
 * @returns {unknown}
 */
function replacer(key, value) {
  if (key === '' /* top level */) {
    // Expand top level array of entities into nested routes.
    const entities = /**@type {Entity[]} */ (value);

    value = {};
    for (const { href, ...body } of entities) {
      let index = value;
      for (const segment of dirname(relative(sep, href)).split(sep)) {
        if (index[segment] === undefined) {
          index[segment] = {}; // create a new index
        }
        index = /**@type {Record<string, unknown>} */ (index[segment]); // descend
      }
      index[basename(href)] = body;
    }
  } else if (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  ) {
    // Shallow copy a record and sort keys.
    const entries = Object.entries(value);
    entries.sort(([keyA], [keyB]) => numericCollator.compare(keyA, keyB));

    value = {};
    for (const [key, value_] of entries) {
      value[key] = value_;
    }
  }

  return value;
}
