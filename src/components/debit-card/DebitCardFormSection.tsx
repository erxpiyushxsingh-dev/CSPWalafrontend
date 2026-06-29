'use client'
import React from 'react'
import { ArrowRight, ArrowLeft, CreditCard } from 'lucide-react'

interface DebitCardFormData {
  branchName: string
  place: string
  accountNumber: string
  cardRequestType: string
  cardType: string
  nameOnCard: string
  deliveryAddress: string
  atmUsage: string
  posUsage: string
  mobileNumber: string
}

interface Props {
  formData: DebitCardFormData
  onChange: (data: Partial<DebitCardFormData>) => void
  onContinue: () => void
  onBack: () => void
}

export function DebitCardFormSection({ formData, onChange, onContinue, onBack }: Props) {
  const isPersonalized = formData.cardRequestType === 'Personalized Card'

  const canContinue = () => {
    if (!formData.cardRequestType) return false
    if (isPersonalized && !formData.cardType) return false
    if (!formData.nameOnCard.trim()) return false
    if (formData.nameOnCard.trim().length > 20) return false
    if (!formData.deliveryAddress) return false
    if (!formData.atmUsage) return false
    if (!formData.posUsage) return false
    if (!formData.mobileNumber.trim()) return false
    return true
  }

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#e6f7f3] flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-[#0d8f72]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#111827]">Debit Card Details</h2>
          <p className="text-sm text-[#6b7280]">Fill in the debit card request information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1.5">Branch Name</label>
          <input
            type="text"
            value={formData.branchName}
            onChange={(e) => onChange({ branchName: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[rgba(13,143,114,0.12)] focus:border-[#0d8f72]"
            placeholder="Auto-filled from customer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1.5">Account Number</label>
          <input
            type="text"
            value={formData.accountNumber}
            onChange={(e) => onChange({ accountNumber: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[rgba(13,143,114,0.12)] focus:border-[#0d8f72]"
            placeholder="Auto-filled from customer"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#374151] mb-2">Card Request Type</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 p-3 border border-[#d1d5db] rounded-lg cursor-pointer hover:bg-[#f9fafb] transition-colors flex-1">
            <input
              type="radio"
              name="cardRequestType"
              value="Ready Kit"
              checked={formData.cardRequestType === 'Ready Kit'}
              onChange={(e) => onChange({ cardRequestType: e.target.value, cardType: '' })}
              className="accent-[#0d8f72]"
            />
            <span className="text-sm font-medium text-[#374151]">Ready Kit</span>
          </label>
          <label className="flex items-center gap-2 p-3 border border-[#d1d5db] rounded-lg cursor-pointer hover:bg-[#f9fafb] transition-colors flex-1">
            <input
              type="radio"
              name="cardRequestType"
              value="Personalized Card"
              checked={formData.cardRequestType === 'Personalized Card'}
              onChange={(e) => onChange({ cardRequestType: e.target.value })}
              className="accent-[#0d8f72]"
            />
            <span className="text-sm font-medium text-[#374151]">Personalized Card</span>
          </label>
        </div>
      </div>

      {isPersonalized && (
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">Card Type</label>
          <div className="grid grid-cols-3 gap-3">
            {['Rupay Card', 'Visa Card', 'Master Card'].map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 p-3 border border-[#d1d5db] rounded-lg cursor-pointer hover:bg-[#f9fafb] transition-colors"
              >
                <input
                  type="radio"
                  name="cardType"
                  value={type}
                  checked={formData.cardType === type}
                  onChange={(e) => onChange({ cardType: e.target.value })}
                  className="accent-[#0d8f72]"
                />
                <span className="text-sm font-medium text-[#374151]">{type}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#374151] mb-1.5">
          Name On Card
          <span className="text-[#9ca3af] ml-1">(Max 20 characters)</span>
        </label>
        <input
          type="text"
          value={formData.nameOnCard}
          onChange={(e) => {
            if (e.target.value.length <= 20) {
              onChange({ nameOnCard: e.target.value })
            }
          }}
          className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(13,143,114,0.12)] focus:border-[#0d8f72]"
          placeholder="Enter name as it should appear on card"
          maxLength={20}
        />
        <p className="text-xs text-[#9ca3af] mt-1">{formData.nameOnCard.length}/20 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#374151] mb-2">Delivery Address</label>
        <div className="flex gap-4">
          {['Mailing Address', 'Branch Address'].map((addr) => (
            <label
              key={addr}
              className="flex items-center gap-2 p-3 border border-[#d1d5db] rounded-lg cursor-pointer hover:bg-[#f9fafb] transition-colors flex-1"
            >
              <input
                type="radio"
                name="deliveryAddress"
                value={addr}
                checked={formData.deliveryAddress === addr}
                onChange={(e) => onChange({ deliveryAddress: e.target.value })}
                className="accent-[#0d8f72]"
              />
              <span className="text-sm font-medium text-[#374151]">{addr}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">ATM Usage</label>
          <div className="space-y-2">
            {['Domestic Only', 'International Only', 'Both', 'None'].map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 p-2.5 border border-[#d1d5db] rounded-lg cursor-pointer hover:bg-[#f9fafb] transition-colors"
              >
                <input
                  type="radio"
                  name="atmUsage"
                  value={opt}
                  checked={formData.atmUsage === opt}
                  onChange={(e) => onChange({ atmUsage: e.target.value })}
                  className="accent-[#0d8f72]"
                />
                <span className="text-sm text-[#374151]">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">POS Usage</label>
          <div className="space-y-2">
            {['Domestic Only', 'International Only', 'Both', 'None'].map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 p-2.5 border border-[#d1d5db] rounded-lg cursor-pointer hover:bg-[#f9fafb] transition-colors"
              >
                <input
                  type="radio"
                  name="posUsage"
                  value={opt}
                  checked={formData.posUsage === opt}
                  onChange={(e) => onChange({ posUsage: e.target.value })}
                  className="accent-[#0d8f72]"
                />
                <span className="text-sm text-[#374151]">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1.5">Mobile Number</label>
          <input
            type="text"
            value={formData.mobileNumber}
            onChange={(e) => onChange({ mobileNumber: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(13,143,114,0.12)] focus:border-[#0d8f72]"
            placeholder="Mobile number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1.5">Place</label>
          <input
            type="text"
            value={formData.place}
            onChange={(e) => onChange({ place: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(13,143,114,0.12)] focus:border-[#0d8f72]"
            placeholder="Place (e.g. city/town)"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#f3f4f6]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f9fafb] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customer
        </button>
        <button
          onClick={onContinue}
          disabled={!canContinue()}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#0d8f72] text-white text-sm font-semibold rounded-lg hover:bg-[#0b7a62] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Review Details
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
