require(`dotenv`).config();

const fetch = require(`node-fetch`).default;
const fs = require(`fs`).promises;

const numericCollator = new Intl.Collator(undefined, { numeric: true });

run().catch((error) => {
  process.exitCode = 1;
  console.error(error);
});

/**
 * @typedef {{ _path: string[], class?: Entity, [key: string]: unknown }} Entity
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
          return res.json();
        })
    ))
  );

  const combined = combineEntities(entities);

  const json = JSON.stringify(combined, undefined, 2);
  await fs.mkdir(`./data`, { recursive: true });
  await fs.writeFile(`./data/5e.json`, json);
}

/**
 * @param {string} title
 */
function slugify(title) {
  return title.toLowerCase().replace(/\W/g, `_`);
}

/**
 * @param {Entity[]} entities
 * @returns {Record<string, Entity>}
 */
function combineEntities(entities) {
  for (const child of nestedChildren(entities)) {
    // Drop unused properties.
    delete child.index;
    delete child.class_levels;

    renameProperty(child, 'desc', 'description');

    joinProperty(child, 'description', '\n');
    joinProperty(child, 'higher_level', '\n');
    joinProperty(child, 'special', '\n');

    // Extra class-specific level data can just be merged with the rest of the level data.
    mergePropertyDown(child, 'class_specific');

    dropFalsyProperties(child);
    dropEmptyProperties(child);

    replaceLinkWithPath(child);
    replaceStringPropertyWithPath(child, 'class', ['classes']);
  }

  /**
   * @type {Record<string, Entity>}
   */
  const result = {};

  for (const entity of entities) {
    if (!entity._path) {
      console.warn('Warning: Rejecting entity without a path:', entity);
      continue;
    }

    fixUpPath(entity);

    /**
     * @type {unknown}
     */
    let index = result;
    for (const [i, segment] of entity._path.entries()) {
      if (index[segment] === undefined) {
        index[segment] = { _path: entity._path.slice(0, i + 1) }; // create a new index
      }
      index = index[segment]; // descend
    }
    Object.assign(index, entity);
  }

  for (const child of nestedChildren(result)) {
    sortObject(child, numericCollator.compare);
  }

  return result;
}

/**
 * @param {Record<string, unknown>} obj
 * @param {string} key
 */
function mergePropertyDown(obj, key) {
  if (key in obj) {
    Object.assign(obj, obj[key]);
    delete obj[key];
  }
}

/**
 * @param {Record<string, unknown>} obj
 * @param {string} key
 * @param {string} newKey
 */
function renameProperty(obj, key, newKey) {
  if (key in obj) {
    obj[newKey] = obj[key];
    delete obj[key];
  }
}

/**
 * @param {Record<string, unknown>} obj
 * @param {string} key
 * @param {string} separator
 */
function joinProperty(obj, key, separator) {
  const value = obj[key];
  if (Array.isArray(value)) {
    obj[key] = value.join(separator);
  }
}

/**
 * @param {Record<string, unknown>} obj
 */
function dropFalsyProperties(obj) {
  for (const [key, value] of Object.entries(obj)) {
    if (!value) {
      delete obj[key];
    }
  }
}

/**
 * @param {Record<string, unknown>} obj
 */
function dropEmptyProperties(obj) {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === `object` && Object.keys(value).length === 0) {
      delete obj[key];
    }
  }
}

/**
 * @param {Record<string, unknown>} obj
 */
function replaceLinkWithPath(obj) {
  for (const [key, value] of Object.entries(obj)) {
    if (
      typeof value === `string` &&
      (value.startsWith(`/api/`) ||
        value.startsWith(`http://www.dnd5eapi.co/api/`))
    ) {
      // Sorce uses a variety of keys for references, this makes sure that they’re all caught.
      let path = value.split(`/`);
      path = path.slice(path.indexOf(`api`) + 1);
      // Slugify consistently to allow paths to be JSON keys.
      path = path.map(slugify);
      if (
        Number.isInteger(Number(path[path.length - 1])) &&
        typeof obj.name === `string`
      ) {
        // Re-write URLs using numeric IDs to use slugs.
        path[path.length - 1] = slugify(obj.name);
      }

      obj._path = path;

      // Drop replaced.
      delete obj[key];
    }
  }
}

/**
 * @param {Record<string, unknown>} obj
 * @param {string} key
 * @param {string[]} path
 */
function replaceStringPropertyWithPath(obj, key, path) {
  const value = obj[key];
  if (typeof value === `string`) {
    obj[key] = {
      _path: path.concat(slugify(value)),
      name: value,
    };
  }
}

/**
 * @param {Entity} entity
 */
function fixUpPath(entity) {
  switch (entity._path[0]) {
    case `starting_equipment`:
    case `spellcasting`:
      // Place exclusively class-related categories within their class.
      entity._path = entity.class._path.concat(entity._path[0]);
      delete entity.class;
      break;

    case `classes`:
      switch (entity._path[2]) {
        case undefined:
          // Delete the corresponding links on classes.
          delete entity.starting_equipment;
          delete entity.spellcasting;
          break;

        case `levels`:
          switch (entity._path.length) {
            case 4:
              // Simplify level and class into a name.
              entity.name = `${entity.class.name} Level ${entity.level}`;
              delete entity.class;
              delete entity.level;
          }
      }
  }
}

/**
 * Yields each nested object within obj, depth first.
 * Arrays are recursed but not passed to callbackfn.
 * @param {Record<string, unknown> | unknown[]} obj
 * @returns {IterableIterator<Record<string, unknown>>}
 */
function* nestedChildren(obj) {
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null) {
      yield* nestedChildren(/** @type {any} */ (value));
    }
  }
  if (!Array.isArray(obj)) {
    yield obj;
  }
}

/**
 * Sorts keys of object in place.
 * @param {Record<string, unknown>} obj
 * @param {(a: string, b: string) => number} compare
 */
function sortObject(obj, compare) {
  for (const key of Object.keys(obj).sort(compare)) {
    const value = obj[key];
    delete obj[key];
    obj[key] = value;
  }
}
