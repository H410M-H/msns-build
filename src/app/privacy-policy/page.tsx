import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | MSNS LMS",
  description: "Privacy Policy for M.S. Naz High School Learning Management System",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#020806] text-slate-100 px-6 py-12 md:px-24 max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-emerald-400 mb-6">
        Privacy Policy
      </h1>
      <p className="text-sm text-slate-400 mb-8">
        Last updated: August 6, 2026
      </p>

      <div className="space-y-6 text-slate-300 leading-relaxed text-base">
        <section>
          <h2 className="text-xl font-semibold text-white mb-2">1. Overview</h2>
          <p>
            M.S. Naz High School ("MSNS LMS", "we", "us", or "our") operates the
            MSNS Learning Management System mobile application and web portal.
            This page informs users of our policies regarding the collection, use,
            and disclosure of Personal Information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">
            2. Information Collection and Use
          </h2>
          <p>
            For a better experience while using our Service, we may require you to
            provide us with certain personally identifiable information, including
            but not limited to student name, roll number, email address, attendance
            records, grades, and academic assignments.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">3. Data Security</h2>
          <p>
            We value your trust in providing us your Personal Information, thus we
            are striving to use commercially acceptable means of protecting it. All
            data transmitted between the app and our servers is encrypted over HTTPS (SSL).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">4. Third-Party Services</h2>
          <p>
            The application may utilize secure cloud infrastructure (such as Google Cloud
            Storage and Database hosting) solely for storing school documents, photos,
            and PDF grade sheets.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">5. User Account & Data Deletion</h2>
          <p>
            Students and guardians can request account deletion or data modification by
            contacting the school administration office directly or emailing us at
            support@msns-lms.com.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">6. Contact Us</h2>
          <p>
            If you have any questions or suggestions about our Privacy Policy, do not hesitate
            to contact M.S. Naz High School administration.
          </p>
        </section>
      </div>
    </div>
  );
}
