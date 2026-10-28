-- SQL para criar usuário admin
-- Execute este SQL no Supabase SQL Editor
-- Email: igor.riopequeno@gmail.com
-- Senha: Senha123@

-- Habilitar extensão necessária para criptografar senha
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Verificar se usuário já existe
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'igor.riopequeno@gmail.com';
  
  IF target_user_id IS NULL THEN
    -- Criar novo usuário
    target_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_sent_at,
      recovery_sent_at,
      email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      is_sso_user,
      is_anonymous
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      target_user_id,
      'authenticated',
      'authenticated',
      'igor.riopequeno@gmail.com',
      crypt('Senha123@', gen_salt('bf')),
      now(),
      now(),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Igor Lima"}',
      false,
      now(),
      now(),
      false,
      false
    );
  ELSE
    -- Atualizar senha se já existir
    UPDATE auth.users 
    SET encrypted_password = crypt('Senha123@', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = target_user_id;
  END IF;
  
  -- Criar ou atualizar perfil como admin
  INSERT INTO public.user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
  VALUES (
    target_user_id,
    'igor.riopequeno@gmail.com',
    'Igor Lima',
    'admin',
    true,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    is_active = true,
    full_name = 'Igor Lima',
    updated_at = now();
  
  RAISE NOTICE 'Usuário admin criado/atualizado com sucesso: igor.riopequeno@gmail.com';
END $$;

-- Verificar resultado
SELECT 
  u.email, 
  u.email_confirmed_at IS NOT NULL as email_confirmado,
  p.role, 
  p.is_active, 
  p.full_name
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.id = u.id
WHERE u.email = 'igor.riopequeno@gmail.com';
