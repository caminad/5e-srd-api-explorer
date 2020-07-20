require(`dotenv`).config();

const fetch = require(`node-fetch`).default;
const fs = require(`fs`).promises;

const numericCollator = new Intl.Collator(undefined, { numeric: true });

run().catch((error) => {
  process.exitCode = 1;
  console.error(error);
});

/**
 * @typedef {{ _path: string[], [key: string]: unknown }} Entity
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
 * @param {string} title
 */
function slugify(title) {
  return title.toLowerCase().replace(/ /g, `-`);
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
        value = value.join(`\n`);
      }

    case `class`:
      if (typeof value === `string`) {
        // Replace string names with references.
        value = {
          _path: [`classes`, slugify(value)],
          name: value,
        };
      }
  }

  if (!value) {
    return /* drop falsy */;
  } else if (typeof value === `object` && Object.keys(value).length === 0) {
    return /* drop empty */;
  } else if (
    typeof value === `string` &&
    (value.startsWith(`/api/`) ||
      value.startsWith(`http://www.dnd5eapi.co/api/`))
  ) {
    // Sorce uses a variety of keys for references, this makes sure that they’re all caught.
    let path = value.split(`/`);
    path = path.slice(path.indexOf(`api`) + 1);
    if (
      Number.isInteger(Number(path[path.length - 1])) &&
      typeof this.name === `string`
    ) {
      // Re-write URLs using numeric IDs to use slugs.
      path[path.length - 1] = slugify(this.name);
    }
    this._path = path;
    return /* drop replaced */;
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
    for (const entity of entities) {
      let index = value;
      for (const [i, segment] of entity._path.slice(0, -1).entries()) {
        if (index[segment] === undefined) {
          index[segment] = { _path: entity._path.slice(0, i + 1) }; // create a new index
        }
        index = index[segment]; // descend
      }
      index[entity._path[entity._path.length - 1]] = entity;
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
