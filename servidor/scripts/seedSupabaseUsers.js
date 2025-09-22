const { supabaseAdmin } = require('../config/supabase');
require('dotenv').config();

async function ensureUser(email, password, metadata) {
  // Try to find user by listing (Supabase admin lacks direct get by email without error handling)
  const { data: list, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) throw listError;
  const exists = list.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (exists) {
    // Update metadata and password
    await supabaseAdmin.auth.admin.updateUserById(exists.id, {
      password,
      user_metadata: { ...(exists.user_metadata || {}), ...metadata }
    });
    return { created: false, id: exists.id };
  }
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata
  });
  if (error) throw error;
  return { created: true, id: data.user.id };
}

async function main(){
  if (!supabaseAdmin) {
    console.error('SUPABASE_SERVICE_ROLE_KEY requerido para seed.');
    process.exit(1);
  }
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminUsername = process.env.SEED_ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'JP3Admin2025!';

  const userEmail = process.env.SEED_USER_EMAIL || 'usuario@example.com';
  const userUsername = process.env.SEED_USER_USERNAME || 'usuario';
  const userPassword = process.env.SEED_USER_PASSWORD || 'JP3User2025!';

  console.log('Seeding Supabase users...');
  const a = await ensureUser(adminEmail, adminPassword, { username: adminUsername, role: 'admin' });
  console.log(`Admin ${a.created ? 'creado' : 'actualizado'}: ${adminEmail} (id ${a.id})`);
  const u = await ensureUser(userEmail, userPassword, { username: userUsername, role: 'user' });
  console.log(`Usuario ${u.created ? 'creado' : 'actualizado'}: ${userEmail} (id ${u.id})`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('Error seeding Supabase users:', err);
    process.exit(1);
  });
}

module.exports = { ensureUser };
