import * as fs from 'fs';
import * as path from 'path';

const p = path.join(process.cwd(), 'database.json');
if (fs.existsSync(p)) {
  const db = JSON.parse(fs.readFileSync(p, 'utf8'));
  const merchantIds = Object.keys(db.merchantsDb || {});
  if (merchantIds.length > 0) {
    const firstMerchant = db.merchantsDb[merchantIds[0]];
    console.log("shop keys:", Object.keys(firstMerchant.shop || {}));
    if (firstMerchant.shop && firstMerchant.shop.products) {
      console.log(`Found ${firstMerchant.shop.products.length} products inside shop`);
      
      const catProducts: Record<string, Set<string>> = {};
      merchantIds.forEach(mId => {
        const m = db.merchantsDb[mId];
        if (m.shop && m.shop.products) {
          m.shop.products.forEach((p: any) => {
            if (!catProducts[p.category]) {
              catProducts[p.category] = new Set<string>();
            }
            catProducts[p.category].add(p.name);
          });
        }
      });
      
      for (const cat of Object.keys(catProducts)) {
        console.log(`Category [${cat}]:`);
        console.log(Array.from(catProducts[cat]));
      }
    }
  }
} else {
  console.log("database.json not found");
}
