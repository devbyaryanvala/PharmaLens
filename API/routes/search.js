const express = require('express');
const NodeCache = require('node-cache');
const { getData, getConditionMap, getFuses } = require('../utils/dataLoader');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

// Helper to create Fuse instances (memoized if needed, but for now we recreate or store globally)
// specific instances for each dataset
let fuses = {
    medicines: null,
    shortages: null,
    suspicious: null
};

// Initialize Fuse instances lazily or on first request to ensure data is loaded
const initFuses = () => {
    const data = getData();

    if (!fuses.medicines && data.medicines.length > 0) {
        fuses.medicines = new Fuse(data.medicines, {
            keys: ['product_name', 'salt_composition', '_clean_salt', '_clean_product'],
            includeScore: true,
            threshold: 0.4
        });
    }

    if (!fuses.shortages && data.shortages.length > 0) {
        fuses.shortages = new Fuse(data.shortages, {
            keys: ['Generic Name', 'Presentation'],
            includeScore: true,
            threshold: 0.4
        });
    }

    if (!fuses.suspicious && data.suspicious.length > 0) {
        fuses.suspicious = new Fuse(data.suspicious, {
            keys: ['Name of Drugs/medical device/cosmetics'],
            includeScore: true,
            threshold: 0.4
        });
    }
};

// Dashboard Stats Endpoint - Fast, no search required (O(1))
router.get('/stats', (req, res) => {
    try {
        const data = getData();
        res.json({
            totalDrugs: data.medicines.length,
            flaggedDrugs: data.suspicious.length,
            shortages: data.shortages.length,
            avgSavings: 45 // Estimated average savings percentage
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/', (req, res) => {
    try {
        // Generate Cache Key based on full query
        const cacheKey = JSON.stringify(req.query);
        const cachedResponse = cache.get(cacheKey);

        if (cachedResponse) {
            return res.json(cachedResponse);
        }

        const fuses = getFuses();
        const conditionMap = getConditionMap();
        const data = getData();

        const { drug, condition, min_price, max_price, manufacturer, min_rating, sort, page = 1, limit = 20 } = req.query;

        if (!drug && !condition) {
            return res.status(400).json({ message: "Please provide a 'drug' name or 'condition'." });
        }

        let results = [];

        // 1. Search Logic
        if (drug) {
            // Determine Partition
            const cleanDrug = drug.trim();
            const firstChar = cleanDrug.charAt(0).toUpperCase();

            // Allow searching "Zovirax" -> 'Z' partition
            // Also handle cases where user might typo the first letter? 
            // Partitioning assumes the first letter is correct. This is a trade-off for speed.

            let targetFuse = fuses.partitions[firstChar];
            if (!targetFuse) {
                targetFuse = fuses.partitions['OTHER'];
            }

            // Search primarily in the targeted partition (Approx 1/26th of data)
            if (targetFuse) {
                const resultsM = targetFuse.search(cleanDrug).map(r => ({ ...r.item, score: r.score, source: 'medicines' }));
                results.push(...resultsM);
            }

            // Also search shortages and suspicious (these are small global indices)
            if (fuses.shortages) {
                const resultsS = fuses.shortages.search(drug).map(r => ({ ...r.item, score: r.score, source: 'shortage_direct' }));
                results.push(...resultsS);
            }
            if (fuses.suspicious) {
                const resultsSu = fuses.suspicious.search(drug).map(r => ({ ...r.item, score: r.score, source: 'suspicious_direct' }));
                results.push(...resultsSu);
            }
        } else if (condition) {
            // OPTIMIZED: Use Pre-computed Condition Map
            // "Diabetes" -> look up in map
            const conditionLower = condition.toLowerCase();

            // Exact match from map (Fastest)
            if (conditionMap.has(conditionLower)) {
                results = conditionMap.get(conditionLower).map(item => ({ ...item, source: 'medicines' }));
            } else {
                // Fallback to partial text search ONLY if not in map (Scanning description)
                // Or we could scan the keys of the map if we want fuzzy condition matching?
                // For now, let's Stick to the scan if exact map fail, but optimized.
                results = data.medicines.filter(item => {
                    const desc = item.description ? item.description.toLowerCase() : "";
                    const reviews = item.layer1_reviews;
                    // We already checked map for exact condition match, so here we check description
                    return desc.includes(conditionLower);
                }).map(item => ({ ...item, source: 'medicines' }));
            }
        }

        // 2. Filter by Condition (If both drug AND condition are present)
        if (drug && condition) {
            const conditionLower = condition.toLowerCase();
            results = results.filter(item => {
                if (item.source !== 'medicines') return true; // Keep shortages/suspicious if drug matched explicitly

                const reviews = item.layer1_reviews;
                const conditions = reviews && reviews.conditions ? reviews.conditions : [];
                const hasCondition = conditions.some(c => c.toLowerCase().includes(conditionLower));
                const descriptionMatch = item.description && item.description.toLowerCase().includes(conditionLower);
                return hasCondition || descriptionMatch;
            });
        }

        // 3. Enrich with Shortages and Suspicious Data (Only for medicines)
        // OPTIMIZED: Temporarily disabled expensive O(n) enrichment loop for performance
        let enhancedResults = results;

        /*
        let enhancedResults = results.map(drugItem => {
            if (drugItem.source !== 'medicines') return drugItem;

            const enrichment = {
                shortages: [],
                suspicious: []
            };

            if (fuses.shortages && drugItem.salt_composition) {
                let saltName = drugItem._clean_salt || drugItem.salt_composition.split('(')[0].trim();
                const shortRes = fuses.shortages.search(saltName);
                enrichment.shortages = shortRes.filter(r => r.score < 0.4).map(r => r.item);
            }

            if (fuses.suspicious && drugItem.product_name) {
                const suspRes = fuses.suspicious.search(drugItem.product_name);
                enrichment.suspicious = suspRes.filter(r => r.score < 0.4).map(r => r.item);
            }

            return {
                ...drugItem,
                ...enrichment
            };
        });
        */

        // 4. Response Empty Check
        if (enhancedResults.length === 0) {
            return res.status(404).json({ message: "Not found" });
        }

        // 5. Advanced Filtering
        if (min_price || max_price || manufacturer || min_rating) {
            enhancedResults = enhancedResults.filter(item => {
                // Price Filter
                if (min_price || max_price) {
                    let priceVal = 0;
                    if (item.price) {
                        const cleanPrice = item.price.replace(/[^0-9.]/g, '');
                        priceVal = parseFloat(cleanPrice);
                    }
                    if (isNaN(priceVal)) return false;
                    if (min_price && priceVal < parseFloat(min_price)) return false;
                    if (max_price && priceVal > parseFloat(max_price)) return false;
                }
                // Manufacturer Filter
                if (manufacturer) {
                    if (!item.manufacturer || !item.manufacturer.toLowerCase().includes(manufacturer.toLowerCase())) {
                        return false;
                    }
                }
                // Rating Filter
                if (min_rating) {
                    const rating = item.layer1_reviews ? item.layer1_reviews.avg_rating : 0;
                    if (rating < parseFloat(min_rating)) return false;
                }
                return true;
            });
        }

        // 6. Sorting
        if (sort) {
            enhancedResults.sort((a, b) => {
                if (sort === 'price_asc') {
                    const priceA = parseFloat((a.price || '0').replace(/[^0-9.]/g, ''));
                    const priceB = parseFloat((b.price || '0').replace(/[^0-9.]/g, ''));
                    return priceA - priceB;
                } else if (sort === 'price_desc') {
                    const priceA = parseFloat((a.price || '0').replace(/[^0-9.]/g, ''));
                    const priceB = parseFloat((b.price || '0').replace(/[^0-9.]/g, ''));
                    return priceB - priceA;
                } else if (sort === 'rating') {
                    const ratingA = a.layer1_reviews ? a.layer1_reviews.avg_rating : 0;
                    const ratingB = b.layer1_reviews ? b.layer1_reviews.avg_rating : 0;
                    return ratingB - ratingA;
                }
                return 0;
            });
        } else {
            // Default Sort: Score
            enhancedResults.sort((a, b) => (a.score || 1) - (b.score || 1));
        }

        // 7. Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;

        const paginatedResults = enhancedResults.slice(startIndex, endIndex);

        const responsePayload = {
            meta: {
                total: enhancedResults.length,
                page: pageNum,
                limit: limitNum,
                total_pages: Math.ceil(enhancedResults.length / limitNum)
            },
            query: { drug, condition, min_price, max_price, manufacturer, min_rating, sort },
            data: paginatedResults
        };

        // Cache the successful response
        cache.set(cacheKey, responsePayload);

        res.json(responsePayload);

    } catch (error) {
        next(error); // Pass to central error handler
    }
});

module.exports = router;
