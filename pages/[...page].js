import { useRouter } from 'next/router';
import useSWR from 'swr';
import Entity from '../components/entity';

export default function CatchallPage() {
  const router = useRouter();

  const { data } = useSWR(router.asPath, async (key) => {
    if (key === `/[...page]`) {
      // Called too early.
      throw new Error();
    }
    const res = await fetch(`https://5e-database-static.vercel.app${key}`);
    return await res.json();
  });

  return (
    <main className="container">
      <Entity data={data} url={router.asPath} />

      <style jsx>{`
        main {
          margin: auto;
        }
      `}</style>
    </main>
  );
}
