import React, { useState } from "react";

const ContactMe = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    title: "",
    description: "",
  });

  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const to = "simone.visconti4@gmail.com";
    const subject = `[Million Euro Website] ${
      form.title || "New contact request"
    }`;

    const bodyLines = [
      `First Name: ${form.firstName}`,
      `Last Name: ${form.lastName}`,
      `Email: ${form.email}`,
      "",
      `Title: ${form.title}`,
      "",
      "Description:",
      form.description,
      "",
      fileName
        ? `Attachment (optional): ${fileName} (please attach this file manually in the email)`
        : "Attachment (optional): none",
    ];

    const body = bodyLines.join("\n");

    const mailto = `mailto:${to}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Contact Me</h1>
      <p className="text-center text-muted mb-5">
        Fill out the form below and I&apos;ll get back to you as soon as
        possible.
      </p>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      placeholder="John"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Doe"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      placeholder="Project inquiry / Pixel order / Website request..."
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      required
                      rows="5"
                      placeholder="Tell me about your idea, goals, pages, features, deadlines..."
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Attachment (optional)</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleFileChange}
                    />
                    <div className="form-text">
                      Note: files can&apos;t be attached automatically via the
                      browser. After the email client opens, please attach the
                      file manually.
                    </div>
                  </div>

                  <div className="col-12 d-flex gap-2">
                    <button type="submit" className="btn btn-dark">
                      Send Email
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactMe;
