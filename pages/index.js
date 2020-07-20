import Link from 'next/link';

export default function Index() {
  return (
    <div>
      <h1>D&amp;D 5th Edition API Explorer</h1>
      <p>
        <Link href="/explore">
          <a>
            <span>Explore!</span>
          </a>
        </Link>
      </p>

      <style jsx>{`
        div {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-evenly;
        }
        h1 {
          font-size: 2rem;
          font-weight: 700;
        }
        p {
          font-size: 1.25rem;
        }
        a {
          font-weight: 700;
          padding-left: 2rem;
          padding-right: 2rem;
          padding-top: 1rem;
          padding-bottom: 1rem;
          border-width: 1px;
          border-stype: solid;
          border-color: currentColor;
          border-radius: 0.25rem;
          box-shadow: 0 0.25rem 1rem -0.5rem;
        }
        a:hover {
          background-color: currentColor;
        }
        a:hover span {
          color: white;
        }
      `}</style>
    </div>
  );
}
