import mongoose from 'mongoose';
import shortid from 'shortid';

const DateRangeSchema = new mongoose.Schema({
  from: Date,
  to: Date
});

const SectorSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['general', 'numbered'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  capacity: Number,
  rows: Number,
  seats: Number,
  price: {
    type: Number,
    required: true
  }
});

const FunctionSchema = new mongoose.Schema({
  date: Date,
  time: String
});

const DiscountSchema = new mongoose.Schema({
  sectors: String,
  percentage: Number,
  validity: DateRangeSchema
});

const PointOfSaleSchema = new mongoose.Schema({
  location: String,
  dateRange: DateRangeSchema,
  hasStaff: Boolean
});

const AccreditationSectorSchema = new mongoose.Schema({
  name: String,
  capacity: Number
});

const PlanillaSchema = new mongoose.Schema({
  urlId: { 
    type: String, 
    default: shortid.generate, 
    unique: true,
    index: true
  },
  commercialAgreement: {
    percentage1: Number,
    percentage2: Number,
    percentage3: Number
  },
  eventName: {
    type: String,
    required: true
  },
  venue: String,
  eventDate: Date,
  eventTime: String,
  duration: String,
  functions: [FunctionSchema],
  sectors: [SectorSchema],
  discounts: [DiscountSchema],
  extraData: String,
  salesMethods: {
    onlineOnly: Boolean,
    onlineAndPhysical: Boolean,
    physicalOnly: Boolean
  },
  minorsAllowed: Boolean,
  minorsAgeLimit: String,
  pointsOfSale: [PointOfSaleSchema],
  showAccreditations: Boolean,
  accreditations: {
    onlineOnly: Boolean,
    onlineAndPhysical: Boolean,
    physicalOnly: Boolean
  },
  accreditationSectors: [AccreditationSectorSchema],
  deliveryPoints: [PointOfSaleSchema],
  showAccessControl: Boolean,
  accessControl: {
    entry: Boolean,
    entryAndExit: Boolean
  },
  doorCount: Number,
  simultaneousSale: Boolean,
  hasAccessControlStaff: Boolean,
  billing: {
    enabled: Boolean,
    businessName: String,
    taxId: String
  },
  collectionAccount: {
    type: String,
    merchantNumber: String
  },
  productionData: {
    supervisorEmail: String,
    responsibleName: String,
    responsiblePhone: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true
});

// Virtual for calculating total percentage
PlanillaSchema.virtual('totalPercentage').get(function() {
  const { percentage1, percentage2, percentage3 } = this.commercialAgreement;
  return (percentage1 + percentage2 + percentage3) / 100;
});

// Method to calculate additional price
PlanillaSchema.methods.calculateAdditionalPrice = function(price) {
  return Math.round(price * this.totalPercentage);
};

// Ensure virtuals are included when converting document to JSON
PlanillaSchema.set('toJSON', { virtuals: true });
PlanillaSchema.set('toObject', { virtuals: true });

export default mongoose.models.Planilla || mongoose.model('Planilla', PlanillaSchema);