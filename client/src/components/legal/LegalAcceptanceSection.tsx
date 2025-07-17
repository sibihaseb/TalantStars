import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LegalDocumentModal } from './LegalDocumentModal';
import { FileText, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface LegalAcceptanceSectionProps {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  onPrivacyChange: (accepted: boolean) => void;
  className?: string;
}

export const LegalAcceptanceSection: React.FC<LegalAcceptanceSectionProps> = ({
  termsAccepted,
  privacyAccepted,
  onTermsChange,
  onPrivacyChange,
  className = "",
}) => {
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  const isComplete = termsAccepted && privacyAccepted;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-3"
        >
          <div className={`p-2 rounded-full ${isComplete ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
            {isComplete ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Shield className="h-5 w-5" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            Legal Requirements
          </h3>
        </motion.div>
        <p className="text-gray-600 text-sm">
          Please review and accept our legal documents to continue
        </p>
      </div>

      {/* Legal Documents Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="space-y-4">
          {/* Terms of Service */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group"
          >
            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200">
              <div className="flex-shrink-0 mt-1">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={onTermsChange}
                  className="w-5 h-5 border-2 border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-900">Terms of Service</span>
                  {termsAccepted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-600"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </motion.div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Our Terms of Service outline your rights and responsibilities when using our platform.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTermsModalOpen(true)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                >
                  Review Terms of Service
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Privacy Policy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group"
          >
            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200">
              <div className="flex-shrink-0 mt-1">
                <Checkbox
                  id="privacy"
                  checked={privacyAccepted}
                  onCheckedChange={onPrivacyChange}
                  className="w-5 h-5 border-2 border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-900">Privacy Policy</span>
                  {privacyAccepted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-600"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </motion.div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Our Privacy Policy describes how we collect, use, and protect your personal information.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPrivacyModalOpen(true)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                >
                  Review Privacy Policy
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Completion Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 pt-4 border-t border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isComplete ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Legal requirements completed
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">
                    Please accept both documents to proceed
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${termsAccepted ? 'bg-green-500' : 'bg-gray-300'}`} />
              <div className={`w-3 h-3 rounded-full ${privacyAccepted ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Important Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-amber-50 border border-amber-200 rounded-lg p-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 mb-1">
              Important Notice
            </p>
            <p className="text-sm text-amber-700">
              By accepting these documents, you agree to be bound by their terms. 
              These documents may be updated from time to time, and you will be notified of any changes.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Legal Document Modals */}
      <LegalDocumentModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        documentType="terms"
        title="Terms of Service"
      />
      
      <LegalDocumentModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        documentType="privacy"
        title="Privacy Policy"
      />
    </div>
  );
};