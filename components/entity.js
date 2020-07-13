import NextLink from 'next/link';
import { Fragment } from 'react';

const Loading = () => (
  <p>
    Loading...
    <style jsx>{`
      color: lightgray;
      font-style: italic;
    `}</style>
  </p>
);

const Nothing = () => (
  <p>
    None
    <style jsx>{`
      color: lightgray;
      font-style: italic;
    `}</style>
  </p>
);

/**@param {{ data: unknown[] }} props */
const List = ({ data }) => (
  <ul>
    {data.length === 0 ? (
      <Nothing />
    ) : (
      data.map((item, i) => (
        <li key={i}>
          <Entity data={item} />
        </li>
      ))
    )}

    <style jsx>{`
      li:not(:first-child) {
        padding-top: 0.5rem;
      }
      li:not(:last-child) {
        padding-bottom: 0.5rem;
        border-bottom: 1px solid lightgray;
      }
    `}</style>
  </ul>
);

/**@param {{ data: object }} props */
const Record = ({ data }) => (
  <dl>
    {Object.entries(data).map(([key, value]) => {
      let className;
      if (key === '_id' || key === 'index') {
        className = 'private';
      }
      if (key === 'error') {
        className = 'error';
      }
      return (
        <Fragment key={key}>
          <dt className={className}>{key}:</dt>

          <dd className={className}>
            <Entity data={value} />
          </dd>
        </Fragment>
      );
    })}

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
      .private {
        color: lightgray;
      }
      .error {
        color: crimson;
      }
    `}</style>
  </dl>
);

/**@param {{ data: string }} props */
const Link = ({ data }) => (
  <p>
    <NextLink href="/[...page]" as={data.slice(4)} passHref>
      <a>{data}</a>
    </NextLink>

    <span> </span>

    <small>
      <a href={data}>[JSON]</a>
    </small>

    <style jsx>{`
      a {
        text-decoration: underline;
      }
      small {
        color: lightgray;
        font-size: 0.8rem;
      }
    `}</style>
  </p>
);

/**@param {{ data: unknown }} props */
export default function Entity({ data }) {
  if (data === undefined) {
    return <Loading />;
  } else if (data === null) {
    return <Nothing />;
  } else if (Array.isArray(data)) {
    return <List data={data} />;
  } else if (typeof data === 'object') {
    return <Record data={data} />;
  } else if (typeof data === 'string' && data.startsWith('/api/')) {
    return <Link data={data} />;
  } else {
    return <>{String(data)}</>;
  }
}
