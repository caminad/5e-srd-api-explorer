import NextLink from 'next/link';
import { Fragment } from 'react';

/**@param {{ data: object, path: string[] }} props */
function Category({ data, path }) {
  return (
    <ul>
      {Object.entries(data).map(([key, { _path, name, description }]) => {
        return (
          <li key={key}>
            <Record data={{ _path, name, description }} path={[...path, key]} />
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

/**@param {{ data: unknown[], path: string[] }} props */
function List({ data: items, path }) {
  return (
    <>
      <ul>
        {items.map((item, key) => (
          <li key={key}>
            <Entity data={item} path={[...path, String(key)]} />
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

/**@param {{ data: object, path: string[] }} props */
function Record({ data: { name, description, _path, ...data }, path }) {
  switch (Object.keys(data).join()) {
    case `item,quantity`:
      return (
        <div>
          <span>{data.quantity}</span>
          <Record data={data.item} path={path} />

          <style jsx>{`
            div {
              display: flex;
            }
            span {
              margin-right: 0.5rem;
            }
          `}</style>
        </div>
      );
    case `damage_dice,damage_type`:
      return (
        <div>
          <span>{data.damage_dice}</span>
          <Record data={data.damage_type} path={path} />

          <style jsx>{`
            div {
              display: flex;
            }
            span {
              margin-right: 0.5rem;
            }
          `}</style>
        </div>
      );
    case `dice_count,dice_value`:
      return (
        <div>
          {data.dice_count}d{data.dice_value}
        </div>
      );
    case `quantity,unit`:
      return (
        <div>
          <span>{data.quantity}</span>
          <i>{data.unit}</i>

          <style jsx>{`
            div {
              display: flex;
            }
            span {
              margin-right: 0.25rem;
            }
          `}</style>
        </div>
      );
  }

  const entries = Object.entries(data);

  return (
    <>
      {name && (
        <NextLink
          href="/explore/[...path]"
          as={[`/explore`, ...(_path || path)].join(`/`)}
        >
          <a>
            <h3>{name}</h3>
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
                    <a>{key.replace(/_/g, ` `)}</a>
                  </NextLink>
                ) : (
                  key.replace(/_/g, ` `)
                )}
                :
              </dt>

              <dd>
                <Entity data={value} path={[...path, key]} />
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
 * @param {{ data: unknown, path: string[] }} props
 */
export default function Entity({ data, path }) {
  if (path.length < 2) {
    return <Category data={data} path={path} />;
  } else if (Array.isArray(data)) {
    return <List data={data} path={path} />;
  } else if (typeof data === 'object') {
    return <Record data={data} path={path} />;
  } else {
    return <Value data={data} />;
  }
}
