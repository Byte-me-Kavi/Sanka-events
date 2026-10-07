"use client";

import { useState } from "react";
import { contact, services } from "../content";

export default function Contact() {
  const [error, setError] = useState("");

  const compose = (form: HTMLFormElement) => {
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    if (!name || !phone) {
      setError("Add your name and a phone number so we can call you back.");
      return null;
    }
    setError("");
    const lines = [
      `Hi Sanka, I'm ${name}.`,
      `I'm planning: ${data.get("type")}`,
      data.get("date") ? `Date: ${data.get("date")}` : "",
      data.get("venue") ? `Venue: ${data.get("venue")}` : "",
      data.get("details") ? `Details: ${data.get("details")}` : "",
      `Call me on ${phone}.`,
    ];
    return lines.filter(Boolean).join("\n");
  };

  const sendWhatsApp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = compose(e.currentTarget);
    if (text) window.open(`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  const sendEmail = (e: React.MouseEvent<HTMLButtonElement>) => {
    const form = e.currentTarget.form;
    if (!form) return;
    const text = compose(form);
    if (text)
      window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent("Event enquiry")}&body=${encodeURIComponent(text)}`;
  };

  return (
    <section className="contact" id="contact" aria-labelledby="contact-title">
      <div className="contact-copy">
        <h2 id="contact-title">Bring the city to your event</h2>
        <p>
          The team behind Snehaye Nagaraya plans weddings, concerts and private events across Sri Lanka. Send the
          details and Sanka will call you back.
        </p>
        <dl className="contact-lines">
          <div>
            <dt>Phone and WhatsApp</dt>
            <dd>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a>
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </dd>
          </div>
        </dl>
      </div>

      <form className="contact-form" onSubmit={sendWhatsApp} noValidate>
        <div className="field">
          <label htmlFor="f-name">Your name</label>
          <input id="f-name" name="name" autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="f-phone">Phone</label>
          <input id="f-phone" name="phone" type="tel" autoComplete="tel" required />
        </div>
        <div className="field">
          <label htmlFor="f-type">What are you planning?</label>
          <select id="f-type" name="type" defaultValue={services[0].name}>
            {services.map((s) => (
              <option key={s.id}>{s.name}</option>
            ))}
            <option>Full event production</option>
          </select>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="f-date">Date</label>
            <input id="f-date" name="date" type="date" />
          </div>
          <div className="field">
            <label htmlFor="f-venue">Venue or town</label>
            <input id="f-venue" name="venue" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="f-details">Details</label>
          <textarea id="f-details" name="details" rows={3} placeholder="Guest count, timings, what you need from us" />
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="submit" className="btn btn--gold btn--lg">
            Send on WhatsApp
          </button>
          <button type="button" className="btn btn--ghost btn--lg" onClick={sendEmail}>
            Send by email
          </button>
        </div>
      </form>
    </section>
  );
}
