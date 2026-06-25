function presentUser(user) {
  return {
    id: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    company: user.company,
    upiId: user.upiId,
    walletBalance: user.walletBalance,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

module.exports = presentUser;
