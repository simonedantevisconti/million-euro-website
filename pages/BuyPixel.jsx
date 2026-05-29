import React from "react";
import { Link } from "react-router-dom";

const BuyPixel = () => {
  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Buy Pixels. Get a Website.</h1>
      <p className="text-center text-muted mb-5">
        Each pixel you buy gives you visibility on the homepage and access to a
        professional web development service.
      </p>

      <div className="row g-4">
        {/* DIGITAL PIXEL CARD */}
        <div className="col-12 col-md-3">
          <div className="card h-100 text-center border-dark">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Digital Pixel Card</h5>
              <h6 className="card-subtitle mb-3 text-muted">€1 · 1 Pixel</h6>

              <p className="card-text flex-grow-1">
                A collectible digital pixel card to support the project. Perfect
                if you want a small reward and your name in the community.
              </p>

              <ul className="list-unstyled mb-4">
                <li>✔ 1 pixel on the homepage</li>
                <li>✔ Digital pixel card reward</li>
                <li>✔ Custom color</li>
                <li>✔ Lifetime visibility</li>
              </ul>

              <button className="btn btn-dark mt-auto">Order Now</button>
            </div>
          </div>
        </div>

        {/* LANDING PAGE / PORTFOLIO */}
        <div className="col-12 col-md-3">
          <div className="card h-100 text-center">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Landing Page / Portfolio</h5>
              <h6 className="card-subtitle mb-3 text-muted">
                €10 · 100 Pixels
              </h6>

              <p className="card-text flex-grow-1">
                Perfect for personal branding or small projects. You get pixel
                visibility on the homepage linked to a custom landing page or
                portfolio.
              </p>

              <ul className="list-unstyled mb-4">
                <li>✔ 10×10 pixel block (100 pixels)</li>
                <li>✔ Custom color</li>
                <li>✔ Single-page website</li>
                <li>✔ Responsive design</li>
                <li>✔ Lifetime visibility</li>
              </ul>

              <Link
                to="/examples/landing"
                className="btn btn-outline-dark mb-2"
              >
                See example
              </Link>

              <button className="btn btn-dark mt-auto">Order Now</button>
            </div>
          </div>
        </div>

        {/* MULTI PAGE WEBSITE */}
        <div className="col-12 col-md-3">
          <div className="card h-100 text-center">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Multi-Page Website</h5>
              <h6 className="card-subtitle mb-3 text-muted">
                €100 · 1000 Pixels
              </h6>

              <p className="card-text flex-grow-1">
                Ideal for freelancers and small businesses. Get a larger visible
                pixel area and a professional multi-page website.
              </p>

              <ul className="list-unstyled mb-4">
                <li>✔ Pixel area: 1000 pixels</li>
                <li>Ciao Aono </li>
                <li>✔ Custom color</li>
                <li>✔ Up to 5 pages</li>
                <li>✔ SEO-friendly structure</li>
                <li>✔ Responsive design</li>
                <li>✔ Lifetime visibility</li>
              </ul>

              <Link
                to="/examples/multipage"
                className="btn btn-outline-dark mb-2"
              >
                See example
              </Link>

              <button className="btn btn-dark mt-auto">Order Now</button>
            </div>
          </div>
        </div>

        {/* FULL WEBSITE WITH DATABASE */}
        <div className="col-12 col-md-3">
          <div className="card h-100 text-center">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Full Website with Database</h5>
              <h6 className="card-subtitle mb-3 text-muted">
                €500 · 5000 Pixels
              </h6>

              <p className="card-text flex-grow-1">
                Designed for startups and advanced projects. A full-featured web
                application with backend, database, and custom logic.
              </p>

              <ul className="list-unstyled mb-4">
                <li>✔ Pixel area: 5000 pixels</li>
                <li>✔ Custom color</li>
                <li>✔ Frontend + backend</li>
                <li>✔ Database integration</li>
                <li>✔ Authentication (optional)</li>
                <li>✔ Lifetime visibility</li>
              </ul>

              <Link
                to="/examples/database"
                className="btn btn-outline-dark mb-2"
              >
                See example
              </Link>

              <button className="btn btn-dark mt-auto">Order Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyPixel;
