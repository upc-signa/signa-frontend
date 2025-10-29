import { X } from 'lucide-react';

export default function TermsDialog({ isOpen, onClose }) {
  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 h-screen bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col relative">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Terms and Conditions</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors !bg-transparent !border-none focus:!outline-none"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto">
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-500 mb-4">Last updated: {currentDate}</p>
            
            <p className="mb-6">
              Welcome to our video call platform. By registering, accessing, or using our services, 
              you agree to the following Terms and Conditions. Please read them carefully before using the platform.
            </p>

            <h3 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h3>
            <p className="mb-4">
              By creating an account or using the platform, you confirm that you have read and accepted these 
              Terms and Conditions, as well as our Privacy Policy. If you disagree, you should not use the service.
            </p>

            <h3 className="text-lg font-semibold mb-2">2. User Registration and Account</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>Registration with truthful and up-to-date information is required for video calls.</li>
              <li>You are responsible for maintaining the confidentiality of your credentials.</li>
              <li>The use of fake accounts or unauthorized third-party accounts is not permitted.</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">3. Permitted Platform Usage</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>The platform must be used only for legal and respectful purposes.</li>
              <li>Recording, distributing, or sharing video calls without participants' consent is prohibited.</li>
              <li>Using the platform for illegal, offensive activities or infringing third-party rights is not allowed.</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">4. User Responsibility</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>Users are responsible for the content they share during video calls.</li>
              <li>The company is not responsible for other users' conduct or the content they share.</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">5. Liability Limitation</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>The service is provided "as is" and we do not guarantee uninterrupted availability.</li>
              <li>We assume no responsibility for technical interruptions, data loss, or problems arising from service use.</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">6. Service Modifications</h3>
            <p className="mb-4">
              We may update, modify, or partially or totally suspend the platform at any time, 
              notifying users in advance when possible.
            </p>

            <h3 className="text-lg font-semibold mb-2">7. Applicable Legislation</h3>
            <p className="mb-4">
              These Terms and Conditions are governed by the laws of Peru. Any disputes will be resolved 
              in the competent courts of this jurisdiction.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}