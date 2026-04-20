import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate a formatted PDF for a list of drugs
 * @param {Array} drugs - List of drug objects
 * @param {string} title - Title of the report
 */
export const generateDrugPDF = (drugs, title = 'PharmaLens Drug Report') => {
    // Landscape mode
    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const gutter = 8;
    const usableWidth = pageWidth - (margin * 2);

    // --- Layout Config ---
    // 3 Columns: Identity (25%), Clinical (45%), Safety/Metrics (30%)
    const c1W = usableWidth * 0.25;
    const c2W = usableWidth * 0.45;
    const c3W = usableWidth * 0.30;

    const x1 = margin;
    const x2 = margin + c1W + gutter;
    const x3 = margin + c1W + c2W + (gutter * 2);

    // --- Helper Functions ---
    const cleanPrice = (price) => {
        if (!price) return 'N/A';
        const str = String(price);
        if (str.includes('&')) return 'Rs. ' + str.replace(/[^\d.]/g, '');
        return str.startsWith('Rs.') || str.startsWith('₹') ? str.replace('₹', 'Rs. ') : `Rs. ${str}`;
    };

    const drawHeader = () => {
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, 30, 'F'); // Clean white background

        // Brand Line
        doc.setDrawColor(99, 102, 241); // Indigo
        doc.setLineWidth(1);
        doc.line(margin, 25, pageWidth - margin, 25);

        doc.setTextColor(99, 102, 241);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('PharmaLens', margin, 18);

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(14);
        doc.text(title, pageWidth - margin, 18, { align: 'right' });

        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text(`${drugs.length} items  |  Generated ${new Date().toLocaleDateString()}`, margin, 32);
    };

    drawHeader();
    let currentY = 40;

    // --- Iteration ---
    drugs.forEach((d, i) => {
        // --- 1. Content Preparation ---
        // Col 1: Identity
        const name = d.product_name || 'Unknown Drug';
        const mfr = d.manufacturer || 'N/A';
        const id = `ID: ${d.id || 'N/A'}`;
        const cat = d.category || 'Uncategorized';

        // Col 2: Clinical
        const salt = `Salt: ${d.salt_composition || d.salt || 'N/A'}`;
        const usesTitle = "Uses / Description:";
        const usesText = d.uses || d.description || 'No description available.';

        // Col 3: Metrics/Safety
        const price = cleanPrice(d.price);
        const rating = d.layer1_reviews?.avg_rating ? `★ ${d.layer1_reviews.avg_rating} (${d.layer1_reviews.total_reviews} reviews)` : 'No Ratings';
        const sideTitle = "Side Effects / Warnings:";
        const sideText = d.side_effects || 'No specific side effects listed.';

        // --- 2. Height Calculation ---
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Measure Wrapped Text
        const usesLines = doc.splitTextToSize(usesText, c2W);
        const sideLines = doc.splitTextToSize(sideText, c3W);
        const nameLines = doc.splitTextToSize(name, c1W);
        const mfrLines = doc.splitTextToSize(mfr, c1W);
        const catLines = doc.splitTextToSize(cat, c1W);

        // Calculate max height needed for this row
        // Col 1 H: Name + ID + Mfr + Cat
        const h1 = (nameLines.length * 5) + 6 + (mfrLines.length * 4) + (catLines.length * 4) + 10;
        // Col 2 H: Salt + UsesLabel + UsesText
        const h2 = 6 + 5 + (usesLines.length * 4) + 10;
        // Col 3 H: Price + Rating + SideLabel + SideText
        const h3 = 6 + 6 + 6 + (sideLines.length * 4) + 10;

        const rowHeight = Math.max(h1, h2, h3);

        // Page Break
        if (currentY + rowHeight > pageHeight - 15) {
            doc.addPage();
            drawHeader();
            currentY = 40;
        }

        // --- 3. Drawing ---

        // Col 1: Identity
        let y = currentY;
        doc.setTextColor(30, 41, 59); // Slate 800
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(nameLines, x1, y);
        y += (nameLines.length * 5) + 2;

        doc.setTextColor(148, 163, 184); // Slate 400
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(id, x1, y);
        y += 4;

        doc.setTextColor(71, 85, 105); // Slate 600
        doc.setFont('helvetica', 'normal');
        doc.text(mfrLines, x1, y);
        y += (mfrLines.length * 4) + 2;

        doc.setTextColor(99, 102, 241); // Indigo
        doc.setFontSize(8);
        doc.text(catLines, x1, y);

        // Col 2: Clinical
        y = currentY;
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(salt, x2, y);
        y += 6;

        doc.setTextColor(100);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(usesTitle, x2, y);
        y += 4;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50);
        doc.text(usesLines, x2, y);

        // Col 3: Metrics & Safety
        y = currentY;
        doc.setTextColor(16, 185, 129); // Emerald Price
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(price, x3, y);
        y += 6;

        doc.setTextColor(245, 158, 11); // Amber Rating
        doc.setFontSize(9);
        doc.text(rating, x3, y);
        y += 8;

        doc.setTextColor(220, 38, 38); // Red Warning
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(sideTitle, x3, y);
        y += 4;

        doc.setTextColor(50);
        doc.setFont('helvetica', 'normal');
        doc.text(sideLines, x3, y);

        // Bottom Divider
        currentY += rowHeight;
        doc.setDrawColor(226, 232, 240); // Light gray
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 8; // Margin for next row
    });

    // Page Numbers
    const count = doc.internal.getNumberOfPages();
    for (let i = 1; i <= count; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${count}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }

    doc.save(`${title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
};
