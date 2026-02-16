const { Client } = require('pg');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');

const connectionString = process.env.DATABASE_URL || 'postgres://admin:secure_password@namecard_db:5432/namecard_platform';

async function seed() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const users = [
      {
        email: 'demo3@example.com',
        password: 'password123',
        uid: 'demo_user_03',
        url_prefix: 'pro',
        fullName: 'นายสมชาย ชำนาญธุรกิจ / Somchai Business',
        fullNameTh: 'นายสมชาย ชำนาญธุรกิจ',
        fullNameEn: 'Mr. Somchai Business',
        position: 'ที่ปรึกษาธุรกิจอาวุโส / Senior Consultant',
        positionTh: 'ที่ปรึกษาธุรกิจอาวุโส',
        positionEn: 'Senior Business Consultant',
        company: 'บริษัท กลยุทธ์สากล จำกัด / Global Strategy',
        companyTh: 'บริษัท กลยุทธ์สากล จำกัด',
        companyEn: 'Global Strategy Co., Ltd.',
        profilePic: '/uploads/demo/demo3_profile.png',
        banner: '/uploads/demo/demo3_banner.png',
        about: 'ช่วยขับเคลื่อนธุรกิจของคุณด้วยกลยุทธ์ที่ขับเคลื่อนด้วยข้อมูลและการวางแผนที่เป็นเลิศ\n\nHelping businesses scale with data-driven strategies.',
        theme: '#004a99'
      },
      {
        email: 'demo4@example.com',
        password: 'password123',
        uid: 'demo_user_04',
        url_prefix: 'creative',
        fullName: 'น.ส.สาริศา ศิลป์สร้างสรรค์ / Sarisa Creative',
        fullNameTh: 'น.ส.สาริศา ศิลป์สร้างสรรค์',
        fullNameEn: 'Ms. Sarisa Creative',
        position: 'ผู้อำนวยการศิลป์ / Art Director',
        positionTh: 'ผู้อำนวยการศิลป์และดีไซน์เนอร์',
        positionEn: 'Art Director & Designer',
        company: 'สาริศา ครีเอทีฟ สตูดิโอ / Sarisa Studio',
        companyTh: 'สาริศา ครีเอทีฟ สตูดิโอ',
        companyEn: 'Sarisa Creative Studio',
        profilePic: '/uploads/demo/demo4_profile.png',
        banner: '/uploads/demo/demo4_banner.png',
        about: 'สร้างสรรค์ประสบการณ์ทางภาพที่สวยงามและมีความหมาย\n\nCreating beautiful and meaningful visual experiences.',
        theme: '#e91e63'
      }
    ];

    for (const data of users) {
      console.log(`Processing user: ${data.email}`);
      
      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 10);
      
      // Check if user exists
      const res = await client.query('SELECT id FROM users WHERE email = $1', [data.email]);
      let userId;
      
      if (res.rows.length > 0) {
        userId = res.rows[0].id;
        console.log(`User ${data.email} already exists (ID: ${userId}). Updating...`);
        await client.query(
          'UPDATE users SET password_hash = $1, uid = $2, url_prefix = $3 WHERE id = $4',
          [passwordHash, data.uid, data.url_prefix, userId]
        );
      } else {
        const insertUser = await client.query(
          'INSERT INTO users (email, password_hash, uid, url_prefix, role, is_active, must_change_password) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
          [data.email, passwordHash, data.uid, data.url_prefix, 'user', true, false]
        );
        userId = insertUser.rows[0].id;
        console.log(`Created user ${data.email} (ID: ${userId})`);
      }

      // Profile
      const profilePicConfig = {
        url: data.profilePic,
        position: { x: 50, y: 50, scale: 1 }
      };
      
      const bannerConfig = [{
        url: data.banner,
        position: { x: 50, y: 50, scale: 1 }
      }];
      
      // i18n Fields
      const namesI18n = [
        { lang: 'th', value: data.fullNameTh },
        { lang: 'en', value: data.fullNameEn }
      ];
      const positionsI18n = [
        { lang: 'th', value: data.positionTh },
        { lang: 'en', value: data.positionEn }
      ];
      const companiesI18n = [
        { lang: 'th', value: data.companyTh },
        { lang: 'en', value: data.companyEn }
      ];

      await client.query(
        'INSERT INTO profiles (user_id, full_name, position, company_name, profile_pic, banners, about_me, theme_color, names_i18n, positions_i18n, companies_i18n) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name, position = EXCLUDED.position, company_name = EXCLUDED.company_name, profile_pic = EXCLUDED.profile_pic, banners = EXCLUDED.banners, about_me = EXCLUDED.about_me, theme_color = EXCLUDED.theme_color, names_i18n = EXCLUDED.names_i18n, positions_i18n = EXCLUDED.positions_i18n, companies_i18n = EXCLUDED.companies_i18n',
        [userId, data.fullName, data.position, data.company, JSON.stringify(profilePicConfig), JSON.stringify(bannerConfig), data.about, data.theme, JSON.stringify(namesI18n), JSON.stringify(positionsI18n), JSON.stringify(companiesI18n)]
      );
      console.log(`Updated profile for ID: ${userId}`);

      // Seeding Catalog
      const catalogTitle = data.email === 'demo3@example.com' ? 'บริการที่ปรึกษาธุรกิจ 2026' : 'ผลงานศิลปะ - ฤดูใบไม้ผลิ 2026';
      const catalogDesc = data.email === 'demo3@example.com' ? 'Premium catalog for Somchai Business Consultant' : 'Selected works by Sarisa Creative';
      const catalogSlug = data.email === 'demo3@example.com' ? 'corporate-advisory' : 'art-portfolio';
      
      const catRes = await client.query(
        'INSERT INTO catalogs (user_id, title, description, custom_slug, is_active) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (custom_slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description RETURNING id',
        [userId, catalogTitle, catalogDesc, catalogSlug, true]
      );
      const catalogId = catRes.rows[0].id;
      console.log(`Ensured catalog ${catalogTitle} (ID: ${catalogId})`);

      // Clear existing products to avoid duplicates if re-running
      await client.query('DELETE FROM products WHERE catalog_id = $1', [catalogId]);

      // Products
      const products = data.email === 'demo3@example.com' ? [
        { name: 'การวางแผนกลยุทธ์ (Strategic Planning)', desc: 'วางแผนระยะยาวเพื่อความสำเร็จที่ยั่งยืน\n(Developing long-term roadmaps for success)', price: 5000, img: '/uploads/demo/demo3_prod1.png' },
        { name: 'การวิเคราะห์ตลาด (Market Analysis)', desc: 'เจาะลึกเทรนด์ตลาดและคู่แข่งอย่างละเอียด\n(Deep dive into market trends and competitors)', price: 3500, img: '/uploads/demo/demo3_prod2.png' }
      ] : [
        { name: 'ภาพวาดสีน้ำมันพรีเมียม (Luxury Oil Paintings)', desc: 'ภาพวาดทิวทัศน์ด้วยเทคนิค impasto สีสันสดใส\n(Hand-painted landscapes with depth and texture)', price: 12000, img: '/uploads/demo/demo4_prod1.png' },
        { name: 'รับวาดภาพดิจิทัล (Digital Art Commissions)', desc: 'ออกแบบตัวละครและฉากตามสั่งสำหรับโปรเจกต์ของคุณ\n(Custom characters and environments for your project)', price: 2500, img: '/uploads/demo/demo4_prod2.png' }
      ];

      for (const p of products) {
        await client.query(
          'INSERT INTO products (catalog_id, name, description, price, images_json) VALUES ($1, $2, $3, $4, $5)',
          [catalogId, p.name, p.desc, p.price, JSON.stringify([p.img])]
        );
      }
      console.log(`Added products for ${data.email}`);
    }

    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await client.end();
  }
}

seed();
