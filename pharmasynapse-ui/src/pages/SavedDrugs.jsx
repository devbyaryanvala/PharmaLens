import React from 'react';
import Layout from '../components/layout/Layout';
import { useSavedDrugs } from '../context/SavedContext';
import { generateDrugPDF } from '../utils/pdfGenerator';
import { Trash2, Download, ExternalLink, Pill, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const SavedDrugs = () => {
    const { savedDrugs, removeDrug, clearSaved } = useSavedDrugs();

    const handleExport = () => {
        if (savedDrugs.length === 0) return;
        generateDrugPDF(savedDrugs, 'PharmaLens Saved Drugs Report');
    };

    return (
        <Layout>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Saved Drugs</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        You have <strong>{savedDrugs.length}</strong> items in your list
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {savedDrugs.length > 0 && (
                        <>
                            <button
                                onClick={clearSaved}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '8px 16px', borderRadius: '8px', border: '1px solid #EF4444',
                                    background: 'transparent', color: '#EF4444', fontSize: '13px', fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                <Trash2 size={16} /> Clear All
                            </button>
                            <button
                                onClick={handleExport}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '8px 16px', borderRadius: '8px', border: 'none',
                                    background: '#6366F1', color: 'white', fontSize: '13px', fontWeight: 600,
                                    cursor: 'pointer', boxShadow: '0 2px 5px rgba(99, 102, 241, 0.3)'
                                }}
                            >
                                <Download size={16} /> Download Report
                            </button>
                        </>
                    )}
                </div>
            </div>

            {savedDrugs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Pill size={24} color="var(--text-muted)" />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Your list is empty</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                        Browse drugs and click the heart icon to save them here for later.
                    </p>
                    <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', background: 'var(--primary)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>
                        Browse Products <ExternalLink size={14} />
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {savedDrugs.map(drug => (
                        <div key={drug.id} style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div>
                                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{drug.product_name}</h3>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{drug.manufacturer}</span>
                                </div>
                                <button
                                    onClick={() => removeDrug(drug.id)}
                                    title="Remove from saved"
                                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#EF4444' }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Price:</span>
                                    <strong style={{ color: 'var(--text-primary)' }}>{drug.price ? `₹${drug.price}` : 'N/A'}</strong>
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Composition</div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                        {drug.salt_composition || drug.salt || 'N/A'}
                                    </p>
                                </div>
                                {(drug.uses || drug.description) && (
                                    <div style={{ marginBottom: '12px' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Uses</div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {drug.uses || drug.description}
                                        </p>
                                    </div>
                                )}
                                {(drug.side_effects) && (
                                    <div style={{ marginBottom: '12px' }}>
                                        <div style={{ fontSize: '11px', color: '#EF4444', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <AlertCircle size={10} /> Side Effects
                                        </div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {drug.side_effects}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                                <span>Specific ID: {drug.id}</span>
                                {drug.layer1_reviews?.avg_rating && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontWeight: 600 }}>
                                        ★ {drug.layer1_reviews.avg_rating} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({drug.layer1_reviews.total_reviews} reviews)</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
};

export default SavedDrugs;
