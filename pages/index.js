import Link from 'next/link';

export default function Index() {
  return (
    <div className="flex flex-col items-center justify-evenly">
      <h1 className="text-4xl font-bold">D&amp;D 5th Edition API Explorer</h1>
      <p className="text-xl">
        <Link href="/explore">
          <a className="font-bold px-8 py-4 border border-gray-900 rounded shadow-md transition-colors duration-75 hover:bg-gray-900 hover:text-white">
            <span>Explore!</span>
          </a>
        </Link>
      </p>
    </div>
  );
}
