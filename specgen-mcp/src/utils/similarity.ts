/**
 * Text similarity calculation utilities for smart categorization
 */

export interface SimilarityResult {
  score: number;
  matchedTerms: string[];
  method: 'cosine' | 'jaccard' | 'tfidf';
}

/**
 * Calculate cosine similarity between two text strings
 * Uses term frequency for vector representation
 */
export function cosineSimilarity(text1: string, text2: string): number {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);
  
  // Create term frequency maps
  const tf1 = createTermFrequencyMap(tokens1);
  const tf2 = createTermFrequencyMap(tokens2);
  
  // Get all unique terms
  const allTerms = new Set([...tf1.keys(), ...tf2.keys()]);
  
  // Calculate dot product and magnitudes
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  for (const term of allTerms) {
    const freq1 = tf1.get(term) || 0;
    const freq2 = tf2.get(term) || 0;
    
    dotProduct += freq1 * freq2;
    magnitude1 += freq1 * freq1;
    magnitude2 += freq2 * freq2;
  }
  
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);
  
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }
  
  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Calculate Jaccard similarity between two text strings
 * Measures intersection over union of word sets
 */
export function jaccardSimilarity(text1: string, text2: string): number {
  const set1 = new Set(tokenize(text1));
  const set2 = new Set(tokenize(text2));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  if (union.size === 0) {
    return 0;
  }
  
  return intersection.size / union.size;
}

/**
 * Calculate weighted similarity with keyword boosting
 * Combines multiple similarity measures with keyword matching
 */
export function weightedSimilarity(
  text1: string,
  text2: string,
  keywords: string[] = []
): SimilarityResult {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);
  
  // Base similarity scores
  const cosine = cosineSimilarity(text1, text2);
  const jaccard = jaccardSimilarity(text1, text2);
  
  // Keyword matching boost
  let keywordBoost = 0;
  const matchedKeywords: string[] = [];
  
  if (keywords.length > 0) {
    const lowerText1 = text1.toLowerCase();
    const lowerText2 = text2.toLowerCase();
    
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      if (lowerText1.includes(lowerKeyword) && lowerText2.includes(lowerKeyword)) {
        keywordBoost += 0.1;
        matchedKeywords.push(keyword);
      }
    }
  }
  
  // Find common significant terms (excluding stop words)
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  const commonTerms = [...set1].filter(x => set2.has(x) && x.length > 3);
  
  // Weighted combination
  const baseScore = (cosine * 0.6 + jaccard * 0.4);
  const finalScore = Math.min(1, baseScore + keywordBoost);
  
  return {
    score: finalScore,
    matchedTerms: [...new Set([...matchedKeywords, ...commonTerms.slice(0, 5)])],
    method: 'cosine'
  };
}

/**
 * Calculate similarity between a text and multiple candidates
 * Returns sorted results with confidence scores
 */
export function findBestMatch(
  targetText: string,
  candidates: Array<{ id: string; text: string; keywords?: string[] }>
): Array<{ id: string; similarity: SimilarityResult; rank: number }> {
  const results = candidates.map(candidate => ({
    id: candidate.id,
    similarity: weightedSimilarity(targetText, candidate.text, candidate.keywords || [])
  }));
  
  // Sort by similarity score descending
  results.sort((a, b) => b.similarity.score - a.similarity.score);
  
  // Add rank
  return results.map((result, index) => ({
    ...result,
    rank: index + 1
  }));
}

/**
 * Tokenize text into words, removing punctuation and converting to lowercase
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0 && !isStopWord(word));
}

/**
 * Create term frequency map from tokens
 */
function createTermFrequencyMap(tokens: string[]): Map<string, number> {
  const tfMap = new Map<string, number>();
  
  for (const token of tokens) {
    tfMap.set(token, (tfMap.get(token) || 0) + 1);
  }
  
  // Normalize by total token count
  const totalTokens = tokens.length;
  for (const [term, count] of tfMap) {
    tfMap.set(term, count / totalTokens);
  }
  
  return tfMap;
}

/**
 * Common stop words to exclude from similarity calculations
 */
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to',
  'was', 'will', 'with', 'the', 'this', 'these', 'those', 'there', 'their',
  'they', 'them', 'then', 'than', 'that', 'can', 'could', 'should', 'would',
  'may', 'might', 'must', 'shall', 'will', 'would', 'have', 'had', 'has',
  'do', 'does', 'did', 'done', 'make', 'made', 'get', 'got', 'go', 'went'
]);

/**
 * Check if a word is a stop word
 */
function isStopWord(word: string): boolean {
  return STOP_WORDS.has(word.toLowerCase());
}

/**
 * Calculate category confidence based on similarity score
 */
export function calculateConfidence(similarityScore: number): 'high' | 'medium' | 'low' {
  if (similarityScore >= 0.7) return 'high';
  if (similarityScore >= 0.4) return 'medium';
  return 'low';
}

/**
 * Suggest whether a new category should be created
 */
export function shouldCreateNewCategory(topScore: number, threshold: number = 0.3): boolean {
  return topScore < threshold;
}