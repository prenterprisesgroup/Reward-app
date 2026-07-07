function presentCompany(company) {
  return {
    id: company._id ? company._id.toString() : company.id,
    displayId: company.displayId || null,
    name: company.name,
    legalName: company.legalName || null,
    industry: company.industry || "Other",
    phone: company.phone || null,
    email: company.email || null,
    website: company.website || null,
    logoUrl: company.logo || null,
    gstNumber: company.gstNumber || null,
    address: company.address || null,
    upiId: company.upiId || null,
    bankAccount: company.bankAccount ? {
      bankName: company.bankAccount.bankName,
      accountNumber: company.bankAccount.accountNumber,
      accountHolderName: company.bankAccount.accountHolderName,
      ifscCode: company.bankAccount.ifscCode
    } : null,
    settlementMethod: company.settlementMethod,
    settings: company.settings,
    status: company.status,
    createdBy: company.createdBy,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}

module.exports = presentCompany;
