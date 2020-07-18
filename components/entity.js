import NextLink from 'next/link';
import { Fragment, useState } from 'react';

function Loading() {
  return (
    <p>
      Loading...
      <style jsx>{`
        color: lightgray;
        font-style: italic;
      `}</style>
    </p>
  );
}

/**
 * @template T
 * @param {T[]} items
 * @param {number} cutoff
 */
function useCutoff(items, cutoff) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => setExpanded((state) => !state);

  if (expanded || items.length - cutoff < 2) {
    return {
      items,
      hidden: [],
      toggle,
    };
  } else {
    return {
      items: items.slice(0, cutoff),
      hidden: items.slice(cutoff),
      toggle,
    };
  }
}

/**@param {{ data: unknown[], url: string, level: number }} props */
function List({ data, url, level }) {
  const { items, hidden, toggle } = useCutoff(
    data,
    level > 1 ? 3 : level > 0 ? 5 : 20
  );

  return (
    <>
      <ul>
        {items.map((item, key) => (
          <li key={key}>
            <Entity data={item} url={`${url}/${key}`} level={level + 1} />
          </li>
        ))}
        {hidden.length > 0 && (
          <li>
            <button onClick={toggle}>Show {hidden.length} more...</button>
          </li>
        )}
      </ul>

      <style jsx>{`
        li:not(:first-child) {
          padding-top: 0.5rem;
        }
        li:not(:last-child) {
          padding-bottom: 0.5rem;
          border-bottom: 1px solid lightgray;
        }
        button {
          font-style: italic;
        }
      `}</style>
    </>
  );
}

/**@param {{ data: object, url: string, level: number }} props */
function Record({ data, url, level }) {
  const { items, hidden, toggle } = useCutoff(
    Object.entries(data),
    level > 1 ? 3 : level > 0 ? 5 : 20
  );

  return (
    <>
      <dl>
        {items.map(([key, value]) => {
          if (key === 'href') {
            return (
              <dt key={key}>
                <NextLink href="/[...page]" as={value}>
                  <a>href</a>
                </NextLink>
              </dt>
            );
          } else if (
            value &&
            typeof value === 'object' &&
            Object.keys(value).length === 1 &&
            value.href
          ) {
            // Probably an index link as other links have a name prop or similar.
            return (
              <dt key={key}>
                <NextLink href="/[...page]" as={value.href}>
                  <a>{key}</a>
                </NextLink>
              </dt>
            );
          } else {
            return (
              <Fragment key={key}>
                <dt className={key === 'error' ? 'error' : undefined}>
                  <NextLink href="/[...page]" as={`${url}/${key}`}>
                    <a>{key}</a>
                  </NextLink>
                  :
                </dt>

                <dd className={key === 'error' ? 'error' : undefined}>
                  <Entity
                    data={value}
                    url={`${url}/${key}`}
                    level={level + 1}
                  />
                </dd>
              </Fragment>
            );
          }
        })}
        {hidden.length > 0 && (
          <dt>
            <button onClick={toggle}>Show {hidden.length} more...</button>
          </dt>
        )}
      </dl>

      <style jsx>{`
        dl {
          display: grid;
          grid-template-columns: auto 1fr;
          grid-row-gap: 1rem;
          grid-column-gap: 1rem;
        }
        dt {
          grid-column: 1;
          font-weight: 700;
        }
        dd {
          grid-column: 2;
        }
        button {
          font-style: italic;
        }
        .error {
          color: crimson;
        }
      `}</style>
    </>
  );
}

/**@param {{ data: string }} props */
function Link({ data }) {
  return (
    <p>
      <NextLink href="/[...page]" as={data}>
        <a>{data}</a>
      </NextLink>

      <style jsx>{`
        a {
          text-decoration: underline;
        }
      `}</style>
    </p>
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
 * @param {{ data: unknown, url: string, level?: number }} props
 */
export default function Entity({ data, url, level = 0 }) {
  if (url.endsWith(`/`)) {
    url = url.slice(0, -1);
  }

  if (data === undefined) {
    return <Loading />;
  } else if (Array.isArray(data)) {
    return <List data={data} url={url} level={level} />;
  } else if (typeof data === 'object') {
    return <Record data={data} url={url} level={level} />;
  } else if (typeof data === 'string' && data.startsWith('/api/')) {
    return <Link data={data} />;
  } else {
    return <Value data={data} />;
  }
}
