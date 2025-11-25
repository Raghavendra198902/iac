-- Sample Data for Business Architecture

DO $$
DECLARE
    cap_customer_mgmt UUID;
    cap_order_mgmt UUID;
    cap_product_mgmt UUID;
    cap_supply_chain UUID;
    cap_finance UUID;
    cap_hr UUID;
    cap_it_mgmt UUID;
    cap_analytics UUID;
    
    proc_onboarding UUID;
    proc_order_processing UUID;
    proc_inventory UUID;
BEGIN
    -- Insert Business Capabilities (Level 1 - Core)
    INSERT INTO ea_business_capabilities (name, description, category, level, maturity_level, criticality, investment_priority, status)
    VALUES 
        ('Customer Relationship Management', 'Manage all customer interactions and relationships', 'Core', 1, 'Defined', 'Critical', 'High', 'active'),
        ('Order Management', 'Process and fulfill customer orders', 'Core', 1, 'Quantitatively Managed', 'Critical', 'High', 'active'),
        ('Product Management', 'Manage product lifecycle and catalog', 'Core', 1, 'Managed', 'High', 'Medium', 'active'),
        ('Supply Chain Management', 'Manage suppliers and inventory', 'Core', 1, 'Defined', 'Critical', 'High', 'active'),
        ('Financial Management', 'Manage financial operations and reporting', 'Supporting', 1, 'Quantitatively Managed', 'Critical', 'Medium', 'active'),
        ('Human Resources', 'Manage employee lifecycle and development', 'Supporting', 1, 'Managed', 'High', 'Medium', 'active'),
        ('IT Management', 'Manage technology infrastructure and services', 'Supporting', 1, 'Defined', 'High', 'High', 'active'),
        ('Business Analytics', 'Provide insights and business intelligence', 'Strategic', 1, 'Managed', 'High', 'High', 'active'),
        ('Marketing & Sales', 'Drive customer acquisition and retention', 'Core', 1, 'Defined', 'High', 'High', 'active'),
        ('Compliance & Risk', 'Manage regulatory compliance and risk', 'Supporting', 1, 'Defined', 'Critical', 'Medium', 'active');

    -- Get IDs for reference
    SELECT id INTO cap_customer_mgmt FROM ea_business_capabilities WHERE name = 'Customer Relationship Management' AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO cap_order_mgmt FROM ea_business_capabilities WHERE name = 'Order Management' AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO cap_product_mgmt FROM ea_business_capabilities WHERE name = 'Product Management' AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO cap_supply_chain FROM ea_business_capabilities WHERE name = 'Supply Chain Management' AND deleted_at IS NULL LIMIT 1;

    -- Insert Business Processes
    INSERT INTO ea_business_processes (name, description, capability_id, process_type, owner, automation_level, efficiency_score, complexity, frequency, cycle_time, cost_per_execution, status)
    VALUES 
        ('Customer Onboarding', 'Process for onboarding new customers', cap_customer_mgmt, 'Core', 'Sales Operations', 65, 78, 'Medium', 'Daily', '2 hours', 125.00, 'active'),
        ('Order Processing', 'End-to-end order fulfillment process', cap_order_mgmt, 'Core', 'Operations', 85, 92, 'Medium', 'Continuous', '30 minutes', 45.00, 'active'),
        ('Customer Support Ticket Resolution', 'Handle customer inquiries and issues', cap_customer_mgmt, 'Support', 'Customer Service', 45, 72, 'Low', 'Continuous', '4 hours', 75.00, 'active'),
        ('Inventory Management', 'Track and manage inventory levels', cap_supply_chain, 'Core', 'Supply Chain', 70, 85, 'Medium', 'Continuous', '15 minutes', 25.00, 'active'),
        ('Product Catalog Update', 'Maintain product information and pricing', cap_product_mgmt, 'Support', 'Product Team', 55, 80, 'Low', 'Daily', '1 hour', 50.00, 'active'),
        ('Supplier Evaluation', 'Assess and qualify suppliers', cap_supply_chain, 'Management', 'Procurement', 30, 68, 'High', 'Quarterly', '2 weeks', 5000.00, 'active'),
        ('Invoice Processing', 'Process accounts payable/receivable', cap_order_mgmt, 'Support', 'Finance', 90, 95, 'Low', 'Daily', '10 minutes', 15.00, 'active'),
        ('Campaign Management', 'Plan and execute marketing campaigns', cap_customer_mgmt, 'Core', 'Marketing', 50, 75, 'High', 'Monthly', '3 weeks', 8000.00, 'active'),
        ('Return Processing', 'Handle product returns and refunds', cap_order_mgmt, 'Support', 'Operations', 60, 70, 'Medium', 'Daily', '45 minutes', 65.00, 'active'),
        ('Quality Assurance', 'Ensure product quality standards', cap_product_mgmt, 'Core', 'Quality Team', 40, 82, 'Medium', 'Continuous', '2 hours', 150.00, 'active'),
        ('Customer Feedback Collection', 'Gather and analyze customer feedback', cap_customer_mgmt, 'Support', 'CX Team', 75, 88, 'Low', 'Continuous', '5 minutes', 10.00, 'active'),
        ('Demand Forecasting', 'Predict future product demand', cap_supply_chain, 'Management', 'Planning', 80, 85, 'High', 'Weekly', '4 hours', 200.00, 'active');

    -- Insert Business Services
    INSERT INTO ea_business_services (name, description, service_type, capability_id, owner, consumers, sla_target, availability, usage_volume, revenue_impact, status)
    VALUES 
        ('Customer Portal', 'Self-service portal for customers', 'External', cap_customer_mgmt, 'Digital Team', '["Customers", "Partners"]', '99.9% uptime', '24/7', '50,000 sessions/day', 'High', 'active'),
        ('Order API', 'RESTful API for order management', 'External', cap_order_mgmt, 'API Team', '["Partners", "Mobile App", "Web"]', '99.95% uptime', '24/7', '100,000 calls/day', 'High', 'active'),
        ('Product Information Service', 'Centralized product data service', 'Internal', cap_product_mgmt, 'Product Team', '["Sales", "Marketing", "Support"]', '99.5% uptime', 'Business Hours', '25,000 queries/day', 'Medium', 'active'),
        ('Inventory Lookup Service', 'Real-time inventory availability', 'Internal', cap_supply_chain, 'Operations', '["Sales", "Web", "Warehouse"]', '99.9% uptime', '24/7', '75,000 queries/day', 'High', 'active'),
        ('Payment Processing', 'Secure payment gateway integration', 'Partner', cap_order_mgmt, 'Finance', '["Web", "Mobile", "POS"]', '99.99% uptime', '24/7', '30,000 transactions/day', 'High', 'active'),
        ('Customer Analytics Dashboard', 'Customer insights and reporting', 'Internal', cap_customer_mgmt, 'Analytics Team', '["Executives", "Sales", "Marketing"]', '99% uptime', 'Business Hours', '500 users', 'Medium', 'active'),
        ('Notification Service', 'Multi-channel customer notifications', 'Internal', cap_customer_mgmt, 'IT Operations', '["All Systems"]', '99.5% uptime', '24/7', '200,000 notifications/day', 'Medium', 'active'),
        ('Supplier Portal', 'Portal for supplier collaboration', 'External', cap_supply_chain, 'Procurement', '["Suppliers"]', '99% uptime', 'Business Hours', '500 active suppliers', 'Medium', 'active');

    -- Insert Value Streams
    INSERT INTO ea_value_streams (name, description, category, stages, lead_time, throughput, quality_score, customer_satisfaction, annual_value, status)
    VALUES 
        ('Customer Acquisition', 'From lead to paying customer', 'Customer-facing', 
         '["Lead Generation", "Lead Qualification", "Sales Engagement", "Contract Negotiation", "Onboarding"]',
         '14 days', '1,200 customers/month', 85, 88, 24500000.00, 'active'),
        ('Order to Cash', 'Complete order fulfillment cycle', 'Customer-facing',
         '["Order Placement", "Payment Processing", "Order Fulfillment", "Delivery", "Invoice"]',
         '3 days', '15,000 orders/month', 92, 90, 48000000.00, 'active'),
        ('Product Development', 'From concept to market launch', 'Internal',
         '["Ideation", "Design", "Development", "Testing", "Launch"]',
         '6 months', '4 products/year', 88, 85, 12000000.00, 'active'),
        ('Customer Support', 'Issue resolution and satisfaction', 'Customer-facing',
         '["Ticket Creation", "Triage", "Investigation", "Resolution", "Closure"]',
         '8 hours', '5,000 tickets/month', 82, 87, 0.00, 'active'),
        ('Supply Chain Optimization', 'Supplier to warehouse efficiency', 'Internal',
         '["Demand Planning", "Supplier Selection", "Procurement", "Quality Check", "Warehousing"]',
         '21 days', '500 shipments/month', 90, 80, 8500000.00, 'active'),
        ('Customer Retention', 'Ongoing customer engagement', 'Customer-facing',
         '["Satisfaction Monitoring", "Proactive Outreach", "Value Addition", "Renewal", "Upsell"]',
         'Continuous', '800 engagements/month', 86, 92, 18000000.00, 'active');

    -- Insert Capability-Application Mappings
    INSERT INTO ea_capability_applications (capability_id, application_name, fit_score)
    SELECT id, 'Salesforce CRM', 90 FROM ea_business_capabilities WHERE name = 'Customer Relationship Management' AND deleted_at IS NULL
    UNION ALL
    SELECT id, 'SAP ERP', 85 FROM ea_business_capabilities WHERE name = 'Order Management' AND deleted_at IS NULL
    UNION ALL
    SELECT id, 'Oracle Inventory', 82 FROM ea_business_capabilities WHERE name = 'Supply Chain Management' AND deleted_at IS NULL
    UNION ALL
    SELECT id, 'Workday HCM', 88 FROM ea_business_capabilities WHERE name = 'Human Resources' AND deleted_at IS NULL
    UNION ALL
    SELECT id, 'Tableau Analytics', 92 FROM ea_business_capabilities WHERE name = 'Business Analytics' AND deleted_at IS NULL;

    -- Insert Process Metrics
    SELECT id INTO proc_order_processing FROM ea_business_processes WHERE name = 'Order Processing' AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO proc_inventory FROM ea_business_processes WHERE name = 'Inventory Management' AND deleted_at IS NULL LIMIT 1;

    IF proc_order_processing IS NOT NULL THEN
        INSERT INTO ea_process_metrics (process_id, metric_name, metric_value, metric_unit, measurement_date)
        VALUES 
            (proc_order_processing, 'Average Processing Time', 28.5, 'minutes', CURRENT_DATE - INTERVAL '1 day'),
            (proc_order_processing, 'Success Rate', 98.5, 'percent', CURRENT_DATE - INTERVAL '1 day'),
            (proc_order_processing, 'Daily Volume', 512, 'orders', CURRENT_DATE - INTERVAL '1 day');
    END IF;

    IF proc_inventory IS NOT NULL THEN
        INSERT INTO ea_process_metrics (process_id, metric_name, metric_value, metric_unit, measurement_date)
        VALUES 
            (proc_inventory, 'Stock Accuracy', 96.2, 'percent', CURRENT_DATE),
            (proc_inventory, 'Turnover Rate', 8.5, 'times/year', CURRENT_DATE);
    END IF;

END $$;
