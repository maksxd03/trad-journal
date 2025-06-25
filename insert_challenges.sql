-- Script para inserir desafios no banco de dados
-- Substitua 'SEU-USER-ID-AQUI' pelo seu ID de usuário real (pode ser encontrado no console do navegador)

-- Inserir desafios FTMO
INSERT INTO challenges (id, user_id, name, description, rules, status)
VALUES 
  (uuid_generate_v4(), 'SEU-USER-ID-AQUI', 'FTMO - $10000', 'Desafio FTMO de $10K', 
   '{"firmName": "FTMO", "accountSize": 10000, "profitTarget": 1000, "dailyDrawdown": 500, "overallDrawdown": 1000}'::JSONB,
   '{"isPassed": false, "isDailyDrawdownViolated": false, "isOverallDrawdownViolated": false, "currentEquity": 10000}'::JSONB),
   
  (uuid_generate_v4(), 'SEU-USER-ID-AQUI', 'FTMO - $25000', 'Desafio FTMO de $25K', 
   '{"firmName": "FTMO", "accountSize": 25000, "profitTarget": 2500, "dailyDrawdown": 1250, "overallDrawdown": 2500}'::JSONB,
   '{"isPassed": false, "isDailyDrawdownViolated": false, "isOverallDrawdownViolated": false, "currentEquity": 25000}'::JSONB),
   
  (uuid_generate_v4(), 'SEU-USER-ID-AQUI', 'FTMO - $100000', 'Desafio FTMO de $100K', 
   '{"firmName": "FTMO", "accountSize": 100000, "profitTarget": 10000, "dailyDrawdown": 5000, "overallDrawdown": 10000}'::JSONB,
   '{"isPassed": false, "isDailyDrawdownViolated": false, "isOverallDrawdownViolated": false, "currentEquity": 100000}'::JSONB);

-- Inserir desafios Personalizados
INSERT INTO challenges (id, user_id, name, description, rules, status)
VALUES 
  (uuid_generate_v4(), 'SEU-USER-ID-AQUI', 'Personalizado - $25000', 'Desafio personalizado de $25K', 
   '{"firmName": "Personalizado", "accountSize": 25000, "profitTarget": 2500, "dailyDrawdown": 1250, "overallDrawdown": 2500}'::JSONB,
   '{"isPassed": false, "isDailyDrawdownViolated": false, "isOverallDrawdownViolated": false, "currentEquity": 25000}'::JSONB);

-- Para verificar se os desafios foram inseridos corretamente, execute:
-- SELECT * FROM challenges; 