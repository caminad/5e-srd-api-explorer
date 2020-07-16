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

/**@param {{ data: unknown[], url: string }} props */
const List = ({ data, url }) => (
  <ul>
    {data.length === 0 ? (
      <Nothing />
    ) : (
      data.map((item, i) => (
        <li key={i}>
          <Entity data={item} url={`${url}/${i}`} />
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

/**@param {{ data: object, url: string }} props */
const Record = ({ data, url }) => (
  <dl>
    {Object.entries(data).map(([key, value]) => {
      let className;
      if (key === 'error') {
        className = 'error';
      }
      if (key === '$ref') {
        return (
          <dt key={key}>
            <NextLink href={value.slice(4)}>
              <a>[...]</a>
            </NextLink>
          </dt>
        );
      }
      return (
        <Fragment key={key}>
          <dt className={className}>
            <NextLink href={`${url}/${key}`}>
              <a>{key}</a>
            </NextLink>
            :
          </dt>

          <dd className={className}>
            <Entity data={value} url={`${url}/${key}`} />
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

    <style jsx>{`
      a {
        text-decoration: underline;
      }
    `}</style>
  </p>
);

/**
 * @param {{ data: unknown, url: string }} props
 */
export default function Entity({ data, url }) {
  if (data === undefined) {
    return <Loading />;
  } else if (data === null) {
    return <Nothing />;
  } else if (Array.isArray(data)) {
    return <List data={data} url={url} />;
  } else if (typeof data === 'object') {
    return <Record data={data} url={url} />;
  } else if (typeof data === 'string' && data.startsWith('/api/')) {
    return <Link data={data} />;
  } else {
    return <>{String(data)}</>;
  }
}
