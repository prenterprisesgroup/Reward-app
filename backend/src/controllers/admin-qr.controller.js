const QRService = require("../services/qr.service");

async function listBarcodeBatches(req, res, next) {
  try {
    const filters = {
      companyId: req.query.companyId,
      status: req.query.status,
      search: req.query.search,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };
    
    const pagination = {
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
    };

    const result = await QRService.listBatches(filters, pagination);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function listBarcodeScans(req, res, next) {
  try {
    const filters = {
      companyId: req.query.companyId,
      workerId: req.query.workerId,
      status: req.query.status,
      search: req.query.search,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };
    
    const pagination = {
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
    };

    const result = await QRService.listScans(filters, pagination);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listBarcodeBatches,
  listBarcodeScans,
};
