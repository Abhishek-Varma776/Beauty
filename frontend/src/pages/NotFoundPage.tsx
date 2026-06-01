import { Link } from "react-router-dom";

export const NotFoundPage = () => (
  <section className="section-shell py-16">
    <div className="mx-auto max-w-xl panel text-center">
      <p className="badge">404</p>
      <h1 className="mt-2 font-display text-3xl text-brand-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">The page you requested is unavailable. Return to homepage to continue.</p>
      <Link className="btn-primary mt-5" to="/">
        Go Home
      </Link>
    </div>
  </section>
);
