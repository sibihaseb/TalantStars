const { Pool } = require("@neondatabase/serverless");
const { neonConfig } = require("@neondatabase/serverless");

neonConfig.webSocketConstructor = require("ws");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Comprehensive Terms of Service content
const termsOfServiceContent = `
# Terms of Service

**Last Updated:** January 1, 2025

Welcome to Talents & Stars, a premium platform connecting entertainment professionals with opportunities worldwide. By using our services, you agree to these Terms of Service ("Terms").

## 1. Platform Overview

Talents & Stars is an AI-powered entertainment industry platform that connects talent (actors, musicians, voice artists, models) with producers, managers, and casting directors. We provide advanced profile management, job matching, and professional networking tools.

## 2. Acceptance of Terms

By creating an account, accessing, or using our services, you agree to be bound by these Terms and our Privacy Policy. If you disagree with any part of these terms, you may not use our services.

## 3. Account Registration & Responsibilities

### 3.1 Account Creation
- You must provide accurate, current, and complete information during registration
- You are responsible for maintaining the confidentiality of your account credentials
- You must notify us immediately of any unauthorized use of your account

### 3.2 Account Types
- **Talent Accounts**: For actors, musicians, voice artists, and models
- **Industry Professional Accounts**: For producers, managers, agents, and casting directors
- **Premium Accounts**: Enhanced features and priority support

### 3.3 Verification
- We may verify your identity and professional credentials
- Misrepresentation of identity or credentials may result in account termination

## 4. User Conduct & Acceptable Use

### 4.1 Acceptable Use
You agree to use our platform only for lawful purposes and in accordance with these Terms. You agree not to:
- Violate any applicable laws or regulations
- Infringe on intellectual property rights
- Engage in harassment, discrimination, or inappropriate behavior
- Upload harmful, offensive, or inappropriate content
- Attempt to gain unauthorized access to our systems

### 4.2 Content Guidelines
- All uploaded content must be original or properly licensed
- Content must be appropriate for a professional entertainment platform
- We reserve the right to remove content that violates these guidelines

## 5. Intellectual Property

### 5.1 User Content
- You retain ownership of content you upload to our platform
- You grant us a non-exclusive, royalty-free license to use, display, and distribute your content
- You represent that you have the right to grant these licenses

### 5.2 Platform Rights
- Our platform, including design, functionality, and algorithms, is protected by intellectual property laws
- You may not copy, modify, or distribute our platform without written permission

## 6. Privacy & Data Protection

### 6.1 Data Collection
- We collect and process personal information as described in our Privacy Policy
- We implement industry-standard security measures to protect your data
- We comply with applicable data protection regulations

### 6.2 Communication
- We may contact you about platform updates, opportunities, and promotional content
- You can adjust your communication preferences in your account settings

## 7. Premium Services & Payments

### 7.1 Subscription Plans
- We offer various subscription tiers with different features and benefits
- Subscription fees are billed in advance on a monthly or annual basis
- All fees are non-refundable except as required by law

### 7.2 Payment Processing
- Payments are processed through secure third-party payment providers
- You are responsible for keeping your payment information current
- We reserve the right to suspend services for non-payment

## 8. Job Opportunities & Matching

### 8.1 Job Listings
- We provide job matching services based on your profile and preferences
- We do not guarantee job placement or booking success
- All job negotiations are between you and the hiring party

### 8.2 AI Recommendations
- Our AI system provides job recommendations based on your profile data
- Recommendations are not guaranteed opportunities
- We continuously improve our matching algorithms

## 9. Termination

### 9.1 Account Termination
- You may terminate your account at any time through your account settings
- We may suspend or terminate accounts for violations of these Terms
- Upon termination, your access to premium features will cease

### 9.2 Data Retention
- We will retain your data according to our Privacy Policy
- You may request data deletion subject to legal requirements

## 10. Disclaimers & Limitations

### 10.1 Service Availability
- We strive for 99.9% uptime but do not guarantee uninterrupted service
- We may perform maintenance that temporarily affects service availability
- We are not liable for service interruptions beyond our control

### 10.2 Limitation of Liability
- Our liability is limited to the fees you paid for our services
- We are not liable for indirect, incidental, or consequential damages
- Some jurisdictions do not allow liability limitations, so these may not apply to you

## 11. Indemnification

You agree to indemnify and hold harmless Talents & Stars and its affiliates from any claims, damages, or losses arising from your use of our services or violation of these Terms.

## 12. Governing Law & Dispute Resolution

### 12.1 Governing Law
These Terms are governed by the laws of California, United States, without regard to conflict of law principles.

### 12.2 Dispute Resolution
- We encourage resolving disputes through our customer support first
- Any legal disputes will be resolved through binding arbitration
- You retain the right to pursue claims in small claims court

## 13. Changes to Terms

### 13.1 Updates
- We may update these Terms from time to time
- We will notify you of significant changes via email or platform notification
- Continued use of our services constitutes acceptance of updated Terms

### 13.2 Notification
- Important changes will be communicated at least 30 days in advance
- You may terminate your account if you disagree with updated Terms

## 14. Contact Information

For questions about these Terms, please contact us:
- Email: legal@talentsandstars.com
- Address: 123 Entertainment Blvd, Los Angeles, CA 90028
- Phone: (555) 123-4567

## 15. Severability

If any provision of these Terms is found to be unenforceable, the remaining provisions will continue to be valid and enforceable.

---

**Effective Date:** January 1, 2025
**Version:** 1.0

By using Talents & Stars, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
`;

// Comprehensive Privacy Policy content
const privacyPolicyContent = `
# Privacy Policy

**Last Updated:** January 1, 2025

At Talents & Stars, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.

## 1. Information We Collect

### 1.1 Personal Information
- **Account Information**: Name, email address, phone number, location
- **Profile Information**: Professional bio, experience, skills, portfolio content
- **Identity Verification**: Government-issued ID, professional credentials
- **Payment Information**: Billing details, subscription information (processed securely)

### 1.2 Professional Information
- **Talent Profiles**: Headshots, demo reels, performance history, availability
- **Industry Profiles**: Company information, project history, casting preferences
- **Performance Data**: Application success rates, booking history, ratings

### 1.3 Usage Information
- **Platform Activity**: Pages visited, features used, search queries
- **Device Information**: IP address, browser type, operating system
- **Communication Data**: Messages, job applications, support inquiries

### 1.4 Cookies & Tracking
- **Essential Cookies**: Required for platform functionality
- **Analytics Cookies**: Help us improve user experience
- **Marketing Cookies**: Personalize content and advertisements

## 2. How We Use Your Information

### 2.1 Core Platform Services
- **Profile Management**: Create and maintain your professional profile
- **Job Matching**: Connect you with relevant opportunities using AI algorithms
- **Communication**: Facilitate messaging between talent and industry professionals
- **Verification**: Confirm identity and professional credentials

### 2.2 Platform Improvement
- **Analytics**: Understand user behavior to improve our services
- **AI Enhancement**: Train our matching algorithms for better recommendations
- **Feature Development**: Develop new tools and capabilities
- **Quality Assurance**: Monitor platform performance and user satisfaction

### 2.3 Communication & Marketing
- **Service Updates**: Notify you about platform changes and new features
- **Opportunity Alerts**: Send relevant job notifications and recommendations
- **Promotional Content**: Share industry news and platform promotions
- **Support Services**: Provide customer service and technical support

## 3. Information Sharing & Disclosure

### 3.1 Public Profile Information
- **Talent Profiles**: Name, professional bio, portfolio content, and experience are visible to verified industry professionals
- **Search Results**: Your profile may appear in search results for industry professionals
- **Recommendations**: Your profile may be recommended to relevant opportunities

### 3.2 Service Providers
- **Payment Processing**: Stripe and other payment providers process billing information
- **Cloud Storage**: AWS/Wasabi for secure file storage and content delivery
- **Analytics Services**: Google Analytics and similar services for platform improvement
- **Communication Tools**: Email and messaging service providers

### 3.3 Legal Requirements
- **Legal Compliance**: When required by law, court order, or legal process
- **Safety Protection**: To protect the safety of users and prevent fraud
- **Terms Enforcement**: To enforce our Terms of Service and platform policies

### 3.4 Business Transfers
- **Mergers & Acquisitions**: Your information may be transferred in business transactions
- **Asset Sales**: Data may be included in asset transfers with appropriate protection

## 4. Data Protection & Security

### 4.1 Security Measures
- **Encryption**: Data is encrypted both in transit and at rest
- **Access Controls**: Strict employee access controls and authentication
- **Security Monitoring**: 24/7 monitoring for suspicious activity
- **Regular Audits**: Periodic security assessments and updates

### 4.2 Data Retention
- **Active Accounts**: Data retained while your account is active
- **Deleted Accounts**: Most data deleted within 30 days of account closure
- **Legal Requirements**: Some data retained longer for legal compliance
- **Backup Systems**: Encrypted backups maintained for disaster recovery

### 4.3 International Transfers
- **Global Operations**: Data may be processed in multiple countries
- **Adequate Protection**: We ensure appropriate safeguards for international transfers
- **Privacy Shield**: Compliance with applicable international privacy frameworks

## 5. Your Rights & Choices

### 5.1 Access & Control
- **Profile Management**: Update your profile information at any time
- **Privacy Settings**: Control who can see your profile and contact you
- **Data Access**: Request a copy of your personal data
- **Data Correction**: Request correction of inaccurate information

### 5.2 Communication Preferences
- **Email Notifications**: Customize email frequency and types
- **Push Notifications**: Control mobile app notifications
- **Marketing Communications**: Opt out of promotional emails
- **Job Alerts**: Adjust opportunity notification settings

### 5.3 Data Subject Rights (GDPR/CCPA)
- **Right to Access**: Request information about data processing
- **Right to Rectification**: Correct inaccurate personal data
- **Right to Erasure**: Request deletion of personal data
- **Right to Portability**: Receive data in a structured format
- **Right to Object**: Object to certain types of processing

## 6. Cookies & Tracking Technologies

### 6.1 Types of Cookies
- **Strictly Necessary**: Required for platform functionality
- **Performance**: Help us understand how you use our platform
- **Functional**: Remember your preferences and settings
- **Targeting**: Personalize content and advertisements

### 6.2 Cookie Management
- **Browser Settings**: Most browsers allow cookie control
- **Opt-Out Tools**: Use industry opt-out tools for advertising cookies
- **Platform Settings**: Manage cookie preferences in your account

## 7. Third-Party Services

### 7.1 Integration Partners
- **Social Media**: Optional integration with professional networks
- **Payment Providers**: Secure payment processing services
- **Analytics Tools**: Platform improvement and user experience analytics
- **Communication Services**: Email and messaging service providers

### 7.2 Third-Party Policies
- **External Policies**: Third-party services have their own privacy policies
- **Link Disclaimers**: We're not responsible for external website practices
- **Service Changes**: Third-party policies may change independently

## 8. Children's Privacy

### 8.1 Age Restrictions
- **Minimum Age**: Our platform is for users 18 years and older
- **Age Verification**: We may verify age during registration
- **Parental Consent**: Required for users under 18 in certain jurisdictions

### 8.2 COPPA Compliance
- **No Collection**: We do not knowingly collect information from children under 13
- **Immediate Removal**: Any such information is immediately deleted
- **Parental Rights**: Parents may request information about their child's data

## 9. Regional Privacy Rights

### 9.1 European Union (GDPR)
- **Legal Basis**: We process data based on consent, contract, or legitimate interest
- **Data Protection Officer**: Contact dpo@talentsandstars.com
- **Supervisory Authority**: Right to file complaints with data protection authorities
- **Cross-Border Transfers**: Appropriate safeguards for international transfers

### 9.2 California (CCPA)
- **Consumer Rights**: Access, deletion, and non-discrimination rights
- **Do Not Sell**: We do not sell personal information to third parties
- **Opt-Out Rights**: Right to opt out of certain data processing
- **Disclosure Requirements**: Annual disclosure of data practices

### 9.3 Other Jurisdictions
- **Local Laws**: Compliance with applicable local privacy laws
- **Additional Rights**: Region-specific privacy rights where applicable
- **Contact Information**: Regional privacy contacts where required

## 10. Data Breach Notification

### 10.1 Incident Response
- **Immediate Action**: Rapid response to potential security incidents
- **Investigation**: Thorough investigation of any data breaches
- **Notification**: Prompt notification to affected users and authorities
- **Remediation**: Implementation of measures to prevent future incidents

### 10.2 User Notification
- **Timely Notice**: Notification within 72 hours of discovery
- **Clear Communication**: Plain language explanation of the incident
- **Protective Measures**: Recommended actions to protect your account
- **Support Services**: Additional support during incident response

## 11. Changes to Privacy Policy

### 11.1 Policy Updates
- **Regular Reviews**: Periodic review and updates to this policy
- **Material Changes**: Significant changes communicated prominently
- **Effective Date**: New policies effective after notice period
- **Continued Use**: Continued use constitutes acceptance of changes

### 11.2 Notification Methods
- **Email Notice**: Direct notification to registered email address
- **Platform Notice**: Prominent notice on our platform
- **Account Dashboard**: Information in your account settings
- **Advance Notice**: At least 30 days notice for significant changes

## 12. Contact Information

### 12.1 Privacy Questions
For questions about this Privacy Policy or our privacy practices:
- **Email**: privacy@talentsandstars.com
- **Phone**: (555) 123-4567
- **Address**: 123 Entertainment Blvd, Los Angeles, CA 90028

### 12.2 Data Protection Officer
- **Email**: dpo@talentsandstars.com
- **Role**: Oversee privacy compliance and handle data protection inquiries

### 12.3 Regional Contacts
- **EU Representative**: eu-privacy@talentsandstars.com
- **California Privacy Rights**: california-privacy@talentsandstars.com

---

**Effective Date:** January 1, 2025
**Version:** 1.0

This Privacy Policy is designed to help you understand how we collect, use, and protect your personal information while using Talents & Stars.
`;

async function seedLegalDocuments() {
  try {
    console.log("Starting legal documents seeding...");
    
    // Check if legal documents already exist
    const existingDocs = await pool.query('SELECT * FROM legal_documents');
    
    if (existingDocs.rows.length > 0) {
      console.log("Legal documents already exist. Skipping seeding.");
      return;
    }
    
    // Insert Terms of Service
    await pool.query(`
      INSERT INTO legal_documents (type, title, content, version, is_active, effective_date)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      'terms_of_service',
      'Terms of Service',
      termsOfServiceContent,
      '1.0',
      true,
      new Date('2025-01-01')
    ]);
    
    // Insert Privacy Policy
    await pool.query(`
      INSERT INTO legal_documents (type, title, content, version, is_active, effective_date)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      'privacy_policy',
      'Privacy Policy',
      privacyPolicyContent,
      '1.0',
      true,
      new Date('2025-01-01')
    ]);
    
    console.log("Legal documents seeded successfully!");
    
  } catch (error) {
    console.error("Error seeding legal documents:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedLegalDocuments().then(() => {
    console.log("Legal documents seeding completed.");
    process.exit(0);
  });
}

module.exports = { seedLegalDocuments };