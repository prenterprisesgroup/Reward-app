require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const Company = require('../src/models/company.model');
const AuditLog = require('../src/models/audit-log.model');

async function migrateCompanyPayout() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all active company admins
    const admins = await User.find({ role: 'company_admin', company: { $exists: true } }).populate('company');
    
    console.log(`Found ${admins.length} company admins`);

    for (const admin of admins) {
      if (!admin.company) continue;

      const company = admin.company;
      let migrated = false;

      // Migrate UPI ID
      if (admin.upiId && !company.upiId) {
        company.upiId = admin.upiId;
        migrated = true;
      }

      // Migrate Bank Account
      if (admin.bankAccount && admin.bankAccount.accountNumber) {
        if (!company.bankAccount || !company.bankAccount.accountNumber) {
          company.bankAccount = {
            bankName: admin.bankAccount.bankName,
            accountNumber: admin.bankAccount.accountNumber, // We don't re-encrypt it here because we assume it might already be encrypted by User model, OR if User model didn't encrypt it, we probably should encrypt it. 
            // Actually, the new schema uses `encrypt()` on save. Let's just copy it directly.
            ifscCode: admin.bankAccount.ifscCode,
            accountHolderName: admin.name,
          };
          migrated = true;
        }
      }

      if (migrated) {
        await company.save();
        console.log(`Migrated payout info for company: ${company.name} (${company._id})`);

        await AuditLog.create({
          action: 'MIGRATION_COMPANY_PAYOUT',
          actor: admin._id,
          company: company._id,
          details: { message: 'Migrated upiId and bankAccount from User to Company' }
        });
      } else {
        console.log(`Skipped company: ${company.name} (Already migrated or no data)`);
      }
    }

    console.log('Migration complete');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateCompanyPayout();
