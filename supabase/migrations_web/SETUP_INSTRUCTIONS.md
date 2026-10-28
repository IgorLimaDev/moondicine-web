# Instruções para Configurar o Banco de Dados Supabase

## Passo 1: Criar Usuário Admin Inicial

Antes de aplicar os scripts, você precisa criar o primeiro usuário admin pelo painel do Supabase:

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Vá em Authentication > Users > Add user
3. Crie um usuário com email e senha (ex: admin@moondicine.com)
4. Salve essas credenciais

## Passo 2: Aplicar os Scripts SQL

No SQL Editor do Supabase, execute os scripts nesta ordem:

### Script 1: Auth e Roles
```sql
-- Copie e cole o conteúdo de 001_auth_and_roles.sql
```

### Script 2: Políticas Admin para Questões
```sql
-- Copie e cole o conteúdo de 002_questions_admin_policies.sql
```

## Passo 3: Tornar o Usuário Admin

Ainda no SQL Editor, execute:
```sql
SELECT public.make_user_admin('seu-email-admin@exemplo.com');
```

Substitua pelo email que você criou no Passo 1.

Você deve ver a mensagem: `User seu-email-admin@exemplo.com is now admin`

## Passo 4: Verificar

Execute para verificar:
```sql
SELECT * FROM public.user_profiles;
```

Deve aparecer seu usuário com role = 'admin'.

## Observações

- As tabelas `questions` e `answer_options` já existem. Os novos scripts apenas adicionam políticas para admins gerenciarem essas tabelas.
- O app web irá ler as questões do Supabase da mesma forma que o app Android fazia.
- Apenas usuários autenticados com role 'admin' poderão adicionar/editar/excluir questões pelo painel web.
- Usuários normais poderão apenas visualizar e responder questões.
- O sistema de login usa Supabase Auth (email/senha).
