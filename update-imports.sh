#!/bin/bash

# Find all TypeScript files that import UserRank from page
grep -lr "import.*UserRank.*from.*page" --include="*.tsx" --include="*.ts" src/

echo "Updating imports in the following files:"

# For each file that imports UserRank, replace the import with the correct one
for file in $(grep -l "import.*UserRank.*from.*page" --include="*.tsx" --include="*.ts" src/); do
  echo "Updating $file"
  # Use sed to replace the import statement
  # This regex replaces any import that includes UserRank from page with import from @/types/user
  sed -i "s/import { \(.*\)UserRank\(.*\) } from ['\"]\(.*\)page['\"].*$/import { \1UserRank\2 } from '@\/types\/user';/g" "$file"
done

echo "Done updating imports." 