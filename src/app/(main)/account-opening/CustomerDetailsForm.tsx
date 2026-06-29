"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchCustomers } from "@/redux/slices/customersSlice";
import {
  updateFormField,
  setCustomerId,
  setCustomerLookupStatus,
  resetCustomerLookup,
} from "@/redux/slices/accountOpeningSlice";

const categories = ["General", "OBC", "SC", "ST", "EWS"];
const religions = [
  "Hindu",
  "Muslim",
  "Christian",
  "Sikh",
  "Buddhist",
  "Jain",
  "Other",
];
const educations = [
  "Below 10th",
  "10th Pass",
  "12th Pass",
  "Graduate",
  "Post Graduate",
  "Other",
];
const occupations = [
  "Business",
  "Service",
  "Farmer",
  "Student",
  "Housewife",
  "Self Employed",
  "Retired",
  "Other",
];
const proofOfIdentityOptions = [
  "Aadhaar Card",
  "Passport",
  "Voter's Identity Card",
  "Driving Licence",
  "NREGA Card",
  "PAN Card",
];
const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"];
const relationshipOptions = [
  "FATHER",
  "MOTHER",
  "SPOUSE",
  "SON",
  "DAUGHTER",
  "BROTHER",
  "SISTER",
  "OTHER",
];
const permanentAddressTypes = [
  "RESIDENTIAL/BUSINESS",
  "RESIDENTIAL",
  "BUSINESS",
  "REGISTERED OFFICE",
];
const currentAddressTypes = [
  "RESIDENTIAL/BUSINESS",
  "RESIDENTIAL",
  "BUSINESS",
  "REGISTERED OFFICE",
];
const proofOfAddressTypes = [
  "PROOF OF ADDRESS",
  "Aadhaar Card",
  "Passport",
  "Voter ID",
  "Driving Licence",
  "Utility Bill",
  "Bank Statement",
];
const designationOptions = [
  "DESIGNATION",
  "OFFICER",
  "CLERK",
  "MANAGER",
  "AGM",
  "DGM",
  "GM",
  "OTHER",
];
const printerTypeOptions = ["SELECT", "LASER", "DOT MATRIX", "INKJET"];
const PASSPORT_LIKE = ["Passport", "Driving Licence"];

type Customer = {
  id: number | string;
  full_name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  father_name?: string;
  mother_name?: string;
  dob?: string;
  gender?: string;
  mobile?: string | number;
  email?: string;
  address?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  district?: string;
  state?: string;
  pin?: string;
  country?: string;
  aadhaar?: string;
  pan?: string;
  occupation?: string;
  nominee_name?: string;
  nominee_relation?: string;
  nominee_dob?: string;
  nominee_mobile?: string;
  nominee_address?: string;
  nominee_age?: string;
  photo_url?: string;
  signature_url?: string;
  marital_status?: string;
  category?: string;
  religion?: string;
  education?: string;
  annual_income?: string;
  net_worth?: string;
};

const normalizeMobile = (v: string | number | null | undefined) =>
  v ? String(v).replace(/\D/g, "").slice(-10) : "";

export default function CustomerDetailsForm() {
  const dispatch = useAppDispatch();
  const formData = useAppSelector((s) => s.accountOpening.formData);
  const customerNotFound = useAppSelector(
    (s) => s.accountOpening.customerNotFound,
  );
  const customers = useAppSelector((s) => s.customers.list as Customer[]);
  const customersLoading = useAppSelector((s) => s.customers.loading);

  const [nominationOpen, setNominationOpen] = useState(true);
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [bankUseOpen, setBankUseOpen] = useState(true);

  useEffect(() => {
    if (!customers.length) dispatch(fetchCustomers({ page: 1, limit: 1000 }));
  }, [dispatch, customers.length]);

  const set = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K],
  ) => dispatch(updateFormField({ field, value }));

  const syncFullName = (first: string, middle: string, last: string) =>
    set("full_name", [first, middle, last].filter(Boolean).join(" "));

  // Father's & nominee's names are entered in three columns but stored as a
  // single combined string (the PDF splits it back into First/Middle/Last).
  const syncFatherName = (first: string, middle: string, last: string) =>
    set("father_name", [first, middle, last].filter(Boolean).join(" "));
  const syncNomineeName = (first: string, middle: string, last: string) =>
    set("nominee_name", [first, middle, last].filter(Boolean).join(" "));

  const fillCustomer = (c: Customer) => {
    dispatch(setCustomerId(c.id as number));
    const splitName = (v?: string) => {
      const parts = String(v ?? "").trim().split(/\s+/).filter(Boolean);
      return { first: parts[0] ?? "", middle: parts.length > 2 ? parts[1] : "", last: parts.length > 1 ? parts.slice(parts.length > 2 ? 2 : 1).join(" ") : "" };
    };
    const fatherParts = splitName(c.father_name);
    const nomineeParts = splitName(c.nominee_name);
    const fields: Partial<typeof formData> = {
      customer_id: c.id as number,
      full_name: c.full_name ?? "",
      first_name: c.first_name ?? "",
      middle_name: c.middle_name ?? "",
      last_name: c.last_name ?? "",
      father_name: c.father_name ?? "",
      father_first_name: fatherParts.first,
      father_middle_name: fatherParts.middle,
      father_last_name: fatherParts.last,
      mother_name: c.mother_name ?? "",
      dob: c.dob ?? "",
      gender: c.gender ?? "",
      mobile: normalizeMobile(c.mobile),
      email: c.email ?? "",
      address: c.address ?? "",
      address_line1: c.address_line1 ?? c.address ?? "",
      address_line2: c.address_line2 ?? "",
      city: c.city ?? "",
      district: c.district ?? "",
      state: c.state ?? "",
      pin: c.pin ?? "",
      country: c.country ?? "India",
      aadhaar: c.aadhaar ?? "",
      pan: c.pan ?? "",
      pan_available: c.pan ? "YES" : "NO",
      occupation: c.occupation ?? "",
      annual_income: c.annual_income ?? "",
      net_worth: c.net_worth ?? "",
      nominee_name: c.nominee_name ?? "",
      nominee_first_name: nomineeParts.first,
      nominee_middle_name: nomineeParts.middle,
      nominee_last_name: nomineeParts.last,
      nominee_relation: c.nominee_relation ?? "FATHER",
      nominee_dob: c.nominee_dob ?? "",
      nominee_mobile: c.nominee_mobile ?? "",
      nominee_address: c.nominee_address ?? "",
      nominee_age: c.nominee_age ?? "",
      photo_url: c.photo_url ?? "",
      signature_url: c.signature_url ?? "",
      marital_status: c.marital_status ?? "",
      category: c.category ?? "",
      religion: c.religion ?? "",
      education: c.education ?? "",
    };
    Object.entries(fields).forEach(([f, v]) =>
      dispatch(
        updateFormField({ field: f as keyof typeof formData, value: v as any }),
      ),
    );
    dispatch(setCustomerLookupStatus(false));
  };

  const handleMobileChange = (value: string) => {
    set("mobile", value.replace(/\D/g, "").slice(0, 10));
    dispatch(updateFormField({ field: "customer_id", value: null }));
    dispatch(resetCustomerLookup());
  };

  const handleMobileBlur = () => {
    const m = normalizeMobile(formData.mobile);
    if (m.length !== 10) {
      dispatch(setCustomerId(null));
      dispatch(setCustomerLookupStatus(true));
      return;
    }
    const matched = customers.find((c) => normalizeMobile(c.mobile) === m);
    if (matched) fillCustomer(matched);
    else {
      dispatch(setCustomerId(null));
      dispatch(updateFormField({ field: "customer_id", value: null }));
      dispatch(setCustomerLookupStatus(true));
    }
  };

 const handleImageChange = (
  e: ChangeEvent<HTMLInputElement>,
  field: "photo_url" | "signature_url",
) => {
  const file = e.target.files?.[0];
  if (!file || !file.type.startsWith("image/")) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    set(field, reader.result as string); // base64 data URI
  };
  reader.readAsDataURL(file);

  e.target.value = "";
};

  // Toggle: copy applicant address into nominee address, or clear sync flag
  const handleNomineeAddressSameToggle = (checked: boolean) => {
    set("nominee_address_same" as any, checked as any);
    if (checked) {
      set("nominee_address", formData.address);
    }
  };

  const showPassportDates = PASSPORT_LIKE.includes(formData.proof_of_identity);

  return (
    <>
      <style>{`
        .cdf-wrap {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding-bottom: 32px;
          font-family: 'Plus Jakarta Sans', 'DM Sans', sans-serif;
        }

        /* ── Section banners ── */
        .cdf-section-banner {
          width: 100%;
          background: #0d8f72;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          padding: 9px 14px;
          border-radius: 7px;
          margin-bottom: 14px;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }

        .cdf-toggle-banner {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--teal);
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          padding: 9px 14px;
          border-radius: 7px;
          margin-bottom: 14px;
          cursor: pointer;
          user-select: none;
          letter-spacing: 0.4px;
          border: none;
          text-align: left;
        }
        .cdf-toggle-banner:hover { opacity: 0.92; }

        .cdf-toggle-checkbox {
          width: 16px;
          height: 16px;
          accent-color: var(--teal);
          cursor: pointer;
          flex-shrink: 0;
        }

        .cdf-sub-heading {
          text-align: center;
          font-size: 11px;
          font-weight: 700;
          color: #0d8f72;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0 0 12px;
        }

        .cdf-divider {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 18px 0;
        }

        /* ── Grids ── */
        .cdf-grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .cdf-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .cdf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .cdf-grid-2-sm { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; max-width: 340px; }
        .cdf-grid-1 { display: grid; grid-template-columns: 1fr; gap: 14px; margin-bottom: 14px; max-width: 280px; }

        /* ── Form fields ── */
        .cdf-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .cdf-label {
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .cdf-label .req { color: #dc2626; margin-left: 2px; }

        .cdf-input,
        .cdf-select {
          padding: 9px 11px;
          border: 1.5px solid #d1d5db;
          border-radius: 8px;
          font-size: 13px;
          font-family: 'Plus Jakarta Sans', 'DM Sans', sans-serif;
          color: #111827;
          background: #ffffff;
          outline: none;
          width: 100%;
          transition: border-color 0.15s, box-shadow 0.15s;
          -webkit-appearance: none;
          appearance: none;
        }
        .cdf-input:focus,
        .cdf-select:focus {
          border-color: #0d8f72;
          box-shadow: 0 0 0 3px rgba(13,143,114,0.1);
        }
        .cdf-input.error {
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgba(220,38,38,0.1);
        }
        .cdf-input[readonly],
        .cdf-input:read-only {
          background: #f9fafb;
          color: #6b7280;
          cursor: default;
        }
        .cdf-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          padding-right: 30px;
        }

        .cdf-hint { font-size: 11px; color: #6b7280; margin-top: 2px; }
        .cdf-error { font-size: 11px; font-weight: 600; color: #dc2626; margin-top: 2px; }

        /* ── Service checkboxes ── */
        .cdf-service-label {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1.5px solid #d1d5db;
          border-radius: 8px;
          padding: 11px 14px;
          cursor: pointer;
          background: #ffffff;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: border-color 0.15s;
        }
        .cdf-service-label:hover {
          border-color: var(--teal);
          background: var(--teal-light);
        }
        .cdf-service-checkbox {
          width: 15px;
          height: 15px;
          accent-color: var(--teal);
        }

        /* ── Inline checkbox label (e.g. nominee address same) ── */
        .cdf-inline-check-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          height: 100%;
          padding-top: 18px;
        }
        .cdf-inline-checkbox {
          width: 15px;
          height: 15px;
          accent-color: var(--teal);
          cursor: pointer;
        }

        /* ── Image preview ── */
        .cdf-img-preview {
          margin-top: 8px;
          height: 88px;
          width: 88px;
          border-radius: 8px;
          border: 2px solid #b2e4d8;
          object-fit: cover;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
      `}</style>

      <div className="cdf-wrap">
        {/* ── PERSONAL DETAILS ── */}
        <div className="cdf-section-banner">Personal Details</div>

        <div className="cdf-grid-4">
          <div className="cdf-group">
            <label className="cdf-label">
              First Name <span className="req">*</span>
            </label>
            <input
              className="cdf-input"
              value={formData.first_name}
              onChange={(e) => {
                set("first_name", e.target.value);
                syncFullName(
                  e.target.value,
                  formData.middle_name,
                  formData.last_name,
                );
              }}
            />
          </div>
          <div className="cdf-group">
            <label className="cdf-label">Middle Name</label>
            <input
              className="cdf-input"
              value={formData.middle_name}
              onChange={(e) => {
                set("middle_name", e.target.value);
                syncFullName(
                  formData.first_name,
                  e.target.value,
                  formData.last_name,
                );
              }}
            />
          </div>
          <div className="cdf-group">
            <label className="cdf-label">
              Last Name <span className="req">*</span>
            </label>
            <input
              className="cdf-input"
              value={formData.last_name}
              onChange={(e) => {
                set("last_name", e.target.value);
                syncFullName(
                  formData.first_name,
                  formData.middle_name,
                  e.target.value,
                );
              }}
            />
          </div>
          <div className="cdf-group">
            <label className="cdf-label">Marital Status</label>
            <select
              className="cdf-select"
              value={formData.marital_status}
              onChange={(e) => set("marital_status", e.target.value)}
            >
              <option value="">SELECT</option>
              {maritalStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="cdf-grid-4">
          <div className="cdf-group">
            <label className="cdf-label">
              Father First Name <span className="req">*</span>
            </label>
            <input
              className="cdf-input"
              value={formData.father_first_name}
              onChange={(e) => {
                set("father_first_name", e.target.value);
                syncFatherName(e.target.value, formData.father_middle_name, formData.father_last_name);
              }}
            />
          </div>
          <div className="cdf-group">
            <label className="cdf-label">Father Middle Name</label>
            <input
              className="cdf-input"
              value={formData.father_middle_name}
              onChange={(e) => {
                set("father_middle_name", e.target.value);
                syncFatherName(formData.father_first_name, e.target.value, formData.father_last_name);
              }}
            />
          </div>
          <div className="cdf-group">
            <label className="cdf-label">Father Last Name</label>
            <input
              className="cdf-input"
              value={formData.father_last_name}
              onChange={(e) => {
                set("father_last_name", e.target.value);
                syncFatherName(formData.father_first_name, formData.father_middle_name, e.target.value);
              }}
            />
          </div>
          <div className="cdf-group">
            <label className="cdf-label">Mother Name</label>
            <input
              className="cdf-input"
              value={formData.mother_name}
              onChange={(e) => set("mother_name", e.target.value)}
            />
          </div>
        </div>

        <div className="cdf-grid-4">
          <div className="cdf-group">
            <label className="cdf-label">
              Date of Birth <span className="req">*</span>
            </label>
            <input
              type="date"
              className="cdf-input"
              value={formData.dob}
              onChange={(e) => set("dob", e.target.value)}
            />
          </div>
          <div className="cdf-group">
            <label className="cdf-label">
              Gender <span className="req">*</span>
            </label>
            <select
              className="cdf-select"
              value={formData.gender}
              onChange={(e) => set("gender", e.target.value)}
            >
              <option value="">SELECT</option>
              <option value="Male">MALE</option>
              <option value="Female">FEMALE</option>
              <option value="Other">OTHER</option>
            </select>
          </div>
          <div className="cdf-group">
            <label className="cdf-label">Category</label>
            <select
              className="cdf-select"
              value={formData.category}
              onChange={(e) => set("category", e.target.value)}
            >
              <option value="">SELECT</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="cdf-group">
            <label className="cdf-label">Religion</label>
            <select
              className="cdf-select"
              value={formData.religion}
              onChange={(e) => set("religion", e.target.value)}
            >
              <option value="">SELECT</option>
              {religions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="cdf-grid-4">
          <div className="cdf-group">
            <label className="cdf-label">Education</label>
            <select
              className="cdf-select"
              value={formData.education}
              onChange={(e) => set("education", e.target.value)}
            >
              <option value="">SELECT</option>
              {educations.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <div className="cdf-group">
            <label className="cdf-label">Occupation</label>
            <select
              className="cdf-select"
              value={formData.occupation}
              onChange={(e) => set("occupation", e.target.value)}
            >
              <option value="">SELECT</option>
              {occupations.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div className="cdf-group">
            <label className="cdf-label">Annual Income</label>
            <input
              className="cdf-input"
              value={formData.annual_income}
              onChange={(e) => set("annual_income", e.target.value)}
            />
          </div>
          <div className="cdf-group">
            <label className="cdf-label">Net Worth</label>
            <input
              className="cdf-input"
              value={formData.net_worth}
              onChange={(e) => set("net_worth", e.target.value)}
            />
          </div>
        </div>

        <div className="cdf-grid-2">
          <div className="cdf-group">
            <label className="cdf-label">Email Address (Optional)</label>
            <input
              type="email"
              className="cdf-input"
              value={formData.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div className="cdf-group">
            <label className="cdf-label">
              Mobile Number <span className="req">*</span>
            </label>
            <input
              type="tel"
              maxLength={10}
              className="cdf-input"
              value={formData.mobile}
              onChange={(e) => handleMobileChange(e.target.value)}
              onBlur={handleMobileBlur}
            />
            {customerNotFound && (
              <p className="cdf-hint" style={{ color: "#b45309" }}>
                New customer — they'll be registered automatically when you
                submit this form.
              </p>
            )}
            {customersLoading && <p className="cdf-hint">Loading customers…</p>}
          </div>
        </div>

        <hr className="cdf-divider" />

        {/* ── IDENTITY DETAILS ── */}
        <div className="cdf-section-banner">Identity Details</div>

        <div className="cdf-grid-3">
          <div className="cdf-group">
            <label className="cdf-label">Do you have PAN Card</label>
            <select
              className="cdf-select"
              value={formData.pan_available}
              onChange={(e) => {
                set("pan_available", e.target.value);
                if (e.target.value === "NO") set("pan", "");
              }}
            >
              <option value="NO">NO</option>
              <option value="YES">YES</option>
            </select>
          </div>
          <div className="cdf-group">
            <label className="cdf-label">Proof of Identity</label>
            <select
              className="cdf-select"
              value={formData.proof_of_identity}
              onChange={(e) => {
                set("proof_of_identity", e.target.value);
                if (!PASSPORT_LIKE.includes(e.target.value)) {
                  set("issue_date" as any, "");
                  set("expiry_date" as any, "");
                }
              }}
            >
              <option value="">SELECT</option>
              {proofOfIdentityOptions.map((p) => (
                <option key={p} value={p}>
                  {p.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="cdf-group">
            <label className="cdf-label">
              Document No. <span className="req">*</span>
            </label>
            <input
              className="cdf-input"
              value={formData.document_no}
              onChange={(e) => set("document_no", e.target.value)}
            />
          </div>
        </div>

        {showPassportDates && (
          <div className="cdf-grid-2">
            <div className="cdf-group">
              <label className="cdf-label">Issue Date</label>
              <input
                type="date"
                className="cdf-input"
                value={(formData as any).issue_date ?? ""}
                onChange={(e) => set("issue_date" as any, e.target.value)}
              />
            </div>
            <div className="cdf-group">
              <label className="cdf-label">Expiry Date</label>
              <input
                type="date"
                className="cdf-input"
                value={(formData as any).expiry_date ?? ""}
                onChange={(e) => set("expiry_date" as any, e.target.value)}
              />
            </div>
          </div>
        )}

        {formData.pan_available === "YES" ? (
          <div className="cdf-grid-2">
            <div className="cdf-group">
              <label className="cdf-label">PAN Number</label>
              <input
                className="cdf-input"
                value={formData.pan}
                maxLength={10}
                onChange={(e) => set("pan", e.target.value.toUpperCase())}
              />
            </div>
            <div className="cdf-group">
              <label className="cdf-label">Aadhaar Number</label>
              <input
                className="cdf-input"
                value={formData.aadhaar}
                maxLength={12}
                onChange={(e) =>
                  set("aadhaar", e.target.value.replace(/\D/g, "").slice(0, 12))
                }
              />
            </div>
          </div>
        ) : (
          <div className="cdf-grid-1">
            <div className="cdf-group">
              <label className="cdf-label">Aadhaar Number</label>
              <input
                className="cdf-input"
                value={formData.aadhaar}
                maxLength={12}
                onChange={(e) =>
                  set("aadhaar", e.target.value.replace(/\D/g, "").slice(0, 12))
                }
              />
            </div>
          </div>
        )}

        <hr className="cdf-divider" />

        {/* ── ADDRESS ── */}
        <button
          type="button"
          className="cdf-toggle-banner"
          onClick={() => set("same_address", !formData.same_address)}
        >
          <input
            type="checkbox"
            checked={formData.same_address}
            onChange={() => {}}
            className="cdf-toggle-checkbox"
            onClick={(e) => e.stopPropagation()}
          />
          Are Permanent Address &amp; Current Address same?
        </button>

        <p className="cdf-sub-heading">Permanent Address</p>

        <div className="cdf-grid-4">
          <div className="cdf-group">
            <label className="cdf-label">
              Address Line 1 <span className="req">*</span>
            </label>
            <input
              className="cdf-input"
              value={formData.address_line1}
              onChange={(e) => {
                set("address_line1", e.target.value);
                set(
                  "address",
                  [e.target.value, formData.address_line2]
                    .filter(Boolean)
                    .join(", "),
                );
              }}
            />
          </div>
          <div className="cdf-group">
            <label className="cdf-label">Address Line 2</label>
            <input
              className="cdf-input"
              value={formData.address_line2}
              onChange={(e) => {
                set("address_line2", e.target.value);
                set(
                  "address",
                  [formData.address_line1, e.target.value]
                    .filter(Boolean)
                    .join(", "),
                );
              }}
            />
          </div>
          <div className="cdf-group">
            <label className="cdf-label">City / Village</label>
            <input
              className="cdf-input"
              value={formData.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </div>
          <div className="cdf-group">
            <label className="cdf-label">Pincode</label>
            <input
              className="cdf-input"
              value={formData.pin}
              maxLength={6}
              onChange={(e) =>
                set("pin", e.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
          </div>
        </div>

        <div className="cdf-grid-3">
          <div className="cdf-group">
            <label className="cdf-label">District</label>
            <input
              className="cdf-input"
              value={formData.district}
              onChange={(e) => set("district", e.target.value)}
            />
          </div>
          <div className="cdf-group">
            <label className="cdf-label">State</label>
            <input
              className="cdf-input"
              value={formData.state}
              onChange={(e) => set("state", e.target.value)}
            />
          </div>
          <div className="cdf-group">
            <label className="cdf-label">Country</label>
            <input
              className="cdf-input"
              value={formData.country}
              onChange={(e) => set("country", e.target.value)}
            />
          </div>
        </div>

        {/* Current Address */}
        {!formData.same_address && (
          <>
            <p className="cdf-sub-heading">Current Address</p>
            <div className="cdf-grid-4">
              <div className="cdf-group">
                <label className="cdf-label">Address Type</label>
                <select
                  className="cdf-select"
                  value={
                    (formData as any).current_address_type ??
                    "RESIDENTIAL/BUSINESS"
                  }
                  onChange={(e) =>
                    set("current_address_type" as any, e.target.value)
                  }
                >
                  {currentAddressTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Address Line 1</label>
                <input
                  className="cdf-input"
                  value={(formData as any).current_address_line1 ?? ""}
                  onChange={(e) =>
                    set("current_address_line1" as any, e.target.value)
                  }
                />
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Address Line 2</label>
                <input
                  className="cdf-input"
                  value={(formData as any).current_address_line2 ?? ""}
                  onChange={(e) =>
                    set("current_address_line2" as any, e.target.value)
                  }
                />
              </div>
              <div className="cdf-group">
                <label className="cdf-label">City / Village</label>
                <input
                  className="cdf-input"
                  value={(formData as any).current_city ?? ""}
                  onChange={(e) => set("current_city" as any, e.target.value)}
                />
              </div>
            </div>
            <div className="cdf-grid-4">
              <div className="cdf-group">
                <label className="cdf-label">Pincode</label>
                <input
                  className="cdf-input"
                  value={(formData as any).current_pin ?? ""}
                  maxLength={6}
                  onChange={(e) =>
                    set(
                      "current_pin" as any,
                      e.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                />
              </div>
              <div className="cdf-group">
                <label className="cdf-label">District</label>
                <input
                  className="cdf-input"
                  value={(formData as any).current_district ?? ""}
                  onChange={(e) =>
                    set("current_district" as any, e.target.value)
                  }
                />
              </div>
              <div className="cdf-group">
                <label className="cdf-label">State</label>
                <input
                  className="cdf-input"
                  value={(formData as any).current_state ?? ""}
                  onChange={(e) => set("current_state" as any, e.target.value)}
                />
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Country</label>
                <input
                  className="cdf-input"
                  value={(formData as any).current_country ?? ""}
                  onChange={(e) =>
                    set("current_country" as any, e.target.value)
                  }
                />
              </div>
            </div>
            <p className="cdf-sub-heading">Proof of Current Address</p>
            <div className="cdf-grid-3">
              <div className="cdf-group">
                <label className="cdf-label">Address Type</label>
                <select
                  className="cdf-select"
                  value={
                    (formData as any).proof_of_address_type ??
                    "PROOF OF ADDRESS"
                  }
                  onChange={(e) =>
                    set("proof_of_address_type" as any, e.target.value)
                  }
                >
                  {proofOfAddressTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Document Number</label>
                <input
                  className="cdf-input"
                  value={(formData as any).proof_of_address_doc_no ?? ""}
                  onChange={(e) =>
                    set("proof_of_address_doc_no" as any, e.target.value)
                  }
                />
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Date</label>
                <input
                  type="date"
                  className="cdf-input"
                  value={(formData as any).proof_of_address_date ?? ""}
                  onChange={(e) =>
                    set("proof_of_address_date" as any, e.target.value)
                  }
                />
              </div>
            </div>
          </>
        )}

        <hr className="cdf-divider" />

        {/* ── NOMINATION ── */}
        <button
          type="button"
          className="cdf-toggle-banner"
          onClick={() => setNominationOpen((v) => !v)}
        >
          <input
            type="checkbox"
            checked={nominationOpen}
            onChange={() => {}}
            className="cdf-toggle-checkbox"
            onClick={(e) => e.stopPropagation()}
          />
          Nomination Required
        </button>

        {nominationOpen && (
          <>
            <div className="cdf-grid-3">
              <div className="cdf-group">
                <label className="cdf-label">Nominee First Name</label>
                <input
                  className="cdf-input"
                  value={formData.nominee_first_name}
                  onChange={(e) => {
                    set("nominee_first_name", e.target.value);
                    syncNomineeName(e.target.value, formData.nominee_middle_name, formData.nominee_last_name);
                  }}
                />
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Nominee Middle Name</label>
                <input
                  className="cdf-input"
                  value={formData.nominee_middle_name}
                  onChange={(e) => {
                    set("nominee_middle_name", e.target.value);
                    syncNomineeName(formData.nominee_first_name, e.target.value, formData.nominee_last_name);
                  }}
                />
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Nominee Last Name</label>
                <input
                  className="cdf-input"
                  value={formData.nominee_last_name}
                  onChange={(e) => {
                    set("nominee_last_name", e.target.value);
                    syncNomineeName(formData.nominee_first_name, formData.nominee_middle_name, e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="cdf-grid-3">
              <div className="cdf-group">
                <label className="cdf-label">Mobile Number</label>
                <input
                  className="cdf-input"
                  value={formData.nominee_mobile}
                  maxLength={10}
                  onChange={(e) =>
                    set(
                      "nominee_mobile",
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                />
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Relationship</label>
                <select
                  className="cdf-select"
                  value={formData.nominee_relation}
                  onChange={(e) => set("nominee_relation", e.target.value)}
                >
                  {relationshipOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Nominee Address</label>
                <input
                  className="cdf-input"
                  value={formData.nominee_address}
                  readOnly={!!formData.nominee_address_same}
                  onChange={(e) => set("nominee_address", e.target.value)}
                />
              </div>
            </div>

            {/* Same as Applicant Address checkbox */}
            <div className="cdf-grid-1">
              <label className="cdf-inline-check-label" style={{ paddingTop: 0 }}>
                <input
                  type="checkbox"
                  checked={!!formData.nominee_address_same}
                  onChange={(e) =>
                    handleNomineeAddressSameToggle(e.target.checked)
                  }
                  className="cdf-inline-checkbox"
                />
                Nominee address same as Applicant address
              </label>
            </div>

            <div className="cdf-grid-2-sm">
              <div className="cdf-group">
                <label className="cdf-label">Nominee Age</label>
                <input
                  className="cdf-input"
                  value={formData.nominee_age}
                  maxLength={3}
                  onChange={(e) =>
                    set(
                      "nominee_age",
                      e.target.value.replace(/\D/g, "").slice(0, 3),
                    )
                  }
                />
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Nominee DOB</label>
                <input
                  type="date"
                  className="cdf-input"
                  value={formData.nominee_dob ?? ""}
                  onChange={(e) => set("nominee_dob", e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        <hr className="cdf-divider" />

        {/* ── OPTIONAL DETAILS ── */}
        <button
          type="button"
          className="cdf-toggle-banner"
          onClick={() => setOptionalOpen((v) => !v)}
        >
          <input
            type="checkbox"
            checked={optionalOpen}
            onChange={() => {}}
            className="cdf-toggle-checkbox"
            onClick={(e) => e.stopPropagation()}
          />
          Optional Details
        </button>

        {optionalOpen && (
          <>
            <div className="cdf-grid-4">
              <div className="cdf-group">
                <label className="cdf-label">CKYC Number</label>
                <input
                  className="cdf-input"
                  value={formData.ckyc_number}
                  onChange={(e) => set("ckyc_number", e.target.value)}
                />
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Date</label>
                <input
                  type="date"
                  className="cdf-input"
                  value={formData.date}
                  onChange={(e) => set("date", e.target.value)}
                />
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Account Type</label>
                <input
                  className="cdf-input"
                  value={formData.account_type}
                  readOnly
                />
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Permanent Address Type</label>
                <select
                  className="cdf-select"
                  value={formData.permanent_address_type}
                  onChange={(e) =>
                    set("permanent_address_type", e.target.value)
                  }
                >
                  {permanentAddressTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="cdf-grid-4">
              <div className="cdf-group">
                <label className="cdf-label">Nationality</label>
                <select
                  className="cdf-select"
                  value={formData.nationality}
                  onChange={(e) => set("nationality", e.target.value)}
                >
                  <option value="INDIAN">INDIAN</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Person with Disability</label>
                <select
                  className="cdf-select"
                  value={formData.person_with_disability}
                  onChange={(e) =>
                    set("person_with_disability", e.target.value)
                  }
                >
                  <option value="NO">NO</option>
                  <option value="YES">YES</option>
                </select>
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Tax Residency India Only</label>
                <select
                  className="cdf-select"
                  value={formData.tax_residency_india_only}
                  onChange={(e) =>
                    set("tax_residency_india_only", e.target.value)
                  }
                >
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </select>
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Politically Exposed</label>
                <select
                  className="cdf-select"
                  value={formData.politically_exposed}
                  onChange={(e) => set("politically_exposed", e.target.value)}
                >
                  <option value="NONE">NONE</option>
                  <option value="POLITICALLY EXPOSED">
                    POLITICALLY EXPOSED
                  </option>
                  <option value="RELATED TO POLITICALLY EXPOSED">
                    RELATED TO POLITICALLY EXPOSED
                  </option>
                </select>
              </div>
            </div>

            <div className="cdf-grid-2">
              <div className="cdf-group">
                <label className="cdf-label">Printer Type</label>
                <select
                  className="cdf-select"
                  value={formData.printer_type}
                  onChange={(e) => set("printer_type", e.target.value)}
                >
                  {printerTypeOptions.map((p) => (
                    <option key={p} value={p === "SELECT" ? "" : p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Place of Birth</label>
                <input
                  className="cdf-input"
                  value={formData.place_of_birth}
                  onChange={(e) => set("place_of_birth", e.target.value)}
                />
              </div>
            </div>

            <p className="cdf-sub-heading" style={{ marginTop: 8 }}>
              Service Required
            </p>
            <div className="cdf-grid-2">
              <label className="cdf-service-label">
                <input
                  type="checkbox"
                  checked={formData.cheque_book}
                  onChange={(e) => set("cheque_book", e.target.checked)}
                  className="cdf-service-checkbox"
                />
                Cheque Book
              </label>
              <label className="cdf-service-label">
                <input
                  type="checkbox"
                  checked={formData.atm_card_required}
                  onChange={(e) => set("atm_card_required", e.target.checked)}
                  className="cdf-service-checkbox"
                />
                ATM Card Required
              </label>
            </div>
          </>
        )}

        <hr className="cdf-divider" />

        {/* ── BANK USE ── */}
        <button
          type="button"
          className="cdf-toggle-banner"
          onClick={() => setBankUseOpen((v) => !v)}
        >
          <input
            type="checkbox"
            checked={bankUseOpen}
            onChange={() => {}}
            className="cdf-toggle-checkbox"
            onClick={(e) => e.stopPropagation()}
          />
          Bank Use
        </button>

        {bankUseOpen && (
          <>
            <div className="cdf-grid-4">
              <div className="cdf-group">
                <label className="cdf-label">Customer ID / CIF</label>
                <input
                  className="cdf-input"
                  placeholder="Bank customer / CIF number"
                  value={formData.cif}
                  onChange={(e) => set("cif", e.target.value)}
                />
              </div>
            </div>

            <div className="cdf-grid-4">
              <div className="cdf-group">
                <label className="cdf-label">Branch Code</label>
                <input
                  className="cdf-input"
                  value={formData.branch_code}
                  onChange={(e) => set("branch_code", e.target.value)}
                />
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Official Name</label>
                <input
                  className="cdf-input"
                  value={formData.official_name}
                  onChange={(e) => set("official_name", e.target.value)}
                />
              </div>
              <div className="cdf-group">
                <label className="cdf-label">PF Number</label>
                <input
                  className="cdf-input"
                  value={formData.pf_number}
                  onChange={(e) => set("pf_number", e.target.value)}
                />
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Designation</label>
                <select
                  className="cdf-select"
                  value={formData.designation}
                  onChange={(e) => set("designation", e.target.value)}
                >
                  {designationOptions.map((d) => (
                    <option key={d} value={d === "DESIGNATION" ? "" : d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="cdf-grid-2">
              <div className="cdf-group">
                <label className="cdf-label">Account Number</label>
                <input
                  className="cdf-input"
                  value={formData.account_number}
                  onChange={(e) => set("account_number", e.target.value)}
                />
              </div>
              <div className="cdf-group">
                <label className="cdf-label">Place</label>
                <input
                  className="cdf-input"
                  value={formData.place}
                  onChange={(e) => set("place", e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        <hr className="cdf-divider" />

        {/* ── PHOTO & SIGNATURE ── */}
        <div className="cdf-section-banner">Photo &amp; Signature</div>

        <div className="cdf-grid-2">
          <div className="cdf-group">
            <label className="cdf-label">Photo</label>
            <input
              type="file"
              accept="image/*"
              className="cdf-input"
              onChange={(e) => handleImageChange(e, "photo_url")}
            />
            {formData.photo_url && (
              <img
                src={formData.photo_url}
                alt="Photo"
                className="cdf-img-preview"
              />
            )}
          </div>
          <div className="cdf-group">
            <label className="cdf-label">Signature</label>
            <input
              type="file"
              accept="image/*"
              className="cdf-input"
              onChange={(e) => handleImageChange(e, "signature_url")}
            />
            {formData.signature_url && (
              <img
                src={formData.signature_url}
                alt="Signature"
                className="cdf-img-preview"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}