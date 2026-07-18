require("dotenv").config();
const mongoose = require("mongoose");
const Policy = require("./models/Policy");

const connectDB = require("./config/db");

// ─── Centralized Business Information ────────────────────────────────────
// These values are used consistently across all policies.
// Placeholders indicate information that requires business confirmation.

const BUSINESS = {
  name: "Maanjoo Farms",
  domain: "maanjoofarms.com",
  email: "info@maanjoofarms.com",
  phone: "[SUPPORT PHONE]",
  address: "[BUSINESS ADDRESS]",
  jurisdiction: "Pilani, Rajasthan, India",
  grievanceEmail: "grievance@maanjoofarms.com",
  legalName: "[LEGAL BUSINESS NAME]",
  gstin: "[GSTIN]",
  cin: "[CIN]",
  lastUpdated: "July 2026",
};

const CONTACT_BLOCK = `
If you have any questions about this policy, please contact us at **${BUSINESS.email}** or write to us at ${BUSINESS.address}.
`;

const policies = [
  // ===================================================================
  // POLICY 1: TERMS & CONDITIONS
  // ===================================================================
  {
    title: "Terms & Conditions",
    slug: "terms-and-conditions",
    metaDescription:
      "Read the Terms & Conditions for using Maanjoo Farms website, ordering organic products, and booking villa accommodations.",
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        order: 1,
        content: `
Welcome to ${BUSINESS.name}. This website (the "Site") is operated by ${BUSINESS.legalName || BUSINESS.name}.

By accessing or using our website, purchasing our products, or booking our accommodations, you agree to be legally bound by these Terms & Conditions. If you do not agree with any part of these terms, you must not use our website or services.

${BUSINESS.name} offers:
- Organic farm products for online purchase and delivery
- Villa and room accommodations for stay
- Agro-tourism experiences including horse riding, camel safaris, and farm tours

These terms govern all use of the Site, including all orders, bookings, and services provided by ${BUSINESS.name}.`,
      },
      {
        id: "definitions",
        title: "Definitions",
        order: 2,
        content: `
Throughout these Terms & Conditions, the following definitions apply:

**"Company," "we," "us," "our"** — ${BUSINESS.legalName || BUSINESS.name}, the entity operating this website.

**"Website" or "Site"** — The website operated at ${BUSINESS.domain} and all related subdomains.

**"Customer," "you," "your"** — Any person who accesses the website, places an order, or makes a booking.

**"User"** — Any person who accesses or uses the website, regardless of whether they create an account or make a purchase.

**"Products"** — Organic farm produce, goods, and items offered for sale through the website, including but not limited to fruits, vegetables, dairy products, grains, honey, ghee, and other organic farm products.

**"Order"** — A request to purchase Products through the website.

**"Booking"** — A reservation for accommodations including villas, rooms, or agro-tourism experiences.

**"Villa" / "Room"** — Accommodation units available for booking at ${BUSINESS.name}.

**"Services"** — All offerings available through the website, including product sales and accommodation bookings.

**"Payment Gateway"** — The third-party payment processing service used to process payments on the website.
`,
      },
      {
        id: "eligibility",
        title: "Eligibility",
        order: 3,
        content: `
By using this website, you confirm that:

- You are at least 18 years of age, or you are accessing the website under the supervision of a parent or legal guardian.
- You have the legal capacity to enter into binding contracts.
- You are not located in a jurisdiction where the use of our services is prohibited by applicable law.
- You will use the website in compliance with all applicable local, state, and national laws.

If you are under 18, you may use the website only with the involvement of a parent or guardian who agrees to these terms on your behalf.`,
      },
      {
        id: "user-account",
        title: "User Accounts",
        order: 4,
        content: `
To place an order or make a booking, you may be required to create an account. When creating an account, you agree to:

- Provide accurate, current, and complete information as prompted by the registration form.
- Maintain and promptly update your account information to keep it accurate and complete.
- Maintain the confidentiality of your login credentials.
- Accept responsibility for all activities that occur under your account.
- Notify us immediately of any unauthorized use of your account or any other security breach.

We reserve the right to suspend or terminate accounts that provide false information, violate these terms, or engage in fraudulent or abusive behavior.`,
      },
      {
        id: "products-and-services",
        title: "Products & Services",
        order: 5,
        content: `
**Product Descriptions**

We strive to provide accurate descriptions, images, and pricing for all products listed on our website. However, we do not warrant that product descriptions, images, or specifications are complete, reliable, current, or error-free. Actual products may vary slightly from images due to the natural characteristics of organic farm produce.

**Product Availability**

All products are offered subject to availability. We reserve the right to discontinue any product at any time without prior notice. In the event that a product becomes unavailable after an order is placed, we will notify you and issue a full refund.

**Organic Certification**

Products labeled as organic are sourced from certified organic farms. We make reasonable efforts to verify organic certification, but customers should refer to the product packaging for certification details.

**Villa & Room Accommodations**

Accommodation listings include information about room types, amenities, capacity, and pricing. We make reasonable efforts to ensure this information is accurate, but features and amenities may change without notice.`,
      },
      {
        id: "pricing",
        title: "Pricing",
        order: 6,
        content: `
All prices listed on the website are in Indian Rupees (INR) unless otherwise stated.

**Taxes**

Applicable taxes, including Goods and Services Tax (GST), will be added to the total amount and displayed at checkout before payment is completed.

**Pricing Errors**

In the rare event that a product or booking is listed at an incorrect price, we reserve the right to refuse or cancel any orders placed at the incorrect price. If your order is cancelled due to a pricing error, you will receive a full refund of any amount paid.

**Price Changes**

We reserve the right to modify prices at any time without prior notice. Price changes will not affect orders that have already been accepted and confirmed.

**Promotional Pricing**

From time to time, we may offer promotional discounts, coupon codes, or special pricing. Promotional offers are subject to specific terms and conditions, including validity periods, minimum order values, and exclusions.`,
      },
      {
        id: "orders",
        title: "Orders",
        order: 7,
        content: `
**Order Placement**

When you place an order through our website, you are making an offer to purchase the products in your cart. We reserve the right to accept or decline your order for any reason.

**Order Acceptance**

Your order is considered accepted when we send you an order confirmation email. Until you receive this confirmation, the order may still be declined. We may decline an order due to product unavailability, payment failure, suspected fraud, or other legitimate business reasons.

**Order Confirmation**

Upon acceptance, we will send a confirmation email containing your order details, order number, and payment confirmation.

**Order Rejection**

If we are unable to fulfill your order, we will notify you and issue a full refund for any amount paid.

**Order Cancellation**

You may cancel an order before it has been processed or shipped. Once an order has been shipped, cancellation is subject to our Return & Refund Policy.`,
      },
      {
        id: "payments",
        title: "Payments",
        order: 8,
        content: `
**Payment Processing**

All payments are processed through Razorpay, a third-party payment gateway. We accept payments via credit cards, debit cards, net banking, UPI (including Google Pay, PhonePe, Paytm), and digital wallets as made available by Razorpay.

**Payment Confirmation**

Your order or booking will be confirmed only after successful payment verification. We verify payments through Razorpay's webhook system and signature verification.

**Failed Payments**

If a payment fails, the order or booking will not be placed. Any amount debited in error will be refunded as per Razorpay's refund policies and applicable banking timelines.

**Duplicate Payments**

In the unlikely event of a duplicate charge, please contact us immediately. We will verify the duplicate payment and process a refund promptly.`,
      },
      {
        id: "shipping-and-delivery",
        title: "Shipping & Delivery",
        order: 9,
        content: `
Shipping and delivery of products are governed by our Shipping & Delivery Policy. By placing an order, you agree to the terms outlined in that policy.

Key points:
- We deliver to select serviceable locations across India.
- Delivery is subject to pincode availability, which is verified at checkout.
- Estimated delivery timelines are provided at checkout and in your order confirmation.
- You are responsible for providing accurate delivery information.
- Delivery may require a signature upon receipt.

Please refer to the Shipping & Delivery Policy for complete details.`,
      },
      {
        id: "returns-and-refunds",
        title: "Returns & Refunds",
        order: 10,
        content: `
Returns and refunds are governed by our Return & Refund Policy. Key points include:

- Perishable organic products including fruits, vegetables, and dairy items cannot be returned once delivered due to health and safety regulations.
- Non-perishable products may be eligible for return within the specified return window if defective, damaged, or incorrect.
- Refunds for eligible returns will be processed to the original payment method.

Please refer to the Return & Refund Policy for complete details, including eligibility criteria, processes, and timelines.`,
      },
      {
        id: "villa-bookings",
        title: "Villa Bookings",
        order: 11,
        content: `
**Reservation**

Villa and room bookings are made through our website. A booking is confirmed only after payment is successfully processed and verified.

**Booking Confirmation**

Upon successful payment, you will receive a booking confirmation email with your booking details, including check-in and check-out dates, room information, and guest details.

**Guest Information**

You may be required to provide guest details including names, ages, and genders for all guests. This information is used for compliance with local regulations and to ensure appropriate accommodation arrangements.

**Check-In & Check-Out**

Standard check-in and check-out timings will be communicated in your booking confirmation. Early check-in and late check-out are subject to availability and may incur additional charges.

**Property Rules**

Guests are expected to follow all property rules, including those related to noise, visitors, smoking, pets, and use of facilities. Violation of property rules may result in termination of your stay without refund.`,
      },
      {
        id: "booking-cancellation",
        title: "Booking Cancellation",
        order: 12,
        content: `
Booking cancellations are governed by our Villa Booking Cancellation Policy. Key points include:

- Cancellation terms depend on how far in advance the cancellation is made.
- Cancellation charges and refund eligibility vary based on the timing of cancellation.
- No-shows are non-refundable.
- We reserve the right to cancel bookings in rare circumstances, in which case a full refund or rescheduling option will be provided.

Please refer to the Villa Booking Cancellation Policy for complete details.`,
      },
      {
        id: "user-responsibilities",
        title: "User Responsibilities",
        order: 13,
        content: `
As a user of our website, you agree to:

- Provide accurate, current, and complete information in all transactions and communications.
- Use the website only for lawful purposes and in compliance with these terms.
- Not misuse the platform for any fraudulent or illegal activity.
- Not attempt to gain unauthorized access to any part of the website, its servers, or systems.
- Not interfere with the proper functioning of the website.
- Not use automated tools, bots, or scripts to interact with the website without our express written permission.
- Comply with all applicable laws and regulations when using our services.`,
      },
      {
        id: "prohibited-activities",
        title: "Prohibited Activities",
        order: 14,
        content: `
The following activities are strictly prohibited on our website:

- Engaging in fraudulent transactions or using stolen payment instruments.
- Attempting to manipulate prices, payments, or booking systems.
- Using automated bots, scrapers, or scripts to access, collect data from, or interact with the website.
- Introducing viruses, malware, or any harmful code.
- Attempting to bypass security measures or authentication systems.
- Impersonating another person or entity.
- Posting or transmitting any unlawful, threatening, abusive, or obscene content.
- Engaging in any activity that disrupts or interferes with the website's infrastructure.
- Using the website for any unauthorized commercial purpose.

Violation of these prohibitions may result in immediate termination of your account, legal action, and reporting to relevant authorities.`,
      },
      {
        id: "intellectual-property",
        title: "Intellectual Property",
        order: 15,
        content: `
All content on this website — including but not limited to text, graphics, logos, images, audio clips, video clips, data compilations, page layout, underlying code, and software — is the property of ${BUSINESS.name}, its affiliates, or its content suppliers and is protected by Indian and international copyright, trademark, and intellectual property laws.

You may not:
- Reproduce, distribute, modify, display, perform, or create derivative works from any content without our prior written consent.
- Use our trademarks, logos, or branding without our prior written permission.
- Frame or mirror any content on the website on any other platform.

You may download or print content for personal, non-commercial use only, provided you retain all copyright and proprietary notices.`,
      },
      {
        id: "third-party-services",
        title: "Third-Party Services",
        order: 16,
        content: `
Our website integrates with third-party service providers to facilitate certain functions:

**Payment Processing:** Razorpay processes all payments securely. Your payment information is handled directly by Razorpay and is subject to their privacy and security policies.

**Delivery Partners:** Third-party logistics providers may deliver your orders. Delivery partners receive only the information necessary for delivery.

We are not responsible for the actions, policies, or failures of third-party service providers. Your interactions with these providers are governed by their respective terms and policies.`,
      },
      {
        id: "limitation-of-liability",
        title: "Limitation of Liability",
        order: 17,
        content: `
To the maximum extent permitted by applicable law:

- ${BUSINESS.name} and its directors, employees, affiliates, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to your use of the website, products, or services.
- Our total liability for any claim arising from these terms, an order, or a booking shall not exceed the amount paid by you for the specific product or service giving rise to the claim.
- We are not liable for delays or failures in performance caused by events beyond our reasonable control.
- We do not warrant that the website will be uninterrupted, error-free, secure, or free from viruses or other harmful components.
- We are not responsible for the accuracy, completeness, or reliability of any content, product descriptions, or information on the website.

This limitation of liability applies whether the claim is based on contract, tort (including negligence), strict liability, or any other legal theory.`,
      },
      {
        id: "force-majeure",
        title: "Force Majeure",
        order: 18,
        content: `
We shall not be held liable for any delay, failure, or disruption in the performance of our obligations under these terms caused by events beyond our reasonable control, including but not limited to:

- Natural disasters, earthquakes, floods, storms, or other extreme weather events.
- Acts of God, pandemics, epidemics, or public health emergencies.
- War, terrorism, civil unrest, or military actions.
- Government actions, regulations, restrictions, or orders.
- Fire, explosions, or accidents.
- Strikes, labor disputes, or supply chain disruptions.
- Power outages, telecommunications failures, or internet service disruptions.
- Technical failures in third-party systems, including payment gateways.

Our obligations will be suspended for the duration of the force majeure event, and we will make reasonable efforts to resume performance as soon as practicable.`,
      },
      {
        id: "governing-law",
        title: "Governing Law",
        order: 19,
        content: `
These Terms & Conditions shall be governed by and construed in accordance with the laws of India. Any disputes, claims, or controversies arising from or relating to these terms, your use of the website, or any order or booking shall be subject to the exclusive jurisdiction of the courts in ${BUSINESS.jurisdiction}.

Nothing in this clause shall prevent us from seeking injunctive or equitable relief in any court of competent jurisdiction to protect our intellectual property or confidential information.`,
      },
      {
        id: "policy-changes",
        title: "Changes to These Terms",
        order: 20,
        content: `
We reserve the right to update, modify, or revise these Terms & Conditions at any time. Changes will be effective immediately upon posting the updated terms on our website. We encourage you to review these terms periodically.

Your continued use of the website after any changes constitutes your acceptance of the revised terms. For material changes, we may provide additional notice via email or a prominent notice on our website.`,
      },
      {
        id: "contact",
        title: "Contact Us",
        order: 21,
        content: CONTACT_BLOCK,
      },
    ],
  },

  // ===================================================================
  // POLICY 2: PRIVACY POLICY
  // ===================================================================
  {
    title: "Privacy Policy",
    slug: "privacy-policy",
    metaDescription:
      "Learn how Maanjoo Farms collects, uses, stores, and protects your personal information when you use our website and services.",
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        order: 1,
        content: `
${BUSINESS.name} ("we," "us," "our") respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, place orders, or use our services.

Please read this policy carefully to understand our practices regarding your personal information. By using our website, you consent to the data practices described in this policy.`,
      },
      {
        id: "information-we-collect",
        title: "Information We Collect",
        order: 2,
        content: `
We collect information that you voluntarily provide to us, as well as information automatically collected when you use our website.

**Account Information**

When you create an account, we collect:
- Full name
- Email address
- Phone number
- Password (stored securely in hashed form)
- Profile information (optional)

**Order Information**

When you place an order, we collect:
- Products ordered and quantities
- Delivery address details (name, street, apartment, city, district, state, pincode)
- Order total and payment amount
- Order status and tracking information

**Booking Information**

When you book a villa or room, we collect:
- Guest names, ages, and genders
- Check-in and check-out dates
- Number of guests
- Booking preferences

**Payment Information**

Payment processing is handled through Razorpay, our third-party payment gateway. When you make a payment:
- Your payment method details (card type, last four digits) may be visible to us for reference.
- Your full card number, bank account details, and CVV are NOT collected or stored by us. These are handled directly by Razorpay.
- We store your Razorpay payment ID, order ID, and payment signature for transaction verification and reconciliation.

**Technical Information**

When you visit our website, we may automatically collect:
- IP address
- Browser type and version
- Device type and operating system
- Pages visited and time spent on each page
- Referring website address
- Cookies and similar tracking technologies
`,
      },
      {
        id: "how-we-use",
        title: "How We Use Your Information",
        order: 3,
        content: `
We use the information we collect for the following purposes:

**Account Management**
- Creating and maintaining your user account
- Verifying your identity

**Order Processing**
- Processing and fulfilling your product orders
- Communicating order status updates
- Arranging shipping and delivery
- Sending order confirmations and invoices

**Villa Bookings**
- Processing and confirming your accommodation bookings
- Communicating booking details
- Managing guest information for regulatory compliance

**Payment Processing**
- Facilitating payments through Razorpay
- Verifying payment status
- Processing refunds when applicable

**Customer Support**
- Responding to your inquiries and requests
- Resolving issues with orders or bookings
- Providing technical support

**Security & Fraud Prevention**
- Detecting and preventing fraudulent transactions
- Protecting our website and users from security threats
- Monitoring for unauthorized access

**Service Improvement**
- Analyzing website usage to improve our services
- Understanding customer preferences
- Developing new products and features

**Legal Compliance**
- Complying with applicable legal and regulatory obligations
- Responding to lawful requests from authorities
- Enforcing our Terms & Conditions`,
      },
      {
        id: "payment-information",
        title: "Payment Information",
        order: 4,
        content: `
We take payment security seriously. Here is how we handle payment information:

- **We do not store** complete credit card numbers, debit card numbers, CVV codes, bank account numbers, or UPI PINs.
- All payment pages are served over secure HTTPS connections.
- Payment processing is performed by **Razorpay**, a PCI DSS-compliant payment gateway.
- Your payment details are transmitted directly from your browser to Razorpay's secure infrastructure.
- We store only transaction identifiers (Razorpay payment ID, order ID, and signature) for order reconciliation, refund processing, and audit purposes.
- We recommend that you do not share your payment credentials, OTP, or UPI PIN with anyone.`,
      },
      {
        id: "cookies",
        title: "Cookies & Tracking Technologies",
        order: 5,
        content: `
Our website uses cookies and similar tracking technologies to enhance your browsing experience.

**What Are Cookies?**

Cookies are small text files stored on your device by your web browser. They help websites remember your preferences and improve functionality.

**How We Use Cookies**

- **Essential Cookies:** Required for basic website functionality, including user authentication and session management.
- **Preference Cookies:** Remember your settings and preferences for future visits.
- **Analytics Cookies:** Help us understand how visitors use our website, which pages are most popular, and how users navigate our site.

**Managing Cookies**

You can control and manage cookies through your browser settings. Most browsers allow you to block or delete cookies. However, please note that disabling essential cookies may affect the functionality of our website and your ability to use certain features.`,
      },
      {
        id: "sharing-information",
        title: "Sharing Your Information",
        order: 6,
        content: `
We may share your personal information with the following categories of third parties, only to the extent necessary for the purposes described in this policy:

**Payment Providers**
- Razorpay processes payments on our behalf. They receive transaction details necessary to process your payment.

**Logistics & Delivery Partners**
- Third-party courier and logistics providers receive your name, phone number, and delivery address for order fulfillment purposes.

**Technology Providers**
- We may use cloud hosting, email delivery, analytics, and other technology service providers who process data on our behalf. These providers are contractually obligated to protect your data and use it only for the services we engage them for.

**Legal Compliance**
- We may disclose your information if required to do so by law, regulation, or legal process, or in response to a valid request from law enforcement or government authorities.

**Business Transfers**
- In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business transaction.

**We do not sell, rent, or trade your personal information to third parties for marketing purposes.**`,
      },
      {
        id: "data-security",
        title: "Data Security",
        order: 7,
        content: `
We implement reasonable technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:

- Secure HTTPS encryption for all data transmitted between your browser and our servers.
- Password hashing using industry-standard algorithms.
- Regular security assessments and updates.
- Restricted access to personal information on a need-to-know basis.
- Secure storage of data on protected servers.

However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security. You are also responsible for maintaining the confidentiality of your account credentials.`,
      },
      {
        id: "data-retention",
        title: "Data Retention",
        order: 8,
        content: `
We retain your personal information for as long as necessary to fulfill the purposes described in this policy, unless a longer retention period is required or permitted by law.

**Account Information:** Retained for as long as your account is active, plus a reasonable period thereafter for business, legal, and audit purposes.

**Order & Booking Records:** Retained for accounting, tax, and legal compliance purposes, typically for a period required by applicable laws.

**Payment Records:** Retained for transaction reconciliation, refund processing, and audit purposes.

**Deleted Data:** When you request account deletion or when data is no longer needed, we will securely delete or anonymize your information, subject to legal retention requirements.`,
      },
      {
        id: "user-rights",
        title: "Your Rights",
        order: 9,
        content: `
Subject to applicable law, you have the following rights regarding your personal information:

- **Access:** You can request a copy of the personal information we hold about you.
- **Correction:** You can request correction of inaccurate or incomplete information.
- **Update:** You can update your account information directly through your account settings.
- **Deletion:** You can request deletion of your personal information, subject to legal retention requirements.
- **Objection:** You may object to the processing of your personal information for certain purposes.

To exercise any of these rights, please contact us using the information provided in the "Contact Us" section below. We will respond to your request within a reasonable timeframe as required by applicable law.`,
      },
      {
        id: "account-deletion",
        title: "Account Deletion",
        order: 10,
        content: `
If you wish to delete your account, you can contact us at ${BUSINESS.email} with your request. We will process your account deletion request within a reasonable timeframe.

Please note that:
- Some information may be retained as required by law or for legitimate business purposes (e.g., transaction records for tax and accounting purposes).
- Deleting your account does not automatically cancel any pending orders or bookings. Please ensure all pending transactions are resolved before requesting deletion.
- Once your account is deleted, you may lose access to your order history, booking history, and other account-related features.`,
      },
      {
        id: "third-party-links",
        title: "Third-Party Links",
        order: 11,
        content: `
Our website may contain links to third-party websites, including payment gateways and social media platforms. This Privacy Policy applies only to information collected on our website. We are not responsible for the privacy practices of third-party websites. We encourage you to review the privacy policies of any third-party websites you visit.`,
      },
      {
        id: "children-privacy",
        title: "Children's Privacy",
        order: 12,
        content: `
Our website and services are not directed to children under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information without parental consent, we will take steps to delete such information promptly.

If you believe that a child has provided personal information to us, please contact us immediately.`,
      },
      {
        id: "policy-updates",
        title: "Changes to This Privacy Policy",
        order: 13,
        content: `
We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or operational needs. When we make changes, we will update the "Last Updated" date at the top of this policy.

We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information. Your continued use of our website after any changes constitutes your acceptance of the updated policy.`,
      },
      {
        id: "contact",
        title: "Contact Us",
        order: 14,
        content: CONTACT_BLOCK,
      },
    ],
  },

  // ===================================================================
  // POLICY 3: RETURN, REFUND & CANCELLATION POLICY
  // ===================================================================
  {
    title: "Return, Refund & Cancellation Policy",
    slug: "return-refund-policy",
    metaDescription:
      "Review the return, refund, and cancellation policy for organic products purchased from Maanjoo Farms.",
    sections: [
      {
        id: "overview",
        title: "Overview",
        order: 1,
        content: `
This Return, Refund & Cancellation Policy applies to **product orders** placed on ${BUSINESS.name}. For villa and room booking cancellations, please refer to our Villa Booking Cancellation Policy.

We are committed to providing high-quality organic farm products. Because our products include perishable food items, certain limitations apply to returns and refunds as outlined below.`,
      },
      {
        id: "return-eligibility",
        title: "Return Eligibility",
        order: 2,
        content: `
Return eligibility depends on the type of product:

**Perishable Products (Not Returnable)**

Due to health, safety, and hygiene regulations, the following products **cannot be returned** once delivered:
- Fresh fruits and vegetables
- Dairy products (milk, curd, paneer, buttermilk)
- Fresh produce and leafy greens
- Any product with a short shelf life

**Non-Perishable Products (May Be Returnable)**

The following products may be eligible for return within the applicable return window:
- Packaged goods (grains, pulses, flours)
- Honey, ghee, oils, and preserves
- Spices and dry goods
- Other non-perishable organic products
`,
      },
      {
        id: "return-window",
        title: "Return Window",
        order: 3,
        content: `
For eligible non-perishable products, return requests must be submitted within **[RETURN WINDOW TO BE CONFIRMED]** days from the date of delivery. Requests received after this window will not be accepted unless the product is defective or the issue was reported within the window.`,
      },
      {
        id: "product-condition",
        title: "Product Condition for Returns",
        order: 4,
        content: `
To be eligible for a return, the product must meet the following conditions:

- The product must be unused and unopened (seal intact where applicable).
- The product must be in its original packaging.
- All accessories, labels, and documents must be included.
- The product must not show signs of tampering or misuse.
- Proof of purchase (order number or invoice) must be provided.`,
      },
      {
        id: "damaged-products",
        title: "Damaged Products",
        order: 5,
        content: `
If you receive a product that is visibly damaged:

1. Please inspect your package at the time of delivery. If the package appears damaged, note the damage on the delivery receipt before accepting.
2. Report the damage within 24 hours of delivery by contacting us with your order number, photographs of the damaged product and packaging, and a description of the damage.
3. We will review your claim and, if approved, offer a replacement (subject to availability) or a refund.

We recommend taking photographs of the product and packaging at the time of delivery for any damage claims.`,
      },
      {
        id: "defective-products",
        title: "Defective Products",
        order: 6,
        content: `
If you receive a product that is defective, spoiled, or does not meet our quality standards:

1. Contact us within 24 hours of delivery with your order number and photographs showing the defect.
2. Describe the issue in detail.
3. We will investigate and may request the product to be returned for inspection.
4. If the claim is approved, we will offer a replacement or refund at our discretion.

Quality concerns include products that are damaged, spoiled, contaminated, or significantly below expected quality standards.`,
      },
      {
        id: "incorrect-product",
        title: "Incorrect Product",
        order: 7,
        content: `
If you receive a product that is different from what you ordered:

1. Contact us within 24 hours of delivery with your order number and photographs.
2. We will verify the discrepancy against your order.
3. If confirmed, we will arrange for the correct product to be sent (subject to availability) or issue a full refund including any shipping charges.`,
      },
      {
        id: "missing-product",
        title: "Missing Product",
        order: 8,
        content: `
If an item is missing from your delivery:

1. Check the package carefully, including any inner packaging.
2. Contact us within 24 hours of delivery with your order number and a list of missing items.
3. We will investigate and arrange for the missing items to be delivered or issue a refund for the missing items.`,
      },
      {
        id: "wrong-quantity",
        title: "Wrong Quantity",
        order: 9,
        content: `
If you receive a quantity different from what you ordered:

1. Contact us within 24 hours of delivery with your order number.
2. Provide details of the discrepancy.
3. We will verify and arrange for the shortfall to be delivered or issue a refund for the missing quantity.`,
      },
      {
        id: "non-returnable-products",
        title: "Non-Returnable Products",
        order: 10,
        content: `
The following products are **not eligible for return** under any circumstances:

- Fresh fruits and vegetables (perishable nature).
- Dairy products and fresh produce (health and safety regulations).
- Products that have been opened, used, or tampered with.
- Products returned without original packaging.
- Products where the return window has expired.
- Products purchased during clearance or final sale (if explicitly marked as non-returnable).

In all cases, if a product is defective, damaged, or incorrect, please contact us and we will assess the situation on a case-by-case basis.`,
      },
      {
        id: "perishable-products",
        title: "Perishable Products & Quality Claims",
        order: 11,
        content: `
For perishable products (fruits, vegetables, dairy), returns are not accepted due to health and safety regulations. However, if you receive perishable products that are spoiled, damaged, or of unacceptable quality:

1. Contact us within **24 hours** of delivery.
2. Provide your order number and clear photographs showing the issue.
3. We will investigate your claim and, if approved, offer a replacement (subject to availability) or refund.

We take quality very seriously and encourage you to report any quality concerns promptly.`,
      },
      {
        id: "return-request-process",
        title: "Return Request Process",
        order: 12,
        content: `
To initiate a return:

1. Contact our support team at ${BUSINESS.email} with the subject line "Return Request – [Order Number]".
2. Provide the following information:
   - Order number
   - Product name and quantity
   - Reason for return
   - Photographs or videos showing the issue (where applicable)
3. Our team will review your request within [RESPONSE TIMELINE] and respond with instructions.
4. If the return is approved, you will receive a return shipping address and further instructions.
5. Pack the product securely in its original packaging, including all accessories and documents.
6. Ship the product back using the prescribed method.`,
      },
      {
        id: "inspection",
        title: "Inspection",
        order: 13,
        content: `
Returned products will be inspected upon receipt. We reserve the right to reject a return if:

- The product does not meet the condition requirements stated in this policy.
- The return window has expired.
- The product shows signs of use, tampering, or damage caused by the customer.
- The product is missing parts, accessories, or original packaging.

If the return is rejected, we will notify you and may arrange for the product to be returned to you at your cost.`,
      },
      {
        id: "replacement",
        title: "Replacement",
        order: 14,
        content: `
In cases where a replacement is offered:

- Replacements are subject to product availability.
- If the original product is out of stock, we may offer an alternative of equivalent value or a full refund.
- Replacement shipping will be arranged at no additional cost to you.
- Replacement timelines are subject to our standard delivery timelines.`,
      },
      {
        id: "refund",
        title: "Refunds",
        order: 15,
        content: `
**Refund Approval**

Refunds are issued once the return is approved after inspection, or when we determine that a refund is appropriate without requiring a return (e.g., for damaged perishable products).

**Refund Method**

Refunds will be processed to the original payment method used at the time of purchase.

**Processing Timeline**

Once your refund is approved, it will be processed within [REFUND PROCESSING TIMELINE TO BE CONFIRMED]. The time it takes for the refund to appear in your account depends on your bank or payment provider.

**Refund Amount**

- For eligible returns, the refund includes the product price paid.
- Original shipping charges are non-refundable unless the return is due to our error (wrong product, damaged product, etc.).
- Any promotional discounts applied to the order will be factored into the refund amount.`,
      },
      {
        id: "partial-refunds",
        title: "Partial Refunds",
        order: 16,
        content: `
Partial refunds may be issued in the following circumstances:

- Part of the order is returned, and the remaining items are kept.
- The product is returned in a condition that does not meet full return criteria but some value can be recovered.
- A quality issue affects only part of the order.

Partial refund amounts will be calculated based on the value of the affected items.`,
      },
      {
        id: "failed-refunds",
        title: "Failed Refunds",
        order: 17,
        content: `
In rare cases where a refund fails (e.g., due to an expired or invalid payment method):

1. We will notify you of the failure.
2. We may request you to provide alternative refund details (e.g., bank account information for a direct transfer).
3. We will process the refund once valid details are received.

We are not responsible for delays caused by incorrect or outdated payment information provided by you.`,
      },
      {
        id: "order-cancellation",
        title: "Order Cancellation",
        order: 18,
        content: `
**Before Processing**

Orders can be cancelled free of charge before they are processed. To cancel, please contact us promptly with your order number.

**After Processing / Packing**

Once an order has been processed or packed but not yet shipped, cancellation may be possible but may be subject to a handling fee.

**After Shipping**

Once an order has been shipped, it cannot be cancelled. Please refer to the return process above if you wish to return the product after delivery.

**How to Cancel**

You may cancel your order by:
- Contacting us at ${BUSINESS.email} with your order number.
- Accessing your account's order history and requesting cancellation (if supported).

We will confirm the cancellation and any applicable refund.`,
      },
      {
        id: "failed-delivery",
        title: "Failed Delivery",
        order: 19,
        content: `
If a delivery fails due to:

- **Incorrect address provided by you:** We will attempt to contact you for a corrected address. Additional shipping charges may apply for re-delivery. If we are unable to reach you, the order may be returned to us, and a refund (minus shipping charges) will be issued.
- **Recipient unavailable:** The delivery partner may make multiple attempts. If delivery is unsuccessful after reasonable attempts, the package may be returned to us.
- **Delivery rejected by recipient:** If you refuse delivery, the order will be returned to us, and a refund (minus shipping and return charges) will be issued.`,
      },
      {
        id: "return-shipping",
        title: "Return Shipping",
        order: 20,
        content: `
**Returns Due to Our Error**

If the return is due to our error (wrong product, defective product, damaged product), we will bear the return shipping costs. We will provide a prepaid shipping label or arrange for pickup.

**Returns for Other Reasons**

If you are returning a product for other reasons (change of mind, no longer needed), you will be responsible for the return shipping costs. We recommend using a trackable shipping method. We are not responsible for items lost or damaged during return transit.`,
      },
      {
        id: "fraudulent-or-abusive",
        title: "Fraudulent or Abusive Requests",
        order: 21,
        content: `
We reserve the right to reject return or refund requests that appear fraudulent, abusive, or are made in bad faith. Indicators may include:

- Repeated returns of the same product.
- Pattern of returning used or partially consumed products.
- Providing false or misleading information about product condition.
- Attempting to return products not purchased from our website.

We may suspend or terminate accounts that engage in abusive return behavior.`,
      },
      {
        id: "contact",
        title: "Contact Us",
        order: 22,
        content: CONTACT_BLOCK,
      },
    ],
  },

  // ===================================================================
  // POLICY 4: SHIPPING & DELIVERY POLICY
  // ===================================================================
  {
    title: "Shipping & Delivery Policy",
    slug: "shipping-delivery-policy",
    metaDescription:
      "Learn about shipping charges, delivery timelines, serviceable areas, and delivery procedures for Maanjoo Farms orders.",
    sections: [
      {
        id: "overview",
        title: "Overview",
        order: 1,
        content: `
This Shipping & Delivery Policy applies to all product orders placed on ${BUSINESS.name}. It explains how we process, ship, and deliver your orders, along with the terms governing delivery.

We work with third-party logistics partners to deliver our organic farm products to customers across serviceable locations in India.`,
      },
      {
        id: "serviceable-locations",
        title: "Serviceable Locations",
        order: 2,
        content: `
We currently deliver to select locations across India. During checkout, you can verify whether your delivery pincode is serviceable.

If your pincode is not serviceable, you will be notified at checkout and will not be able to place the order. We are continuously working to expand our delivery network to serve more locations.

If you would like to suggest a new delivery location, please contact us and we will evaluate the feasibility.`,
      },
      {
        id: "order-processing",
        title: "Order Processing",
        order: 3,
        content: `
**Processing Time**

Orders are typically processed within 1-2 business days after payment confirmation. Processing includes order verification, packing, and handover to our delivery partner.

**Order Verification**

Before processing, we may verify:
- Payment status (must be confirmed as "paid").
- Product availability (stock confirmation).
- Delivery address completeness and accuracy.
- Pincode serviceability.

**Processing Delays**

Processing may be delayed during peak periods, public holidays, or unforeseen circumstances. We will notify you of any significant delays.`,
      },
      {
        id: "estimated-delivery",
        title: "Estimated Delivery Timelines",
        order: 4,
        content: `
Delivery timelines are estimates and are not guaranteed. Actual delivery times may vary based on location, logistics partner capacity, and external factors.

**General Estimates**

- Local deliveries (within [CITY/REGION]): [ESTIMATED LOCAL DELIVERY TIMELINE]
- Nearby cities and towns: [ESTIMATED REGIONAL DELIVERY TIMELINE]
- Remote or distant locations: [ESTIMATED REMOTE DELIVERY TIMELINE]

**Factors Affecting Delivery**

Delivery timelines may be affected by:
- Delivery location and distance from our farm.
- Logistics partner capacity and routing.
- Weather conditions and road conditions.
- Public holidays and local festivals.
- Unforeseen events (see Force Majeure section).

Once your order is shipped, you will receive a tracking number to monitor the delivery status.`,
      },
      {
        id: "shipping-charges",
        title: "Shipping Charges",
        order: 5,
        content: `
Shipping charges are calculated based on the following factors:
- Order weight and dimensions.
- Delivery location (pincode zone).
- Order value (free shipping may apply above a certain threshold).

The applicable shipping fee will be displayed at checkout before you complete your purchase. We strive to keep shipping charges reasonable and transparent.

**Free Shipping**

We may offer free shipping on orders above a minimum order value. The applicable threshold and any exclusions will be communicated on the website at the time of order.`,
      },
      {
        id: "order-tracking",
        title: "Order Tracking",
        order: 6,
        content: `
Once your order is shipped, you will receive:
- An email notification with your tracking number and tracking URL.
- The ability to track your order status through your account's order history.

Tracking information is provided by our logistics partner and may take up to 24 hours after shipment to become active. If tracking information does not update for an extended period, please contact us.`,
      },
      {
        id: "delivery-delays",
        title: "Delivery Delays",
        order: 7,
        content: `
While we strive to meet estimated delivery times, delays may occasionally occur. Common causes include:

- **Weather conditions:** Heavy rain, storms, or extreme weather.
- **Logistical issues:** High volumes, routing changes, or partner capacity constraints.
- **Public holidays:** Deliveries may be delayed during national or local holidays.
- **Address issues:** Incomplete or incorrect address details may cause delays.
- **Customer unavailability:** If no one is available to receive the delivery.

If your order is significantly delayed beyond the estimated timeline, please contact us and we will investigate with our logistics partner.`,
      },
      {
        id: "incorrect-address",
        title: "Incorrect Address",
        order: 8,
        content: `
You are responsible for providing accurate and complete delivery information at the time of ordering. We will not be liable for delays or non-delivery resulting from incorrect, incomplete, or outdated address information.

If you realize that the delivery address is incorrect after placing the order, please contact us immediately. We will attempt to update the address if the order has not yet been shipped. Once shipped, address changes cannot be guaranteed.

If a package is returned to us due to an incorrect address, re-delivery to a corrected address will be subject to additional shipping charges.`,
      },
      {
        id: "failed-delivery",
        title: "Failed Delivery",
        order: 9,
        content: `
A delivery may fail for the following reasons:

1. **Recipient not available:** The delivery partner may make multiple attempts. After failed attempts, the package will be returned to us.
2. **Address not found:** If the delivery address is incomplete or cannot be located.
3. **Delivery rejected:** If the recipient refuses to accept the package.
4. **Area restricted:** If the delivery location is temporarily inaccessible.

In case of failed delivery, we will contact you to arrange re-delivery. Re-delivery may be subject to additional shipping charges. If we are unable to contact you within a reasonable period, the order may be cancelled and a refund (minus shipping charges) will be issued.`,
      },
      {
        id: "customer-unavailable",
        title: "Customer Unavailable at Delivery",
        order: 10,
        content: `
If you are unavailable to receive the delivery at the time of attempted delivery:

- The delivery partner may contact you to reschedule.
- A re-delivery attempt may be made on the next working day.
- If multiple delivery attempts fail, the package will be returned to us.

To avoid failed delivery, please:
- Provide a delivery address where someone will be available during business hours.
- Provide an alternate contact number if possible.
- Track your order and coordinate with the delivery partner if necessary.`,
      },
      {
        id: "damaged-package",
        title: "Damaged Package",
        order: 11,
        content: `
If your package arrives damaged:

1. Inspect the package before accepting delivery.
2. If visible damage is present, note it on the delivery receipt before signing.
3. If the contents are damaged, take photographs of both the package and the damaged products.
4. Contact us within 24 hours of delivery with your order number, photographs, and a description of the damage.
5. We will investigate and process a replacement or refund as appropriate.

If you accept a visibly damaged package without noting the damage on the delivery receipt, it may affect our ability to process your claim.`,
      },
      {
        id: "missing-package",
        title: "Missing Package",
        order: 12,
        content: `
If your package is marked as delivered but you have not received it:

1. Check with other household members, neighbors, or building security.
2. Check the delivery location specified in the tracking details.
3. Contact us within 48 hours of the delivery attempt with your order number.
4. We will initiate an investigation with our logistics partner.
5. If the package is confirmed lost, we will offer a replacement or refund.`,
      },
      {
        id: "partial-delivery",
        title: "Partial Delivery",
        order: 13,
        content: `
In some cases, your order may be delivered in multiple shipments. This may occur when:

- Products are sourced from different locations.
- Some items require special packaging.
- Certain products are temporarily out of stock.

You will not be charged additional shipping for partial deliveries. You will receive separate tracking information for each shipment when applicable.`,
      },
      {
        id: "multiple-shipments",
        title: "Multiple Shipments",
        order: 14,
        content: `
For orders containing multiple products, we may ship items separately. In such cases:

- Each shipment will have its own tracking number.
- Delivery timelines may vary between shipments.
- You will receive separate notifications for each shipment.

No additional shipping charges will apply for multiple shipments from the same order.`,
      },
      {
        id: "force-majeure",
        title: "Force Majeure",
        order: 15,
        content: `
We shall not be liable for delays or failures in delivery caused by events beyond our reasonable control, including but not limited to:

- Natural disasters, severe weather, floods, or earthquakes.
- Government restrictions, lockdowns, or transportation bans.
- Strikes, labor disputes, or logistical disruptions.
- Pandemics, epidemics, or public health emergencies.
- Civil unrest or security situations.
- Technical failures in third-party logistics systems.

In such events, we will make reasonable efforts to resume delivery as soon as practicable and keep you informed of any significant impacts.`,
      },
      {
        id: "contact",
        title: "Contact Us",
        order: 16,
        content: CONTACT_BLOCK,
      },
    ],
  },

  // ===================================================================
  // POLICY 5: PAYMENT POLICY
  // ===================================================================
  {
    title: "Payment Policy",
    slug: "payment-policy",
    metaDescription:
      "Understand the payment methods, processing, security practices, and refund procedures for transactions on Maanjoo Farms.",
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        order: 1,
        content: `
This Payment Policy describes the payment methods we accept, how payments are processed, and our practices regarding payment security, verification, and dispute handling at ${BUSINESS.name}.

All payments for products and bookings made through our website are processed through Razorpay, our third-party payment gateway.`,
      },
      {
        id: "accepted-payment-methods",
        title: "Accepted Payment Methods",
        order: 2,
        content: `
We accept the following payment methods through Razorpay:

- **Credit Cards:** Visa, Mastercard, RuPay, and other major cards.
- **Debit Cards:** Visa, Mastercard, RuPay, and other major cards.
- **Net Banking:** Major Indian banks including SBI, HDFC, ICICI, Axis, and others.
- **UPI:** Google Pay, PhonePe, Paytm, BHIM, and other UPI applications.
- **Digital Wallets:** Paytm Wallet, Mobikwik, Freecharge, and others (as supported by Razorpay).
- **EMI:** Selected banks may offer EMI options for credit card purchases (subject to Razorpay's eligibility criteria).

All transactions are processed in Indian Rupees (INR).`,
      },
      {
        id: "razorpay-processing",
        title: "Payment Processing (Razorpay)",
        order: 3,
        content: `
All payments on our website are processed through **Razorpay**, a PCI DSS-compliant payment gateway. Here is how payment processing works:

1. At checkout, you will be redirected to Razorpay's secure payment interface.
2. You select your preferred payment method and complete the transaction.
3. Razorpay processes the payment and sends a confirmation to our server.
4. We verify the payment signature to confirm authenticity.
5. Your order or booking is confirmed only after successful verification.

**What We Store:**
- Razorpay order ID (for transaction reference)
- Razorpay payment ID (for reconciliation and refunds)
- Payment signature (for verification)

**What We Do NOT Store:**
- Full credit/debit card numbers
- CVV codes
- Bank account numbers
- UPI PINs or passwords`,
      },
      {
        id: "payment-authorization",
        title: "Payment Authorization",
        order: 4,
        content: `
When you initiate a payment:

- The payment amount is authorized and captured at the time of transaction.
- For card payments, an authorization hold may be placed on your card temporarily.
- The payment is captured only upon successful verification.
- If the payment fails or is cancelled, any authorization hold will be released by your bank as per their policies (typically 3-7 business days).

We only capture payments that are successfully authorized and verified.`,
      },
      {
        id: "payment-confirmation",
        title: "Payment Confirmation",
        order: 5,
        content: `
A payment is considered confirmed when:

1. Razorpay returns a successful payment response.
2. We verify the payment signature using Razorpay's secret key.
3. The payment status in our system is updated to "paid."

You will receive:
- An on-screen confirmation message after successful payment.
- A confirmation email with your order or booking details.
- The ability to view payment status in your account's order history.`,
      },
      {
        id: "payment-failure",
        title: "Payment Failure",
        order: 6,
        content: `
If a payment fails, the following may apply:

- **Order not placed:** Your order or booking will not be processed.
- **No charge:** If the payment was not captured, no amount will be charged.
- **Authorization hold:** If your card shows a debit but the payment failed, it is likely an authorization hold. This will be released by your bank within 3-7 business days.
- **If amount was debited:** In rare cases where an amount is debited but the payment is marked as failed, the amount will be refunded automatically through Razorpay's reconciliation process.

Common reasons for payment failure include:
- Insufficient balance or credit limit.
- Incorrect card details or OTP.
- Bank decline or security restrictions.
- Network or timeout issues.
- Technical issues with the payment gateway.

If you experience repeated payment failures, please try an alternative payment method or contact your bank.`,
      },
      {
        id: "payment-timeout",
        title: "Payment Timeout",
        order: 7,
        content: `
Payment sessions have a time limit. If you do not complete the payment within the allotted time:

- The payment session will expire.
- Your cart or booking will not be affected, but you will need to initiate a new payment.
- Any pending authorization holds will be released by your bank.

We recommend completing the payment process promptly to avoid timeouts.`,
      },
      {
        id: "duplicate-payment",
        title: "Duplicate Payment",
        order: 8,
        content: `
In the unlikely event that you are charged multiple times for the same order or booking:

1. Please contact us immediately with the transaction details, including Razorpay payment IDs if available.
2. We will verify the duplicate charges with Razorpay.
3. Once confirmed, we will initiate a refund for the duplicate payment(s).
4. Refunds for duplicate payments will be processed to the original payment method.

Duplicate payments are rare and are typically caused by browser issues, network interruptions, or clicking the pay button multiple times. We recommend waiting for the payment confirmation screen before closing or refreshing the page.`,
      },
      {
        id: "payment-verification",
        title: "Payment Verification",
        order: 9,
        content: `
We use a multi-step payment verification process to ensure transaction security:

1. **Signature Verification:** We verify the payment signature using Razorpay's webhook and HMAC SHA256 encryption.
2. **Order Matching:** We confirm that the payment corresponds to a valid order or booking in our system.
3. **Duplicate Check:** We verify that the payment has not been processed previously.
4. **Status Update:** Once verified, the payment status is updated in our system.

If payment verification fails, the order or booking will not be confirmed, and the transaction will be investigated.`,
      },
      {
        id: "refunds",
        title: "Refunds",
        order: 10,
        content: `
Refunds are processed through Razorpay's refund system. Here is how refunds work:

- **Eligibility:** Refunds are issued based on eligibility as described in our Return & Refund Policy and Villa Booking Cancellation Policy.
- **Processing:** We initiate refunds through Razorpay using the original payment ID.
- **Timeline:** Refunds are typically processed within [REFUND PROCESSING TIMELINE TO BE CONFIRMED]. The time for the amount to reflect in your account depends on your bank or payment provider.
- **Method:** Refunds are sent to the original payment method used at the time of purchase.
- **Notification:** You will receive an email notification when a refund is initiated.

Please note that refunds for booking cancellations are subject to the terms of our Villa Booking Cancellation Policy.`,
      },
      {
        id: "fraud-prevention",
        title: "Fraud Prevention",
        order: 11,
        content: `
We employ several measures to prevent fraudulent transactions:

- **Payment Signature Verification:** Every payment is cryptographically verified.
- **Duplicate Payment Detection:** We check for previously processed transactions.
- **Webhook Validation:** Payment webhooks from Razorpay are validated to prevent fake notifications.
- **Transaction Monitoring:** Suspicious transaction patterns may be flagged for review.
- **Account Security:** User accounts are protected by password hashing and authentication.

We reserve the right to:
- Cancel orders or bookings suspected of fraud.
- Seek verification of payment or identity before processing orders.
- Report fraudulent activity to relevant authorities.`,
      },
      {
        id: "payment-security",
        title: "Payment Security",
        order: 12,
        content: `
We take payment security seriously. Key security measures include:

- **HTTPS Encryption:** All payment pages are served over secure HTTPS connections.
- **PCI DSS Compliance:** Razorpay, our payment gateway, is PCI DSS compliant.
- **Tokenization:** Sensitive payment data is tokenized by Razorpay.
- **No Storage of Sensitive Data:** We do not store full card numbers, CVV codes, or banking credentials.
- **Regular Security Reviews:** We periodically review our security practices.

While we implement reasonable security measures, no online transaction can be guaranteed 100% secure. Please take appropriate precautions when transacting online.`,
      },
      {
        id: "currency",
        title: "Currency",
        order: 13,
        content: `
All prices and transactions on our website are processed in **Indian Rupees (INR)**. If you are using an international card or payment method, your bank may apply currency conversion charges. We are not responsible for any foreign exchange fees, conversion charges, or other fees imposed by your bank or payment provider.`,
      },
      {
        id: "taxes",
        title: "Taxes",
        order: 14,
        content: `
Applicable taxes, including Goods and Services Tax (GST), are calculated and displayed at checkout before payment is completed. The tax amount is included in the total order value.

- GST is applied based on the applicable rate for each product category.
- Tax invoices are generated for completed orders and can be downloaded from your account.
- We are not responsible for any additional taxes, duties, or fees that may be levied by local authorities.`,
      },
      {
        id: "contact",
        title: "Contact Us",
        order: 15,
        content: CONTACT_BLOCK,
      },
    ],
  },

  // ===================================================================
  // POLICY 6: VILLA BOOKING CANCELLATION POLICY
  // ===================================================================
  {
    title: "Villa Booking Cancellation Policy",
    slug: "villa-booking-cancellation-policy",
    metaDescription:
      "Review the cancellation, rescheduling, and refund policy for villa and room bookings at Maanjoo Farms.",
    sections: [
      {
        id: "overview",
        title: "Overview",
        order: 1,
        content: `
This Villa Booking Cancellation Policy governs the cancellation, rescheduling, and refund terms for villa stays, room bookings, and other accommodation reservations at ${BUSINESS.name}.

All bookings are confirmed only after payment is successfully processed and verified. By making a booking, you agree to the terms of this policy.`,
      },
      {
        id: "booking-confirmation",
        title: "Booking Confirmation",
        order: 2,
        content: `
A booking is considered confirmed when:

1. You complete the booking process on our website.
2. Payment is successfully processed through Razorpay.
3. Payment is verified through our signature verification process.
4. You receive a confirmation email with your booking details.

If payment is not successfully processed, the booking will remain in a pending state and will be automatically cancelled after [PENDING BOOKING EXPIRY TIME].`,
      },
      {
        id: "payment-requirements",
        title: "Payment Requirements",
        order: 3,
        content: `
**Full Payment at Booking**

Full payment for the total booking amount is required at the time of reservation. Payment can be made using the methods described in our Payment Policy.

**Payment Status**

- If payment is successful and verified, the booking is confirmed.
- If payment fails, the booking is not confirmed, and no amount is charged.
- If payment is pending, the booking is held temporarily and may expire.`,
      },
      {
        id: "guest-information",
        title: "Guest Information",
        order: 4,
        content: `
You may be required to provide information about all guests staying at the property, including:

- Full name of each guest
- Age of each guest
- Gender of each guest (where required)

Providing accurate guest information is important for:
- Compliance with local regulations and registration requirements.
- Ensuring appropriate accommodation arrangements.
- Safety and security purposes.

You are responsible for ensuring that all guest information provided is accurate and complete. Inaccurate information may result in restrictions on check-in.`,
      },
      {
        id: "cancellation",
        title: "Cancellation by Customer",
        order: 5,
        content: `
If you need to cancel your booking, please contact us as early as possible. The applicable cancellation charges depend on how far in advance the cancellation is made.

The specific cancellation percentages and timelines are determined by the management and may be updated from time to time. Below are the general guidelines:

**[CANCELLATION PERIOD 1] before check-in:** [CANCELLATION TERMS 1]
**[CANCELLATION PERIOD 2] before check-in:** [CANCELLATION TERMS 2]
**[CANCELLATION PERIOD 3] before check-in:** [CANCELLATION TERMS 3]

**Same-Day Cancellation:** Cancellations made on the date of check-in will be treated as a no-show and are non-refundable.

To cancel a booking, please contact us at ${BUSINESS.email} with your booking ID and reason for cancellation.

[NOTE: The specific cancellation percentages and timelines are configurable and will be set by the management. Please refer to the booking confirmation or contact us for the current cancellation terms applicable to your booking.]`,
      },
      {
        id: "date-modification",
        title: "Date Modification / Rescheduling",
        order: 6,
        content: `
Requests to modify booking dates are considered subject to availability.

- **Modification requests made [MODIFICATION NOTICE PERIOD] before check-in:** May be accommodated if the property is available for the new dates.
- **Price difference:** If the new dates have a different rate, the price difference (positive or negative) will apply.
- **Modification less than [MODIFICATION WINDOW] before check-in:** May be treated as a cancellation and re-booking.

To request a date modification, please contact us with your booking ID and proposed new dates. We will confirm availability and any applicable charges.`,
      },
      {
        id: "no-show",
        title: "No-Show",
        order: 7,
        content: `
If you do not check in on the scheduled arrival date without notifying us:

- The booking will be considered a no-show.
- The booking is non-refundable, and no refund will be provided.
- The property will be released for other guests after a reasonable waiting period.

If you expect to arrive late or on a different date, please inform us in advance. We may be able to accommodate late arrivals or adjust the booking subject to availability and policy terms.`,
      },
      {
        id: "late-arrival",
        title: "Late Arrival",
        order: 8,
        content: `
If you arrive later than the expected check-in time:

- Please inform us of your expected arrival time.
- Your booking will be held for you until the next day.
- Late arrival does not entitle you to a late checkout or refund for the unused portion of the first night.

For significantly delayed arrivals (more than 24 hours without communication), the booking may be treated as a no-show.`,
      },
      {
        id: "early-departure",
        title: "Early Departure",
        order: 9,
        content: `
If you choose to check out earlier than your scheduled departure date:

- No refund will be provided for the unused portion of your stay.
- Early departure does not affect charges for the nights stayed.

We recommend confirming your travel plans before booking to avoid early departure. If you are unsure about your departure date, please contact us to discuss flexible options.`,
      },
      {
        id: "refund-eligibility",
        title: "Refund Eligibility",
        order: 10,
        content: `
Refunds for cancelled bookings are governed by the cancellation terms described above.

**General Guidelines:**

- Refunds are processed only for cancellations that fall within the applicable refund period.
- Refunds do not include any non-refundable portions as specified in the cancellation terms.
- Refunds are processed to the original payment method used at the time of booking.

**Processing Timeline:**

Approved refunds will be processed within [REFUND PROCESSING TIMELINE TO BE CONFIRMED] from the date of cancellation. The actual time for the amount to reflect in your account depends on your bank or payment provider.`,
      },
      {
        id: "non-refundable-bookings",
        title: "Non-Refundable Bookings",
        order: 11,
        content: `
Certain bookings may be offered at a discounted rate on a non-refundable basis. Non-refundable bookings:

- Are clearly marked as non-refundable at the time of booking.
- Are not eligible for any refund if cancelled, regardless of the cancellation period.
- May not be rescheduled or modified (except at our discretion).
- Are typically offered at a lower price than refundable bookings.

Please ensure you understand the booking terms before confirming a non-refundable booking.`,
      },
      {
        id: "cancellation-by-us",
        title: "Cancellation by Maanjoo Farms",
        order: 12,
        content: `
In the rare event that we must cancel your booking, we will make every effort to notify you as early as possible. Reasons may include:

- The property becomes unavailable due to unforeseen circumstances (maintenance issues, safety concerns, etc.).
- Overbooking due to a system error.
- Government restrictions or orders.
- Events beyond our reasonable control.

If we cancel your booking:
- You will receive a full refund of all amounts paid.
- Alternatively, we may offer to reschedule your stay to available dates at the same rate.
- We will not be liable for any additional costs incurred (travel, transportation, alternative accommodation, etc.).`,
      },
      {
        id: "force-majeure",
        title: "Force Majeure",
        order: 13,
        content: `
We shall not be liable for any failure to perform our obligations under a booking caused by events beyond our reasonable control, including but not limited to:

- Natural disasters, floods, storms, fires, or earthquakes.
- Pandemics, epidemics, or public health emergencies.
- Government restrictions, lockdowns, or travel bans.
- War, terrorism, civil unrest, or military actions.
- Utility failures (power, water, internet) beyond our control.
- Significant structural or safety issues with the property.

In such events, we will work with you to find a reasonable solution, which may include rescheduling or a refund at our discretion. Force majeure events are assessed on a case-by-case basis.`,
      },
      {
        id: "check-in-requirements",
        title: "Check-In Requirements",
        order: 14,
        content: `
At the time of check-in, all guests must:

- Present a valid government-issued photo ID (Aadhaar, Passport, Driver's License, Voter ID).
- Provide the contact information requested by the property.
- Confirm the guest details provided during booking.
- Agree to abide by the property rules.

Check-in may be denied if:
- The guest cannot present valid identification.
- The guest details do not match the booking information.
- The guest is under the influence of substances and poses a risk to property or other guests.
- The guest refuses to comply with property rules.

If check-in is denied due to guest non-compliance, the booking will be treated as a no-show and no refund will be issued.`,
      },
      {
        id: "check-out-requirements",
        title: "Check-Out Requirements",
        order: 15,
        content: `
At check-out, guests are expected to:

- Vacate the property by the scheduled check-out time.
- Return all keys and access cards to the designated location.
- Settle any additional charges incurred during the stay (if applicable).
- Report any damage caused during the stay.

Late check-out is subject to availability and may incur additional charges. Please inform us in advance if you require late check-out.`,
      },
      {
        id: "property-rules",
        title: "Property Rules",
        order: 16,
        content: `
All guests must comply with the following property rules:

- **Smoking:** Smoking is not permitted inside rooms or villas. Designated smoking areas may be available.
- **Noise:** Please maintain reasonable noise levels, especially during nighttime hours.
- **Visitors:** Unregistered visitors are not permitted in guest rooms after [VISITOR CURFEW HOURS].
- **Pets:** [PET POLICY — please confirm with management].
- **Facilities:** Use all facilities (pool, garden, common areas) responsibly and follow posted guidelines.
- **Damage:** Guests are responsible for any damage to the property caused during their stay.
- **Prohibited Activities:** Illegal activities, including the use of prohibited substances, are strictly forbidden and will result in immediate eviction without refund.

Violation of property rules may result in:
- A warning from staff.
- Immediate termination of the stay without refund.
- Legal action if applicable.
- Charges for damages or additional cleaning.`,
      },
      {
        id: "security-deposit",
        title: "Security Deposit",
        order: 17,
        content: `
[SECURITY DEPOSIT POLICY TO BE CONFIRMED]

If a security deposit is applicable, it will be communicated at the time of booking or check-in. The deposit will be refunded after check-out, subject to inspection and deduction for any damages, missing items, or policy violations.`,
      },
      {
        id: "contact",
        title: "Contact Us",
        order: 18,
        content: CONTACT_BLOCK,
      },
    ],
  },

  // ===================================================================
  // POLICY 7: GRIEVANCE REDRESSAL
  // ===================================================================
  {
    title: "Grievance Redressal",
    slug: "grievance-redressal",
    metaDescription:
      "Learn how to file a complaint or grievance with Maanjoo Farms and how we address customer concerns promptly and fairly.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        order: 1,
        content: `
${BUSINESS.name} is committed to providing excellent products and services to all our customers. We strive to address all customer concerns, complaints, and grievances promptly, fairly, and transparently.

This Grievance Redressal Policy outlines the process for submitting a complaint and how we will handle it. We value your feedback as it helps us improve our services.`,
      },
      {
        id: "customer-support",
        title: "Customer Support",
        order: 2,
        content: `
Before filing a formal grievance, we encourage you to contact our customer support team for assistance with general inquiries, order issues, booking questions, or other concerns.

For general inquiries and support, please contact us at:

**Email:** ${BUSINESS.email}
**Phone:** ${BUSINESS.phone}

Our customer support team is available [SUPPORT HOURS TO BE CONFIRMED].`,
      },
      {
        id: "how-to-submit",
        title: "How to Submit a Grievance",
        order: 3,
        content: `
If your concern is not resolved through customer support, or if you wish to file a formal grievance, you may submit it through the following channels:

**By Email:**

Send an email to **${BUSINESS.grievanceEmail}** with the subject line "Grievance – [Brief Description]".

**By Post:**

Write to us at:
${BUSINESS.legalName || BUSINESS.name}
${BUSINESS.address}

**Through Website:**

You may also use the contact form on our website to submit your grievance.`,
      },
      {
        id: "information-to-include",
        title: "Information to Include",
        order: 4,
        content: `
To help us process your grievance efficiently, please include the following information:

1. **Your Name and Contact Information:** Full name, email address, and phone number.
2. **Account or Transaction Details:** Your registered email address, order number (if applicable), or booking ID (if applicable).
3. **Description of the Issue:** A clear and detailed description of the problem or concern.
4. **Supporting Evidence:** Photographs, screenshots, documents, or other relevant evidence that supports your grievance.
5. **Expected Resolution:** What outcome you are seeking (e.g., refund, replacement, explanation, apology).
6. **Date of Incident:** When the issue occurred.
7. **Previous Communications:** Any reference numbers, previous email threads, or names of support staff you have already contacted.

Providing complete information will help us address your grievance more quickly and accurately.`,
      },
      {
        id: "complaint-categories",
        title: "Complaint Categories",
        order: 5,
        content: `
Grievances may relate to any of the following categories:

**Product Issues**
- Product quality concerns
- Damaged or defective products
- Incorrect product received
- Expired or spoiled products
- Missing items from order

**Order Issues**
- Order not received
- Delayed delivery
- Incorrect order processing
- Partial delivery
- Order cancellation issues

**Payment Issues**
- Payment failure or double charge
- Refund not received
- Incorrect amount charged
- Payment verification issues

**Delivery Issues**
- Delayed delivery
- Damaged package
- Delivery to wrong address
- Delivery partner behavior

**Refund Issues**
- Refund delay
- Incorrect refund amount
- Refund method issues

**Villa Booking Issues**
- Booking confirmation problems
- Check-in / check-out issues
- Property condition or amenities
- Guest experience concerns
- Booking cancellation issues

**Other Issues**
- Website or technical issues
- Account issues
- Communication concerns
- Staff conduct
- Any other concern related to our services`,
      },
      {
        id: "response-process",
        title: "Response & Resolution Process",
        order: 6,
        content: `
Once we receive your grievance, we follow this process:

**Step 1: Acknowledgment**

We will acknowledge receipt of your grievance within [ACKNOWLEDGMENT TIMELINE] of receiving it. The acknowledgment will include a reference number that you can use for follow-ups.

**Step 2: Review & Investigation**

Our team will review the information provided, investigate the issue, and may contact you for additional details if needed. We may consult with relevant departments (operations, logistics, bookings, etc.) as part of the investigation.

**Step 3: Resolution**

We will provide a resolution or response within [RESOLUTION TIMELINE TO BE CONFIRMED] from the date of acknowledgment. If the issue requires more time due to complexity or the need for further investigation, we will inform you of the expected timeline.

**Step 4: Closure**

Once the resolution is communicated, the grievance will be closed. We may follow up to ensure you are satisfied with the resolution.`,
      },
      {
        id: "escalation",
        title: "Escalation",
        order: 7,
        content: `
If you are not satisfied with the initial resolution provided, you may escalate your grievance:

**Level 1 — Management Review**

Email your grievance reference number to ${BUSINESS.email} with the subject line "Escalation: [Reference Number]". Include the reason why you are not satisfied with the initial resolution. Our management team will review your case and respond within [ESCALATION RESPONSE TIMELINE TO BE CONFIRMED].

**Level 2 — Final Review**

If the issue remains unresolved after management review, a final review will be conducted by the senior management / ownership. The decision at this level will be final.

We are committed to resolving all grievances fairly and will make every reasonable effort to address your concerns.`,
      },
      {
        id: "contact",
        title: "Contact Information",
        order: 8,
        content: `
**Grievance Contact Details:**

**Email:** ${BUSINESS.grievanceEmail}
**Phone:** ${BUSINESS.phone}
**Address:** ${BUSINESS.legalName || BUSINESS.name}, ${BUSINESS.address}

**For General Inquiries:**

**Email:** ${BUSINESS.email}
**Phone:** ${BUSINESS.phone}

We are committed to addressing your concerns promptly and fairly. Thank you for giving us the opportunity to make things right.`,
      },
    ],
  },
];

async function seed() {
  try {
    await connectDB();
    console.log("📦 Connected to MongoDB");

    for (const policy of policies) {
      const existing = await Policy.findOne({ slug: policy.slug });

      if (existing) {
        // Update existing policy, preserving status
        const prevStatus = existing.status;
        const prevVersion = existing.version;

        Object.assign(existing, {
          ...policy,
          status: prevStatus,
          version: prevVersion,
        });

        await existing.save();

        console.log(
          `🔄 Updated "${policy.title}" (status: ${prevStatus}, v${prevVersion})`
        );
      } else {
        await Policy.create({
          ...policy,
          status: "DRAFT",
          version: 1,
        });

        console.log(`✅ Created "${policy.title}" as DRAFT v1`);
      }
    }

    console.log("\n🎉 Policy seeding complete!");
    console.log("All policies remain in their existing status (DRAFT unless previously published).");
    console.log("Admin must review and publish through the admin panel.\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Policy seeding failed:", err);
    process.exit(1);
  }
}

seed();
