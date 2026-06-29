'use client';

import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import TabBar from './TopBar';
import BankSelector from './BankSelector';
import AccountTypeSelector from './AccountTypeSelector';
import CustomerDetailsForm from './CustomerDetailsForm';
import PrintOptions from './PrintOption';
import FormHistory from './FormHistory';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  createApplication,
  downloadApplicationPdf,
  resetSubmitState,
  setActiveTab,
  setCustomerId,
  setCustomerLookupStatus,
  setSelectedBank,
  setSelectedType,
  setStep,
  updateFormField,
} from '@/redux/slices/accountOpeningSlice';
import { createCustomer } from '@/redux/slices/customersSlice';
import { fetchWalletBalance } from '@/redux/slices/walletSlice';

// account_type values accepted by the customers table enum. The form's
// "minor" option is intentionally excluded so we fall back to the DB default
// rather than triggering an invalid-enum error during inline registration.
const CUSTOMER_ACCOUNT_TYPES = ['savings', 'current', 'jan_dhan', 'recurring', 'fixed'];

export default function AccountFormPage() {
  const dispatch = useAppDispatch();

  const {
    activeTab,
    step,
    selectedBank,
    selectedType,
    formData,
    history,
    customerNotFound,
    submitLoading,
    submitError,
    submitSuccess,
    previewLoading,
    previewError,
    pdfLoading,
    pdfError,
  } = useAppSelector((state) => state.accountOpening);

  const customerCreating = useAppSelector((state) => state.customers.creating);

  useEffect(() => {
    if (submitSuccess) {
      toast.success(submitSuccess);
      dispatch(resetSubmitState());
    }
  }, [submitSuccess, dispatch]);

  useEffect(() => {
    if (submitError) {
      toast.error(submitError);
      dispatch(resetSubmitState());
    }
  }, [submitError, dispatch]);

  useEffect(() => {
    if (previewError) {
      toast.error(previewError);
      dispatch(resetSubmitState());
    }
  }, [previewError, dispatch]);

  useEffect(() => {
    if (pdfError) {
      toast.error(pdfError);
      dispatch(resetSubmitState());
    }
  }, [pdfError, dispatch]);

  const validateForm = () => {
    if (!selectedBank) return 'Bank is required';
    if (!selectedType) return 'Account type is required';
    if (!formData.full_name.trim()) return 'Full name is required';
    if (!formData.father_name.trim()) return 'Father / Husband name is required';
    if (!formData.dob) return 'Date of birth is required';
    if (!formData.gender) return 'Gender is required';
    if (!formData.mobile.trim()) return 'Mobile number is required';
    if (!formData.address.trim()) return 'Address is required';
    if (!formData.city.trim()) return 'City is required';
    if (!formData.state.trim()) return 'State is required';
    if (!formData.pin.trim()) return 'PIN code is required';
    if (!formData.aadhaar.trim()) return 'Aadhaar is required';
    if (!formData.nominee_name.trim()) return 'Nominee name is required';
    if (!formData.nominee_relation.trim()) return 'Nominee relation is required';
    return null;
  };

  // A missing customer no longer blocks the form — when there is no matched
  // customer we register one inline on submit (see handleGenerate).
  const isGenerating =
    previewLoading || submitLoading || customerCreating || pdfLoading;

  const handleNextStep = () => {
    if (!selectedBank) {
      toast.error('Please select a bank');
      return;
    }

    if (!selectedType) {
      toast.error('Please select account type');
      return;
    }

    dispatch(setStep(2));
  };

  const buildCustomerPayload = () => ({
    name: formData.full_name.trim(),
    mobile: formData.mobile.trim(),
    account_number: formData.account_number.trim() || undefined,
    account_type: CUSTOMER_ACCOUNT_TYPES.includes(formData.account_type)
      ? formData.account_type
      : undefined,
    bank_id: formData.bank_id ?? undefined,
    branch_id: formData.branch_id ?? undefined,
    // DB CHECK constraints require exactly 12 / 6 digits; omit otherwise so the
    // customer still saves and the full value is captured on the application.
    aadhar_number: /^\d{12}$/.test(formData.aadhaar) ? formData.aadhaar : undefined,
    pin_code: /^\d{6}$/.test(formData.pin) ? formData.pin : undefined,
    address: formData.address.trim() || undefined,
    opening_balance: 0,
  });

  // Single-shot flow: register the customer if new → save the application →
  // generate & download the PDF → surface the wallet movement as toasts.
  const handleGenerate = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      let customerId = formData.customer_id;

      // No matched customer → register one inline before saving the application.
      if (!customerId) {
        const result = await dispatch(
          createCustomer(buildCustomerPayload())
        ).unwrap();
        customerId = result.data.id;
        dispatch(setCustomerId(customerId));
        dispatch(updateFormField({ field: 'customer_id', value: customerId }));
        dispatch(setCustomerLookupStatus(false));
        toast.success('New customer registered');
      }

      const appRes = await dispatch(
        createApplication({ ...formData, customer_id: customerId })
      ).unwrap();

      const applicationId = appRes?.data?.id ?? history?.[0]?.id;
      if (!applicationId) {
        toast.error('Application could not be saved. Please try again.');
        return;
      }

      const result = await dispatch(
        downloadApplicationPdf(applicationId)
      ).unwrap();

      // Notify the user of exactly what happened to their wallet.
      toast.success(`PDF generated & printed for ₹${result.charge}`);
      if (result.balance !== null) {
        toast(`₹${result.charge} deducted • Wallet balance: ₹${result.balance}`, {
          icon: '💸',
        });
      }

      // Refresh the wallet widget elsewhere in the app.
      dispatch(fetchWalletBalance());
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Failed to generate PDF');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-extrabold tracking-[-0.5px] text-gray-900">
          📋 Account Opening Form
        </h1>
        <p className="mt-1 text-[13px] text-gray-400">
          Fill bank account opening form details and print pre-filled PDF
        </p>
      </div>

      <TabBar
        activeTab={activeTab}
        onChange={(tab) => dispatch(setActiveTab(tab))}
      />

      {activeTab === 'new' && (
        <div>
          {step === 1 && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-5 py-4">
                <h3 className="text-[14px] font-bold text-gray-800">
                  🏦 Step 1 — Select Bank & Form Type
                </h3>
              </div>

              <div className="p-5">
                <BankSelector
                  selected={selectedBank}
                  onSelect={(payload) =>
                    dispatch(
                      setSelectedBank({
                        bankName: payload.bankName,
                        bankId: payload.bankId,
                      })
                    )
                  }
                />

                <AccountTypeSelector
                  selected={selectedType}
                  onSelect={(payload) => dispatch(setSelectedType(payload))}
                />

                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleNextStep}
                    className="rounded-lg bg-teal-600 px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-teal-700"
                  >
                    Next: Fill Details →
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="items-start gap-5">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <h3 className="text-[14px] font-bold text-gray-800">
                      👤 Customer / Applicant Details
                    </h3>
                  </div>

                  <div className="p-5">
                    <CustomerDetailsForm />
                  </div>
                </div>

                <PrintOptions
                  includePassbook={formData.include_passbook}
                  onToggle={(value) =>
                    dispatch(
                      updateFormField({
                        field: 'include_passbook',
                        value,
                      })
                    )
                  }
                />

                <div className="flex flex-wrap justify-between gap-3">
                  <button
                    onClick={() => dispatch(setStep(1))}
                    className="rounded-lg border-[1.5px] border-gray-300 px-5 py-2.5 text-[13px] font-bold text-gray-600 transition-all hover:bg-gray-50"
                  >
                    ← Back to Bank Selection
                  </button>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="rounded-lg bg-teal-600 px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {customerCreating
                      ? 'Registering customer...'
                      : submitLoading
                        ? 'Saving form...'
                        : pdfLoading
                          ? 'Generating PDF...'
                          : customerNotFound || !formData.customer_id
                            ? '🖨️ Register & Generate PDF'
                            : '🖨️ Generate & Print PDF'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && <FormHistory />}
    </div>
  );
}