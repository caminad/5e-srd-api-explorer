import NextLink from 'next/link';
import { Fragment } from 'react';

/**@param {{ data: object, path: string[] }} props */
function Category({ data, path }) {
  return (
    <ul className="space-y-4">
      {Object.entries(data).map(([key, { _path, name, description }]) => {
        return (
          <li key={key}>
            <Record data={{ _path, name, description }} path={[...path, key]} />
          </li>
        );
      })}
    </ul>
  );
}

/**@param {{ data: unknown[], path: string[] }} props */
function List({ data: items, path }) {
  return (
    <ul className="space-y-4">
      {items.map((item, key) => (
        <li key={key}>
          <Entity data={item} path={[...path, String(key)]} />
        </li>
      ))}
    </ul>
  );
}

/**@param {{ data: object, path: string[] }} props */
function Record({ data: { name, description, _path, ...data }, path }) {
  switch (Object.keys(data).join()) {
    case `item,quantity`:
      return (
        <div className="flex">
          <span className="mr-2">{data.quantity}</span>
          <Record data={data.item} path={path} />
        </div>
      );
    case `damage_dice,damage_type`:
      return (
        <div className="flex">
          <span className="mr-2">{data.damage_dice}</span>
          <Record data={data.damage_type} path={path} />
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
        <div className="flex">
          <span className="mr-1">{data.quantity}</span>
          <i>{data.unit}</i>
        </div>
      );
  }

  const entries = Object.entries(data);

  return (
    <div className="space-y-4">
      {name && (
        <NextLink
          href="/explore/[...path]"
          as={[`/explore`, ...(_path || path)].join(`/`)}
        >
          <a className="space-y-4">
            <h3 className="font-bold hover:underline">{name}</h3>
            {description?.split(`\n`).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </a>
        </NextLink>
      )}

      {entries.length > 0 && (
        <dl className="sm:grid sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {entries.map(([key, value]) => (
            <Fragment key={key}>
              <dt className="font-bold sm:col-start-1">
                {Array.isArray(value._path) ? (
                  <NextLink
                    href="/explore/[...path]"
                    as={`/explore/${value._path.join(`/`)}`}
                  >
                    <a className="hover:underline">{key.replace(/_/g, ` `)}</a>
                  </NextLink>
                ) : (
                  key.replace(/_/g, ` `)
                )}
                :
              </dt>

              <dd className="pl-8 mt-4 sm:pl-0 sm:mt-0 sm:col-start-2 sm:col-span-3 md:col-span-4 lg:col-span-5 xl:col-span-6">
                <Entity data={value} path={[...path, key]} />
              </dd>
            </Fragment>
          ))}
        </dl>
      )}
    </div>
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
    return <p>{data}</p>;
  }
}
