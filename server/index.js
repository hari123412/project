import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';

dotenv.config();

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

// Ensure exports directory exists
const exportsDir = join(__dirname, '..', 'exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:admin@sfotech.gupga5f.mongodb.net/datacollection')
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const columnSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  required: { type: Boolean, default: false },
  options: [String],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: Number, default: 0 }
});

const dataEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data: { type: Map, of: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

const exportHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  endDate: { type: Date },
  filename: { type: String, required: true },
  entriesCount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Column = mongoose.model('Column', columnSchema);
const DataEntry = mongoose.model('DataEntry', dataEntrySchema);
const ExportHistory = mongoose.model('ExportHistory', exportHistorySchema);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const verified = jwt.verify(token, 'your-secret-key');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    const savedUser = await user.save();
    const token = jwt.sign({ id: savedUser._id }, 'your-secret-key');
    
    res.json({ 
      token,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Email or password is incorrect' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Email or password is incorrect' });
    }

    const token = jwt.sign({ id: user._id }, 'your-secret-key');
    
    res.json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Column routes
app.post('/api/columns', authenticateToken, async (req, res) => {
  try {
    const column = new Column({
      ...req.body,
      userId: req.user.id,
      order: (await Column.countDocuments({ userId: req.user.id }))
    });
    await column.save();
    res.status(201).json(column);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/columns', authenticateToken, async (req, res) => {
  try {
    const columns = await Column.find({ userId: req.user.id }).sort('order');
    res.json(columns);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/columns/:id', authenticateToken, async (req, res) => {
  try {
    const column = await Column.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json(column);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/columns/:id', authenticateToken, async (req, res) => {
  try {
    await Column.deleteOne({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Column deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Data entry routes
app.post('/api/data-entry', authenticateToken, async (req, res) => {
  try {
    const entry = new DataEntry({
      userId: req.user.id,
      data: req.body.data
    });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/data-entry/today', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const entries = await DataEntry.find({
      userId: req.user.id,
      createdAt: { $gte: today, $lt: tomorrow }
    }).sort('-createdAt');
    
    res.json(entries);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// New route for date range export
app.get('/api/export-range/:startDate/:endDate', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Get columns for the user
    const columns = await Column.find({ userId: req.user.id }).sort('order');
    
    // Get entries for the date range
    const entries = await DataEntry.find({
      userId: req.user.id,
      createdAt: { $gte: start, $lte: end }
    }).sort('createdAt');

    const workbook = new ExcelJS.Workbook();
    
    // Group entries by date
    const entriesByDate = entries.reduce((acc, entry) => {
      const date = format(new Date(entry.createdAt), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      return acc;
    }, {});

    // Create a worksheet for each date
    Object.entries(entriesByDate).forEach(([date, dateEntries]) => {
      const worksheet = workbook.addWorksheet(`Data - ${date}`);

      // Add headers
      const headers = columns.map(col => col.name);
      worksheet.addRow(headers);

      // Add data rows
      dateEntries.forEach(entry => {
        const rowData = columns.map(col => {
          const value = entry.data.get(col.name);
          if (col.type === 'checkbox') {
            return value ? 'Yes' : 'No';
          }
          return value || '';
        });
        worksheet.addRow(rowData);
      });

      // Style headers
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength + 2;
      });
    });

    // Generate Excel file
    const filename = `data_${format(start, 'yyyy-MM-dd')}_to_${format(end, 'yyyy-MM-dd')}.xlsx`;
    const filepath = join(exportsDir, filename);
    await workbook.xlsx.writeFile(filepath);

    // Record export history
    const exportRecord = new ExportHistory({
      userId: req.user.id,
      date: start,
      endDate: end,
      filename,
      entriesCount: entries.length
    });
    await exportRecord.save();

    res.download(filepath, filename, (err) => {
      if (!err) {
        fs.unlink(filepath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
      }
    });
  } catch (err) {
    console.error('Export error:', err);
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/export/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    // Get columns for the user
    const columns = await Column.find({ userId: req.user.id }).sort('order');
    
    // Get entries for the specified date
    const entries = await DataEntry.find({
      userId: req.user.id,
      createdAt: { $gte: startDate, $lt: endDate }
    }).sort('createdAt');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Entries');

    // Add headers
    const headers = columns.map(col => col.name);
    worksheet.addRow(headers);

    // Add data rows
    entries.forEach(entry => {
      const rowData = columns.map(col => {
        const value = entry.data.get(col.name);
        if (col.type === 'checkbox') {
          return value ? 'Yes' : 'No';
        }
        return value || '';
      });
      worksheet.addRow(rowData);
    });

    // Style headers
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    // Generate Excel file
    const filename = `data_${format(startDate, 'yyyy-MM-dd')}.xlsx`;
    const filepath = join(exportsDir, filename);
    await workbook.xlsx.writeFile(filepath);

    // Record export history
    const exportRecord = new ExportHistory({
      userId: req.user.id,
      date: startDate,
      filename,
      entriesCount: entries.length
    });
    await exportRecord.save();

    res.download(filepath, filename, (err) => {
      if (!err) {
        fs.unlink(filepath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
      }
    });
  } catch (err) {
    console.error('Export error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Reports routes
app.get('/api/reports/daily', authenticateToken, async (req, res) => {
  try {
    const dailyStats = await DataEntry.aggregate([
      {
        $match: { 
          userId: new mongoose.Types.ObjectId(req.user.id)
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    res.json(dailyStats);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/export-history', authenticateToken, async (req, res) => {
  try {
    const history = await ExportHistory.find({ userId: req.user.id })
      .sort('-createdAt')
      .limit(50);
    res.json(history);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
