function presentCompany(company) {
  return {
    id: company._id,
    name: company.name,
    legalName: company.legalName,
    phone: company.phone,
    email: company.email,
    address: company.address,
    status: company.status,
    createdBy: company.createdBy,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}

module.exports = presentCompany;
