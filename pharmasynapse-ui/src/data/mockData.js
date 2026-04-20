/**
 * PharmaSynapse Mock Data
 * CORRECTED: Proper values matching Dribbble reference
 */

// Dashboard Stats - CORRECTED VALUES
export const dashboardStats = [
    { id: 1, label: 'Total Drugs', value: '249,996', icon: 'Pill', color: 'blue' },
    { id: 2, label: "Gov't Flagged", value: '54', icon: 'AlertTriangle', color: 'green' },  // GREEN icon, value 54
    { id: 3, label: 'Avg. Savings', value: '45%', icon: 'Percent', color: 'orange' },
    { id: 4, label: 'In Shortage', value: '223', icon: 'Package', color: 'purple' },  // Value 223
];

// Area Chart Data - Drug Search Trends (12 months)
export const areaChartData = [
    { name: 'Jan', value: 20, value2: 15 },
    { name: 'Feb', value: 25, value2: 18 },
    { name: 'Mar', value: 18, value2: 22 },
    { name: 'Apr', value: 32, value2: 28 },
    { name: 'May', value: 28, value2: 35 },
    { name: 'Jun', value: 38, value2: 32 },
    { name: 'Jul', value: 35, value2: 40 },
    { name: 'Aug', value: 45, value2: 38 },
    { name: 'Sep', value: 42, value2: 48 },
    { name: 'Oct', value: 55, value2: 45 },
    { name: 'Nov', value: 50, value2: 52 },
    { name: 'Dec', value: 48, value2: 55 },
];

// Donut Chart Data - Payment Methods style
export const donutChartData = [
    { name: 'E-Wallet', value: 1200, fill: '#3B82F6' },
    { name: 'Debit Card', value: 2800, fill: '#1E293B' },
    { name: 'Cash', value: 1120, fill: '#94A3B8' },
];

// Bar Chart Data - Revenue Performance (Weekly)
export const barChartData = [
    { name: 'Sun', value: 2500 },
    { name: 'Mon', value: 3200 },
    { name: 'Tue', value: 4100 },
    { name: 'Wed', value: 5200 },
    { name: 'Thu', value: 4800 },
    { name: 'Fri', value: 6200 },
    { name: 'Sat', value: 5500 },
];

// Top Transaction / Recent Searches Table
export const topTransactions = [
    { id: '#TRX003', customerId: '#C090', date: '29-01-25', items: 10, purchase: '$60' },
    { id: '#TRX021', customerId: '#C091', date: '27-10-25', items: 9, purchase: '$108' },
    { id: '#TRX088', customerId: '#C089', date: '25-01-25', items: 8, purchase: '$340' },
    { id: '#TRX018', customerId: '#C085', date: '24-01-25', items: 14, purchase: '$148' },
    { id: '#TRX065', customerId: '#C045', date: '10-01-26', items: 4, purchase: '$104' },
    { id: '#TRX007', customerId: '#C035', date: '23-01-25', items: 12, purchase: '$233' },
];

// Categories Stats
export const categoriesStats = [
    { id: 1, label: 'Total Categories', value: '24', icon: 'Grid3X3', color: 'blue' },
    { id: 2, label: 'Total Types', value: '5', icon: 'Layers', color: 'green' },
    { id: 3, label: 'Total Products', value: '2,343', icon: 'Package', color: 'orange' },
    { id: 4, label: 'Empty Categories', value: '0', icon: 'FolderX', color: 'purple' },
];

// Product Stats
export const productStats = [
    { id: 1, label: 'Total Products', value: '249,996', icon: 'Package', color: 'blue' },
    { id: 2, label: 'Total Categories', value: '24', icon: 'Grid3X3', color: 'green' },
    { id: 3, label: 'Low Stock', value: '156', icon: 'AlertCircle', color: 'orange' },
    { id: 4, label: 'Out of Stock', value: '23', icon: 'XCircle', color: 'purple' },
];

// Categories Data
export const categoriesData = [
    { id: 1, name: 'Pain Relief', type: 'Medicine', items: 401, description: 'Medicines for relieving mild to moderate pain' },
    { id: 2, name: 'Vitamins & Health', type: 'Supplement', items: 540, description: 'Daily supplements to support overall health' },
    { id: 3, name: 'Skincare', type: 'Beauty', items: 478, description: 'Products for skin and facial care' },
    { id: 4, name: 'Baby Care', type: 'Personal', items: 231, description: 'Special products for baby needs' },
    { id: 5, name: 'Cough & Cold', type: 'Medicine', items: 109, description: 'Medicines for flu, cough, and cold symptoms' },
    { id: 6, name: 'First Aid', type: 'Equipment', items: 77, description: 'Essential supplies for first aid treatment' },
    { id: 7, name: 'Digestive Health', type: 'Medicine', items: 290, description: 'Medicines for stomach and digestive health' },
    { id: 8, name: 'Herbal Remedies', type: 'Personal', items: 217, description: 'Natural and herbal based medicines' },
];

// Products Data
export const productsData = [
    { id: 'P0324', name: 'Dolo 650 Tablet', category: 'Pain Relief', items: 789, price: 30.50, status: 'available' },
    { id: 'P0885', name: 'Crocin Advance 500mg', category: 'Pain Relief', items: 540, price: 45.00, status: 'available' },
    { id: 'P0998', name: 'Pantoprazole 40mg', category: 'Digestive Health', items: 478, price: 55.00, status: 'available' },
    { id: 'P0895', name: 'Metformin 500mg Tablets', category: 'Diabetes Care', items: 92, price: 35.00, status: 'lowStock' },
    { id: 'P0653', name: 'Paracetamol 500mg IP', category: 'Pain Relief', items: 0, price: 12.00, status: 'flagged' },
    { id: 'P0777', name: 'Azithromycin 500mg', category: 'Antibiotics', items: 320, price: 85.00, status: 'available' },
];

// Transaction Stats
export const transactionStats = [
    { id: 1, label: 'Total Comparisons', value: '12,847', icon: 'ArrowLeftRight', color: 'blue' },
    { id: 2, label: 'Avg. Savings', value: '₹847', icon: 'TrendingUp', color: 'green' },
    { id: 3, label: 'Total Savings', value: '₹1.2Cr', icon: 'Wallet', color: 'orange' },
    { id: 4, label: 'Total Searches', value: '45,231', icon: 'Search', color: 'purple' },
];

// Alerts Stats - CORRECTED VALUES
export const alertsStats = [
    { id: 1, label: 'Total Flagged', value: '54', icon: 'Flag', color: 'red' },
    { id: 2, label: 'Shortage Alerts', value: '223', icon: 'Package', color: 'orange' },
    { id: 3, label: 'Risky Vendors', value: '12', icon: 'Building2', color: 'purple' },
    { id: 4, label: 'Reports This Week', value: '8', icon: 'FileText', color: 'blue' },
];

// Stock Overview for Product page
export const stockOverviewData = [
    { name: 'Available', value: 92, fill: '#10B981' },
    { name: 'Low Stock', value: 5, fill: '#F59E0B' },
    { name: 'Out of Stock', value: 3, fill: '#EF4444' },
];
