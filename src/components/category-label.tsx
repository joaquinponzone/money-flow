import React from "react";
import { Badge } from "./ui/badge";
import { ExpenseCategories } from "@/lib/constants";

export default function CategoryLabel({ category }: { category: string }) {
  // Normalize the category for comparison (lowercase)
  const normalizedCategory = category?.toLowerCase() || '';
  
  // Map of category to styling
  const categoryStyles: Record<string, string> = {
    housing: 'border-sky-200 dark:border-sky-800 text-sky-600/80 dark:text-sky-400/80',
    utilities: 'border-green-200 dark:border-green-800 text-green-600/80 dark:text-green-400/80',
    food: 'border-orange-200 dark:border-orange-800 text-orange-600/80 dark:text-orange-400/80',
    transportation: 'border-red-200 dark:border-red-800 text-red-600/80 dark:text-red-400/80',
    insurance: 'border-purple-200 dark:border-purple-800 text-purple-600/80 dark:text-purple-400/80',
    healthcare: 'border-pink-200 dark:border-pink-800 text-pink-600/80 dark:text-pink-400/80',
    entertainment: 'border-yellow-200 dark:border-yellow-800 text-yellow-600/80 dark:text-yellow-400/80',
    other: 'border-gray-200 dark:border-gray-800 text-gray-600/80 dark:text-gray-400/80'
  };
  
  // Get the style based on the normalized category, or default to 'other' style
  const categoryClassName = categoryStyles[normalizedCategory] || categoryStyles.other;

  // Find the properly capitalized category from the ExpenseCategories list
  const displayCategory = ExpenseCategories.find(
    c => c.toLowerCase() === normalizedCategory
  ) || category || 'Uncategorized';

  return <Badge variant="outline" className={`text-xs ${categoryClassName}`}>{displayCategory}</Badge>;
}
