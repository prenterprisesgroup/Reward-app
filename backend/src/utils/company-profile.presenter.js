const { decrypt } = require('./crypto');

/**
 * Maps the Company and User objects into a normalized CompanyProfile response.
 * Safely masks the bank account and formats the data for the frontend.
 */
function presentCompanyProfile(company, user) {
  if (!company) return null;

  // Masking the account number
  let maskedAccount = null;
  
  // Phase 1 Migration fallback: If company doesn't have bankAccount, fallback to user.bankAccount
  const bankAccount = company.bankAccount?.accountNumber ? company.bankAccount : user?.bankAccount;
  
  if (bankAccount && bankAccount.accountNumber) {
    const accountStr = decrypt(bankAccount.accountNumber);
    if (accountStr && accountStr.length >= 4 && accountStr !== '***DECRYPTION_ERROR***') {
      maskedAccount = `****${accountStr.slice(-4)}`;
    }
  }

  // Fallback for upiId as well
  const upiId = company.upiId || user?.upiId || null;

  return {
    id: user ? user._id.toString() : null, // The logged-in User ID
    companyId: company._id.toString(),
    companyName: company.name,
    logo: company.logo || null,
    verified: company.status === 'ACTIVE',
    email: company.email || '',
    phone: company.phone || '',
    address: company.address || null,
    gstNumber: company.gstNumber || '',
    createdAt: company.createdAt,
    upiId: upiId,
    bankName: bankAccount?.bankName || '',
    bankAccountMasked: maskedAccount || '',
    ifscCode: bankAccount?.ifscCode || '',
    accountHolderName: bankAccount?.accountHolderName || company.name, // Fallback to company name
    settlementMethod: company.settlementMethod || 'MANUAL',
    language: company.settings?.language || 'en',
    notifications: {
      push: company.settings?.notifications?.push ?? true,
      email: company.settings?.notifications?.email ?? true,
      sms: company.settings?.notifications?.sms ?? false,
    }
  };
}

module.exports = presentCompanyProfile;
