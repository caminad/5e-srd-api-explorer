import Link from 'next/link';

export default function Index() {
  return (
    <div className="flex flex-col items-center justify-evenly">
      <h1 className="text-4xl font-bold text-center">
        D&amp;D 5th Edition Data Explorer
      </h1>
      <Link href="/explore">
        <a className="px-8 py-4 text-xl font-bold border border-gray-900 rounded shadow-md transition-colors duration-75 hover:bg-gray-900 hover:text-white">
          Explore!
        </a>
      </Link>
    </div>
  );
}
