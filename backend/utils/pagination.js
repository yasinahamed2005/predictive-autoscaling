// Shared query-parsing for list endpoints: page/limit/sort/search/filter.
// Usage: const { page, limit, skip, sort } = parseListQuery(req.query, { defaultSort: '-createdAt' });
export const parseListQuery = (query, { defaultSort = '-createdAt', maxLimit = 100 } = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  let sort = query.sort || defaultSort;
  // Allow "price,-rating" -> { price: 1, rating: -1 }
  const sortObj = String(sort)
    .split(',')
    .reduce((acc, field) => {
      if (!field) return acc;
      if (field.startsWith('-')) acc[field.slice(1)] = -1;
      else acc[field] = 1;
      return acc;
    }, {});

  return { page, limit, skip, sort: sortObj };
};

export const buildMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.max(1, Math.ceil(total / limit)),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});
