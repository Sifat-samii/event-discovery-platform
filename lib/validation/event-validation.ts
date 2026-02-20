// Data quality checks for events

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEvent(event: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!event.title || event.title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (!event.venue_name || event.venue_name.trim().length === 0) {
    errors.push("Venue name is required");
  }

  if (!event.start_date) {
    errors.push("Start date is required");
  }

  if (!event.end_date) {
    errors.push("End date is required");
  }

  if (!event.category_id) {
    errors.push("Category is required");
  }

  // Date validation
  if (event.start_date && event.end_date) {
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

    if (endDate < startDate) {
      errors.push("End date must be after start date");
    }

    if (startDate < new Date()) {
      warnings.push("Start date is in the past");
    }
  }

  // Price validation
  if (event.price_type === "paid" && (!event.price_amount || event.price_amount <= 0)) {
    warnings.push("Paid event should have a price amount");
  }

  // Suspicious price detection
  if (event.price_amount && event.price_amount > 100000) {
    warnings.push("Price seems unusually high");
  }

  // Venue validation
  if (!event.area_id) {
    warnings.push("Area/location not specified");
  }

  // Description length
  if (event.description && event.description.length < 50) {
    warnings.push("Description is quite short");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function checkDuplicateEvent(
  title: string,
  startDate: string,
  venueName: string,
  existingEvents: any[]
): { isDuplicate: boolean; similarity: number; matchedEvent?: any } {
  const eventDate = new Date(startDate);
  
  // Check for exact matches
  const exactMatch = existingEvents.find(
    (e) =>
      e.title.toLowerCase() === title.toLowerCase() &&
      new Date(e.start_date).toDateString() === eventDate.toDateString() &&
      e.venue_name.toLowerCase() === venueName.toLowerCase()
  );

  if (exactMatch) {
    return {
      isDuplicate: true,
      similarity: 1.0,
      matchedEvent: exactMatch,
    };
  }

  // Check for similar titles with same date and venue
  const similarMatch = existingEvents.find((e) => {
    const sameDate = new Date(e.start_date).toDateString() === eventDate.toDateString();
    const sameVenue = e.venue_name.toLowerCase() === venueName.toLowerCase();
    const similarTitle = calculateSimilarity(e.title.toLowerCase(), title.toLowerCase()) > 0.8;
    
    return sameDate && sameVenue && similarTitle;
  });

  if (similarMatch) {
    const similarity = calculateSimilarity(similarMatch.title.toLowerCase(), title.toLowerCase());
    return {
      isDuplicate: true,
      similarity,
      matchedEvent: similarMatch,
    };
  }

  return {
    isDuplicate: false,
    similarity: 0,
  };
}

function calculateSimilarity(str1: string, str2: string): number {
  // Simple Levenshtein distance-based similarity
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}
