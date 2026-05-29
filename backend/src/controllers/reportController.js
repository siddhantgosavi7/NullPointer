import { asyncHandler } from '../middleware/error.js';

// In-memory storage (replace with database in production)
const reports = [];

/**
 * POST /api/reports
 * Create a new report
 */
export const createReport = asyncHandler(async (req, res) => {
  const { title, description, type, data } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      error: {
        message: 'Title and description are required',
        status: 400,
      },
    });
  }

  const report = {
    id: Date.now().toString(),
    title,
    description,
    type: type || 'general',
    data: data || {},
    createdAt: new Date().toISOString(),
  };

  reports.push(report);

  res.status(201).json({
    success: true,
    report,
  });
});

/**
 * GET /api/reports
 * Get all reports
 */
export const getReports = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    reports,
    total: reports.length,
  });
});
