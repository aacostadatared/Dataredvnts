/*
  # Update sales_forecast with correct test data
  
  ## Data Load
  - Clear existing forecast data
  - Load 4 test cases with real DataRed sales scenarios
  - All data matches the business requirements
*/

-- Clear existing data
DELETE FROM sales_forecast;

-- Insert corrected test data
INSERT INTO sales_forecast (forecast_month, client_name, service_name, total_value, stage, probability, observations, assigned_executive) VALUES
  ('Junio 2026', 'La Cascada', 'Nube', 8000, 'contacto_inicial', 25, 'Primer contacto realizado, requiere propuesta técnica', 'andres'),
  ('Junio 2026', 'Seguros Atlántida', 'Nube', 12000, 'propuesta_enviada', 65, 'Propuesta enviada hace 2 semanas, esperando respuesta', 'jefa'),
  ('Mayo 2026', 'RR Donnelly', 'Nube', 15000, 'presentacion_demo', 75, 'Demo técnica exitosa, en negociación de términos', 'jefa'),
  ('Mayo 2026', 'Banco de los Trabajadores', 'Colocación', 5000, 'cierre_perdido', 0, 'Cliente eligió a competidor por precio', 'andres')
ON CONFLICT DO NOTHING;
