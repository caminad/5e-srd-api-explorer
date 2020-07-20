import NextLink from 'next/link';
import { Fragment } from 'react';

/**@param {{ data: object, path: string[], level: number }} props */
function Category({ data, path, level }) {
  return (
    <ul>
      {Object.entries(data).map(([key, { _path, name, description }]) => {
        return (
          <li key={key}>
            <Record
              data={{ _path, name, description }}
              path={[...path, key]}
              level={level + 1}
            />
          </li>
        );
      })}

      <style jsx>{`
        li:not(:first-child) {
          padding-top: 0.5rem;
        }
        li:not(:last-child) {
          padding-bottom: 0.5rem;
        }
      `}</style>
    </ul>
  );
}

/**@param {{ data: unknown[], path: string[], level: number }} props */
function List({ data: items, path, level }) {
  return (
    <>
      <ul>
        {items.map((item, key) => (
          <li key={key}>
            <Entity
              data={item}
              path={[...path, String(key)]}
              level={level + 1}
            />
          </li>
        ))}
      </ul>

      <style jsx>{`
        li:not(:first-child) {
          padding-top: 0.5rem;
        }
        li:not(:last-child) {
          padding-bottom: 0.5rem;
        }
      `}</style>
    </>
  );
}

/**@param {{ data: object, path: string[], level: number }} props */
function Record({ data: allData, path, level }) {
  const { name, description, _path, ...data } = allData;

  const title =
    name ||
    data.class?.name ||
    data.class ||
    data.damage_type?.name ||
    data.dc_type?.name ||
    _path?.[_path.length - 1].replace(/-/g, ` `);

  const entries = Object.entries(data);

  return (
    <>
      {title && (
        <NextLink
          href="/explore/[...path]"
          as={[`/explore`, ...(_path || path)].join(`/`)}
        >
          <a>
            <h3>{title}</h3>
            {description?.split(`\n`).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </a>
        </NextLink>
      )}

      {entries.length > 0 && (
        <dl>
          {entries.map(([key, value]) => (
            <Fragment key={key}>
              <dt>
                {Array.isArray(value._path) ? (
                  <NextLink
                    href="/explore/[...path]"
                    as={`/explore/${value._path.join(`/`)}`}
                  >
                    <a>{key}</a>
                  </NextLink>
                ) : (
                  key
                )}
                :
              </dt>

              <dd>
                <Entity data={value} path={[...path, key]} level={level + 1} />
              </dd>
            </Fragment>
          ))}
        </dl>
      )}

      <style jsx>{`
        h3 {
          font-weight: 700;
        }
        p {
          margin-top: 0.5rem;
        }
        a:hover h3 {
          text-decoration: underline;
        }
        a + dl {
          margin-top: 1rem;
        }
        dt {
          font-weight: 700;
          margin-top: 1rem;
        }
        dt a:hover {
          text-decoration: underline;
        }
        dd {
          padding-left: 2rem;
          margin-top: 1rem;
        }
        @media (min-width: 640px) {
          dl {
            display: grid;
            grid-template-columns: auto 1fr;
            grid-row-gap: 1rem;
            grid-column-gap: 1rem;
          }
          dt {
            grid-column: 1;
            margin-top: 0;
          }
          dd {
            grid-column: 2;
            padding-left: 0;
            margin-top: 0;
          }
        }
      `}</style>
    </>
  );
}

/**@param {{ data: unknown }} props */
function Value({ data }) {
  return (
    <>
      {String(data)
        .split(`\n`)
        .filter(Boolean)
        .map((line, i) => (
          <p key={i}>{line}</p>
        ))}

      <style jsx>{`
        p:not(:last-child) {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </>
  );
}

/**
 * @param {{ data: unknown, path: string[], level?: number }} props
 */
export default function Entity({ data, path, level = 0 }) {
  if (path.length < 2) {
    return <Category data={data} path={path} level={level} />;
  } else if (Array.isArray(data)) {
    return <List data={data} path={path} level={level} />;
  } else if (typeof data === 'object') {
    return <Record data={data} path={path} level={level} />;
  } else {
    return <Value data={data} />;
  }
}
