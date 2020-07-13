/**@type {import('next').NextApiHandler} */
export default async function catchallHandler(request, response) {
  const remoteResponse = await fetch(`https://www.dnd5eapi.co${request.url}`);

  if (remoteResponse.ok) {
    // Consider fresh for one hour, serve a stale response while updating.
    response.setHeader(
      'cache-control',
      `s-maxage=3600, stale-while-revalidate`
    );
    response.json(await remoteResponse.json());
  } else {
    response.status(remoteResponse.status);
    response.json(await remoteResponse.json());
  }
}
