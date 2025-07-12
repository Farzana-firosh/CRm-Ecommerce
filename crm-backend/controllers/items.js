const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
} = require('../repositories/items');
const asyncHandler = require('../middlewares/asyncHandler');

exports.create = asyncHandler(async (req, res) => {
  const newItem = await createItem(req.body);
  res.status(201).json(newItem);
});

exports.getAll = asyncHandler(async (req, res) => {
  const items = await getAllItems();
  res.status(200).json(items);
});

exports.getOne = asyncHandler(async (req, res) => {
  const item = await getItemById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.status(200).json(item);
});

exports.update = asyncHandler(async (req, res) => {
  const item = await updateItem(req.params.id, req.body);
  res.status(200).json(item);
});

exports.remove = asyncHandler(async (req, res) => {
  await deleteItem(req.params.id);
  res.status(204).send();
});