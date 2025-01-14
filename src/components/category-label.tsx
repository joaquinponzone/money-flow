import React from "react";
import { Badge } from "./ui/badge";

export default function CategoryLabel({ category }: { category: string }) {
  const categoryClassName = category === 'Uncategorized' ? 'border-gray-200 dark:border-gray-800 text-gray-600/80 dark:text-gray-400/80' : 
  category === "housing" ? 'border-sky-200 dark:border-sky-800 text-sky-600/80 dark:text-sky-400/80' : 
  category === "utilities" ? 'border-green-200 dark:border-green-800 text-green-600/80 dark:text-green-400/80' : 
  category === "food" ? 'border-orange-200 dark:border-orange-800 text-orange-600/80 dark:text-orange-400/80' : 
  category === "transportation" ? 'border-red-200 dark:border-red-800 text-red-600/80 dark:text-red-400/80' : 
  category === "insurance" ? 'border-purple-200 dark:border-purple-800 text-purple-600/80 dark:text-purple-400/80' : 
  category === "healthcare" ? 'border-pink-200 dark:border-pink-800 text-pink-600/80 dark:text-pink-400/80' : 
  category === "entertainment" ? 'border-yellow-200 dark:border-yellow-800 text-yellow-600/80 dark:text-yellow-400/80' : 'border-gray-200 dark:border-gray-800 text-gray-600/80 dark:text-gray-400/80';

  return <Badge variant="outline" className={`text-xs ${categoryClassName}`}>{category}</Badge>;
}
